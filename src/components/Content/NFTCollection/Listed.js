import { useContext, useRef, createRef } from "react";

import styled from "styled-components";

import web3 from "../../../connection/web3";
import Web3Context from "../../../store/web3-context";
import CollectionContext from "../../../store/collection-context";
import MarketplaceContext from "../../../store/marketplace-context";
import { formatPrice } from "../../../helpers/utils";
import eth from "../../../img/eth.png";

const NFTCollection = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const priceRefs = useRef([]);
  if (priceRefs.current.length !== collectionCtx.collection.length) {
    priceRefs.current = Array(collectionCtx.collection.length)
      .fill()
      .map((_, i) => priceRefs.current[i] || createRef());
  }

  const makeOfferHandler = (event, id, key) => {
    event.preventDefault();

    const enteredPrice = web3.utils.toWei(
      priceRefs.current[key].current.value,
      "ether"
    );

    collectionCtx.contract.methods
      .approve(marketplaceCtx.contract.options.address, id)
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        marketplaceCtx.setMktIsLoading(true);
      })
      .on("receipt", (receipt) => {
        marketplaceCtx.contract.methods
          .makeOffer(id, enteredPrice)
          .send({ from: web3Ctx.account })
          .on("error", (error) => {
            window.alert("Something went wrong when pushing to the blockchain");
            marketplaceCtx.setMktIsLoading(false);
          });
      });
  };

  const buyHandler = (buyIndex) => {
    marketplaceCtx.contract.methods
      .fillOffer(marketplaceCtx.offers[buyIndex].offerId)
      .send({
        from: web3Ctx.account,
        value: marketplaceCtx.offers[buyIndex].price,
      })
      .on("transactionHash", (hash) => {
        marketplaceCtx.setMktIsLoading(true);
      })
      .on("error", (error) => {
        window.alert("Something went wrong when pushing to the blockchain");
        marketplaceCtx.setMktIsLoading(false);
      });
  };

  const cancelHandler = (event) => {
    const cancelIndex = parseInt(event.target.value);
    marketplaceCtx.contract.methods
      .cancelOffer(marketplaceCtx.offers[cancelIndex].offerId)
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        marketplaceCtx.setMktIsLoading(true);
      })
      .on("error", (error) => {
        window.alert("Something went wrong when pushing to the blockchain");
        marketplaceCtx.setMktIsLoading(false);
      });
  };

  return (
    <div className="row text-center">
      {collectionCtx.collection.map((NFT, key) => {
        const index = marketplaceCtx.offers
          ? marketplaceCtx.offers.findIndex((offer) => offer.id === NFT.id)
          : -1;
        const owner =
          index === -1 ? NFT.owner : marketplaceCtx.offers[index].user;
        const price =
          index !== -1
            ? formatPrice(marketplaceCtx.offers[index].price).toFixed(2)
            : null;

        return index !== -1 && owner !== web3Ctx.account ? (
          <div
            key={key}
            className="col-md-2 m-3 pb-3 card-nft border-info portfolio-item"
          >
            <div className="hover-bg">
              <div className="hover-text">
                <ButtonBuy onClick={() => buyHandler(index)}>BUY NOW</ButtonBuy>
              </div>
              <img
                src={`https://ipfs.infura.io/ipfs/${NFT.img}`}
                className="card-img-bottom"
                alt={`NFT ${key}`}
              />
              <p className="fw-light fs-6">{`${owner.substr(
                0,
                7
              )}...${owner.substr(owner.length - 7)}`}</p>

              <div className={"card-body"}>
                <div className="row">
                  <div className="col-5">
                    <p style={{ color: "white", fontSize: 20 }}>{NFT.title}</p>
                  </div>
                  <div className="col-7 d-flex justify-content-end">
                    <img
                      src={eth}
                      width="25"
                      height="25"
                      className="align-center float-start"
                      alt="price icon"
                    ></img>
                    <p className="text-start">
                      <b>{`${price}`}</b>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null;
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
