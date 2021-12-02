import React, { useContext, useEffect } from "react";
import web3 from "../../connection/web3";
import Navbar from "../../components/Layout/Navbar";

import Web3Context from "../../store/web3-context";
import CollectionContext from "../../store/collection-context";
import MarketplaceContext from "../../store/marketplace-context";
import NFTCollection from "../../abis/NFTCollection.json";
import NFTMarketplace from "../../abis/NFTMarketplace.json";
import MintForm from "../../components/Content/MintNFT/MintForm";
import NFTList from "../../components/Content/NFTCollection/Listed";
import MyNFT from "../../components/Content/NFTCollection/NFTCollection";
import Spinner from "../../components/Layout/Spinner";

import Grid from "@mui/material/Grid";

export const Header = (props) => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  useEffect(() => {
    // Check if the user has Metamask active
    if (!web3) {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      return;
    }

    // Function to fetch all the blockchain data
    const loadBlockchainData = async () => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error(error);
      }

      // Load account
      const account = await web3Ctx.loadAccount(web3);

      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);

      // Load Contracts
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(
        web3,
        NFTCollection,
        nftDeployedNetwork
      );

      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(
        web3,
        NFTMarketplace,
        mktDeployedNetwork
      );

      if (nftContract) {
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);

        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);

        // Event subscription
        nftContract.events
          .Transfer()
          .on("data", (event) => {
            collectionCtx.updateCollection(
              nftContract,
              event.returnValues.tokenId,
              event.returnValues.to
            );
            collectionCtx.setNftIsLoading(false);
          })
          .on("error", (error) => {
            console.log(error);
          });
      } else {
        window.alert(
          "NFTCollection contract not deployed to detected network."
        );
      }

      if (mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);

        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount);

        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);

        // Event OfferFilled subscription
        mktContract.events
          .OfferFilled()
          .on("data", (event) => {
            marketplaceCtx.updateOffer(event.returnValues.offerId);
            collectionCtx.updateOwner(
              event.returnValues.id,
              event.returnValues.newOwner
            );
            marketplaceCtx.setMktIsLoading(false);
          })
          .on("error", (error) => {
            console.log(error);
          });

        // Event Offer subscription
        mktContract.events
          .Offer()
          .on("data", (event) => {
            marketplaceCtx.addOffer(event.returnValues);
            marketplaceCtx.setMktIsLoading(false);
          })
          .on("error", (error) => {
            console.log(error);
          });

        // Event offerCancelled subscription
        mktContract.events
          .OfferCancelled()
          .on("data", (event) => {
            marketplaceCtx.updateOffer(event.returnValues.offerId);
            collectionCtx.updateOwner(
              event.returnValues.id,
              event.returnValues.owner
            );
            marketplaceCtx.setMktIsLoading(false);
          })
          .on("error", (error) => {
            console.log(error);
          });
      } else {
        window.alert(
          "NFTMarketplace contract not deployed to detected network."
        );
      }

      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);

      // Metamask Event Subscription - Account changed
      window.ethereum.on("accountsChanged", (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    };

    loadBlockchainData();
  }, []);

  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  const showContent =
    web3 &&
    collectionCtx.contract &&
    marketplaceCtx.contract &&
    web3Ctx.account;

  return (
    <header id="header" style={{ marginBottom: 50 }}>
      {showNavbar && <Navbar />}
      <div className="intro">
        <div className="overlay">
          <div container>
            <div xs={6}>
              <div className="container">
                <div className="row">
                  <div className="col-md-8 col-md-offset-2 intro-text">
                    <p style={{ color: "white", fontSize: 50 }}>
                      Demo Basic Marketplace
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div xs={6}>
              <div className="container">
                <div className="row">
                  <div className="col-md-8 col-md-offset-2 intro-text">
                    {!collectionCtx.nftIsLoading && <MintForm />}
                    {collectionCtx.nftIsLoading && <Spinner />}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <Grid>
              <p className="title">Recently Listed</p>
              {!marketplaceCtx.mktIsLoading && <NFTList />}
              {marketplaceCtx.mktIsLoading && <Spinner />}
            </Grid>
          </div>
          <div className="container" style={{ marginTop: 50 }}>
            <Grid>
              <p className="title">My NFT</p>
              {!marketplaceCtx.mktIsLoading && <MyNFT />}
              {marketplaceCtx.mktIsLoading && <Spinner />}
            </Grid>
          </div>
        </div>
      </div>
    </header>
  );
};
