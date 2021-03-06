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
import NFTLending from "../../components/Content/NFTCollection/Lending";
import MyNFT from "../../components/Content/NFTCollection/NFTCollection";
import Spinner from "../../components/Layout/Spinner";

import Grid from "@mui/material/Grid";

export const Header = (props) => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

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
          </div>
          <div className="container">
            <Grid>
              <p className="title">Recently Listed</p>
              {!marketplaceCtx.mktIsLoading && <NFTLending />}
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
