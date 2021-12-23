import { useContext, useRef, createRef } from "react";

import web3 from "../../../connection/web3";
import Web3Context from "../../../store/web3-context";
import CollectionContext from "../../../store/collection-context";
import MarketplaceContext from "../../../store/marketplace-context";
import { formatPrice } from "../../../helpers/utils";
import NFT_IMAGE from "../../../assets/images/nft.jpg";
import eth from "../../../img/eth.png";

const NFTCollection = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  console.log("1", collectionCtx.renting);

  const priceRefs = useRef([]);
  if (priceRefs.current.length !== collectionCtx.collection.length) {
    priceRefs.current = Array(collectionCtx.collection.length)
      .fill()
      .map((_, i) => priceRefs.current[i] || createRef());
  }

  return (
    <div className="row text-center">
      {collectionCtx.renting.map((NFT, key) => {
        console.log("1", NFT);
        return NFT?.renter === web3Ctx.account ? (
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
              <p className="fw-light fs-6">{`${NFT.renter.substr(
                0,
                7
              )}...${NFT.renter.substr(NFT.renter.length - 7)}`}</p>

              <div className={"card-body"}>
                <b>{`${NFT.uuid}`}</b>
              </div>
              <div className="row">
                <div className="d-grid gap-2 col-5 mx-auto">
                  <button
                    onClick={() => alert("go data")}
                    className="btn btn-success"
                  >
                    GO
                  </button>
                </div>
                <div className="col-7 d-flex justify-content-end">
                  <p className="text-start">
                    <b>{`${NFT.duration} hour`}</b>
                  </p>
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
