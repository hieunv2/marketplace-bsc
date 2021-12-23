import React, { useContext, useEffect } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import web3 from "./connection/web3";
import Navbar from "./components/Layout/Navbar";
import Main from "./components/Content/Main";
import Web3Context from "./store/web3-context";
import CollectionContext from "./store/collection-context";
import MarketplaceContext from "./store/marketplace-context";
import NFTCollection from "./abis/NFTCollection.json";
import NFTMarketplace from "./abis/NFTMarketplace.json";

import { Navigation } from "./containers/Navbar";
import { Header } from "./containers/Headers";
import { Admin } from "./containers/Admin";
import "./App.css";

const App = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

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

      web3Ctx.loadBalance(web3, account);

      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);

      // Load Contracts
      const nftContract = collectionCtx.loadContract(web3);

      const mktContract = marketplaceCtx.loadContract(web3);

      if (nftContract) {
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);

        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);

        // Load Collection
        collectionCtx.loadLending(web3);

        // Load Collection
        collectionCtx.loadRenting(web3);

        // Event subscription
        nftContract.events
          .Transfer()
          .on("data", (event) => {
            collectionCtx.updateCollection(
              nftContract,
              event.returnValues.tokenId,
              event.returnValues.to
            );
          })
          .on("error", (error) => {
            console.log(error);
          });

        mktContract.events
          .Lend()
          .on("data", (event) => {
            collectionCtx.updateLending(
              nftContract,
              event.returnValues.lender,
              event.returnValues.tokenId,
              event.returnValues.maxDuration,
              event.returnValues.price
            );
          })
          .on("error", (error) => {
            console.log(error);
          });

        mktContract.events
          .CancelLending()
          .on("data", (event) => {
            collectionCtx.cancelLending(event.returnValues.tokenId);
          })
          .on("error", (error) => {
            console.log(error);
          });

        mktContract.events
          .Rent()
          .on("data", (event) => {
            collectionCtx.updateRenting(
              collectionCtx,
              nftContract,
              event.returnValues.rentingId
            );
          })
          .on("error", (error) => {
            console.log(error);
          });
      } else {
        window.alert(
          "NFTCollection contract not deployed to detected network."
        );
      }

      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);

      // Metamask Event Subscription - Account changed
      window.ethereum.on("accountsChanged", (accounts) => {
        web3Ctx.loadAccount(web3);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on("chainChanged", (chainId) => {
        window.location.reload();
      });
    };

    loadBlockchainData();
  }, []);

  return (
    <React.Fragment>
      <Router>
        <Routes>
          <Route path="/" exact strict path="" element={<Header />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </React.Fragment>
  );
};

export default App;
