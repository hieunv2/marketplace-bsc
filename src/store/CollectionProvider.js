import { useReducer } from "react";

import CollectionContext from "./collection-context";

import { NFT_ADDRESS, RENT_ADDRESS } from "../common/config";
import ABI from "../abis/NFTCollection.json";
import ABI_RENT from "../abis/NFTRenting.json";

const defaultCollectionState = {
  contract: null,
  totalSupply: null,
  collection: [],
  lending: [],
  renting: [],
  nftIsLoading: true,
};

const collectionReducer = (state, action) => {
  if (action.type === "CONTRACT") {
    return { ...state, contract: action.contract };
  }

  if (action.type === "LOADSUPPLY") {
    return { ...state, totalSupply: action.totalSupply };
  }

  if (action.type === "LOADCOLLECTION") {
    return { ...state, collection: action.collection };
  }

  if (action.type === "LOADLENDING") {
    return { ...state, lending: action.lending };
  }

  if (action.type === "LOADRENTING") {
    return { ...state, renting: action.renting };
  }

  if (action.type === "UPDATECOLLECTION") {
    const index = state.collection.findIndex(
      (NFT) => parseInt(NFT.id) === parseInt(action.NFT.id)
    );
    let collection = [];

    if (index === -1) {
      collection = [action.NFT, ...state.collection];
    } else {
      collection = [...state.collection];
    }

    return { ...state, collection: collection };
  }

  if (action.type === "UPDATELENDING") {
    const index = state.lending.findIndex(
      (NFT) => parseInt(NFT.tokenId) === parseInt(action.NFT.tokenId)
    );

    const indexCollection = state.collection.findIndex(
      (NFT) => parseInt(NFT.id) === parseInt(action.NFT.tokenId)
    );

    let lending = [];

    if (index === -1) {
      lending = [...state.lending, action.NFT];
    } else {
      lending = [...state.lending];
    }

    let newCollection = state.collection;
    if (indexCollection !== -1) {
      newCollection.splice(indexCollection, 1);
    }

    return { ...state, lending: lending, collection: newCollection };
  }

  if (action.type === "UPDATERENTING") {
    const index = state.renting.findIndex(
      (NFT) => NFT.tokenId === parseInt(action.renting.tokenId)
    );
    let renting = [];

    if (index === -1) {
      renting = [action.NFT, ...state.renting];
    } else {
      renting = [...state.renting];
    }

    return { ...state, renting: renting };
  }

  if (action.type === "CANCELLENDING") {
    const index = state.lending.findIndex(
      (NFT) => NFT.tokenId === parseInt(action.tokenId)
    );

    let newLending = state.lending;

    if (index !== -1) {
      newLending.splice(index, 1);
    }

    return { ...state, lending: newLending };
  }

  if (action.type === "UPDATEOWNER") {
    const index = state.collection.findIndex(
      (NFT) => NFT.id === parseInt(action.id)
    );
    let collection = [...state.collection];
    collection[index].owner = action.newOwner;

    return { ...state, collection: collection };
  }

  if (action.type === "LOADING") {
    return { ...state, nftIsLoading: action.loading };
  }

  return defaultCollectionState;
};

const CollectionProvider = (props) => {
  const [CollectionState, dispatchCollectionAction] = useReducer(
    collectionReducer,
    defaultCollectionState
  );

  const loadContractHandler = (web3) => {
    const contract = new web3.eth.Contract(ABI, NFT_ADDRESS);
    dispatchCollectionAction({ type: "CONTRACT", contract: contract });
    return contract;
  };

  const loadTotalSupplyHandler = async (contract) => {
    const totalSupply = await contract.methods.totalSupply().call();
    dispatchCollectionAction({ type: "LOADSUPPLY", totalSupply: totalSupply });
    return totalSupply;
  };

  const loadCollectionHandler = async (contract, totalSupply) => {
    let collection = [];

    for (let i = 0; i < totalSupply; i++) {
      const token = await contract.methods.tokenIdToUUID(i).call();
      const owner = await contract.methods.owner().call();
      try {
        const ownerToken = await contract.methods.ownerOf(i).call();
        if (ownerToken.toLowerCase() === owner.toLowerCase()) {
          collection.push({
            id: i,
            uuid: token,
            owner: owner,
          });
        }
      } catch {
        console.error("Something went wrong");
      }
    }
    dispatchCollectionAction({
      type: "LOADCOLLECTION",
      collection: collection,
    });
  };

  const loadLandingHandler = async (web3) => {
    const contract = new web3.eth.Contract(ABI_RENT, RENT_ADDRESS);
    const nftContract = new web3.eth.Contract(ABI, NFT_ADDRESS);
    const owner = await contract.methods.owner().call();
    const nfts = await contract.methods.getTokenLendingsByAddress(owner).call();

    const lending = [];

    for (let i = 0; i < nfts[1].length; i++) {
      try {
        const uuid = await nftContract.methods
          .tokenIdToUUID(parseInt(nfts[1][i]))
          .call();
        lending.push({
          owner,
          tokenId: parseInt(nfts[1][i]),
          uuid: uuid,
          price: parseInt(nfts[0][i][0]) / 10 ** 18,
          duration: parseInt(nfts[0][i][1]) / 3600,
          rentingIds: nfts[0][i][2],
        });
      } catch {
        console.error("Something went wrong");
      }
    }
    dispatchCollectionAction({
      type: "LOADLENDING",
      lending: lending,
    });
  };

  const loadRentingHandler = async (web3) => {
    const contract = new web3.eth.Contract(ABI_RENT, RENT_ADDRESS);
    const nftContract = new web3.eth.Contract(ABI, NFT_ADDRESS);
    const rentingLength = await contract.methods.rentingId().call();

    const renting = [];

    for (let i = 1; i < rentingLength; i++) {
      try {
        const nft = await contract.methods.getTokenRenting(i).call();
        const uuid = await nftContract.methods
          .tokenIdToUUID(parseInt(nft.tokenId))
          .call();
        renting.push({
          tokenId: nft.tokenId,
          uuid: uuid,
          renter: nft.renter,
          duration: nft.duration / 3600,
        });
      } catch {
        console.error("Something went wrong");
      }
    }
    console.log("renting", renting);
    dispatchCollectionAction({
      type: "LOADRENTING",
      renting: renting,
    });
  };

  const updateRentingHandler = async (contract, nftContract, rentingId) => {
    let renting;

    try {
      const nft = await contract.methods.getTokenRenting(rentingId).call();
      console.log("nft", nft);
      const uuid = await nftContract.methods
        .tokenIdToUUID(parseInt(nft.tokenId))
        .call();
      renting = {
        tokenId: nft.tokenId,
        uuid: uuid,
        renter: nft.renter,
        duration: nft.duration,
      };
    } catch {
      console.error("Something went wrong");
    }

    dispatchCollectionAction({
      type: "UPDATERENTING",
      renting: renting,
    });
  };

  const updateLendingHandler = async (
    contract,
    lender,
    tokenId,
    duration,
    price
  ) => {
    let NFT;
    const uuid = await contract.methods.tokenIdToUUID(tokenId).call();
    try {
      NFT = {
        owner: lender,
        tokenId: tokenId,
        uuid: uuid,
        price: parseFloat(price) / 10 ** 18,
        duration: parseFloat(duration) / 3600,
        rentingIds: [],
      };
    } catch {
      console.error("Something went wrong");
    }
    dispatchCollectionAction({ type: "UPDATELENDING", NFT: NFT });
  };

  const cancelLendingHandler = async (tokenId) => {
    dispatchCollectionAction({ type: "CANCELLENDING", tokenId: tokenId });
  };

  const updateCollectionHandler = async (contract, id, owner) => {
    let NFT;
    const uuid = await contract.methods.tokenIdToUUID(id).call();
    try {
      NFT = {
        id: parseInt(id),
        uuid: uuid,
        owner: owner,
      };
    } catch {
      console.error("Something went wrong");
    }
    dispatchCollectionAction({ type: "UPDATECOLLECTION", NFT: NFT });
  };

  const updateOwnerHandler = (id, newOwner) => {
    dispatchCollectionAction({
      type: "UPDATEOWNER",
      id: id,
      newOwner: newOwner,
    });
  };

  const setNftIsLoadingHandler = (loading) => {
    dispatchCollectionAction({ type: "LOADING", loading: loading });
  };

  const collectionContext = {
    contract: CollectionState.contract,
    totalSupply: CollectionState.totalSupply,
    collection: CollectionState.collection,
    nftIsLoading: CollectionState.nftIsLoading,
    lending: CollectionState.lending,
    renting: CollectionState.renting,
    loadContract: loadContractHandler,
    loadTotalSupply: loadTotalSupplyHandler,
    loadCollection: loadCollectionHandler,
    loadLending: loadLandingHandler,
    cancelLending: cancelLendingHandler,
    loadRenting: loadRentingHandler,
    updateCollection: updateCollectionHandler,
    updateLending: updateLendingHandler,
    updateRenting: updateRentingHandler,
    updateOwner: updateOwnerHandler,
    setNftIsLoading: setNftIsLoadingHandler,
  };

  return (
    <CollectionContext.Provider value={collectionContext}>
      {props.children}
    </CollectionContext.Provider>
  );
};

export default CollectionProvider;
