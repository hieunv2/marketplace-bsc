import { useState, useContext, useRef, createRef } from "react";

import styled from "styled-components";

import web3 from "../../../connection/web3";
import Web3Context from "../../../store/web3-context";
import CollectionContext from "../../../store/collection-context";
import MarketplaceContext from "../../../store/marketplace-context";
import { formatPrice } from "../../../helpers/utils";

import NFT_IMAGE from "../../../assets/images/nft.jpg";

const NFTCollection = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const cancelHandler = (tokenId) => {
    marketplaceCtx.contract.methods
      .cancelLendingToken(tokenId)
      .send({
        from: web3Ctx.account,
      })
      .on("transactionHash", (hash) => {})
      .on("error", (error) => {
        window.alert("Something went wrong when pushing to the blockchain");
      });
  };

  const rentHandler = (nft) => {
    const enteredPrice = web3.utils.toWei(nft.price.toString(), "ether");
    marketplaceCtx.contract.methods
      .rentToken(nft.owner, nft.tokenId, parseFloat(nft.duration) * 3600)
      .send({
        from: web3Ctx.account,
        value: enteredPrice,
      })
      .on("transactionHash", (hash) => {})
      .on("error", (error) => {
        window.alert("Something went wrong when pushing to the blockchain");
      });
  };

  return (
    <div className="row text-center">
      {collectionCtx.lending?.map((NFT, key) => {
        return (
          NFT.rentingIds.length === 0 && (
            <div
              key={key}
              className="col-md-2 m-3 pb-3 card-nft border-info portfolio-item"
            >
              <div>
                <img
                  src={NFT_IMAGE}
                  className="card-img-bottom"
                  alt={`NFT ${key}`}
                />
                <p className="fw-light fs-6">{`${NFT.owner.substr(
                  0,
                  7
                )}...${NFT.owner.substr(NFT.owner.length - 7)}`}</p>

                <div className={"card-body"}>
                  <b>{`${NFT.uuid}`}</b>
                </div>
                <div>
                  <p>{`${NFT.duration} hour`}</p>
                </div>
                <div className="row">
                  <div className="d-grid gap-2 col-5 mx-auto">
                    {NFT.owner === web3Ctx.account ? (
                      <button
                        onClick={() => cancelHandler(NFT.tokenId)}
                        className="btn btn-danger"
                      >
                        CANCEL
                      </button>
                    ) : (
                      <button
                        onClick={() => rentHandler(NFT)}
                        className="btn btn-success"
                      >
                        RENT
                      </button>
                    )}
                  </div>
                  <div className="col-7 d-flex justify-content-end">
                    <p className="text-start">
                      <b>{`${NFT.price ? NFT.price.toFixed(2) : 0} BNB`}</b>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        );
      })}
    </div>
  );
};

export default NFTCollection;

const ButtonBuy = styled.a`
  background: #0165ff;
  border-radius: 26px;
  cursor: pointer;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 97px rgba(255, 86, 246, 0.51);
  padding: 10px 19px;
  font-size: 16px;
  color: white;
  text-decoration: none;
`;
