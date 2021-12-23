import { useState, useContext, useRef, createRef } from "react";

import styled from "styled-components";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import web3 from "../../../connection/web3";
import Web3Context from "../../../store/web3-context";
import CollectionContext from "../../../store/collection-context";
import MarketplaceContext from "../../../store/marketplace-context";
import { formatPrice } from "../../../helpers/utils";

import NFT_IMAGE from "../../../assets/images/nft.jpg";

const NFTCollection = () => {
  const [open, setOpen] = useState(false);
  const [nft, setNft] = useState({});
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleClickOpen = (nft) => {
    setOpen(true);
    setNft(nft);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);

  const priceRefs = useRef([]);
  if (priceRefs.current.length !== collectionCtx.collection.length) {
    priceRefs.current = Array(collectionCtx.collection.length)
      .fill()
      .map((_, i) => priceRefs.current[i] || createRef());
  }

  const handleLend = () => {
    const enteredPrice = web3.utils.toWei(price, "ether");
    if (parseFloat(price) > 0 && parseFloat(duration) > 0) {
      collectionCtx.contract.methods
        .approve(marketplaceCtx.contract.options.address, nft)
        .send({ from: web3Ctx.account })
        .on("transactionHash", (hash) => {
          marketplaceCtx.setMktIsLoading(true);
        })
        .on("receipt", (receipt) => {
          marketplaceCtx.contract.methods
            .lendToken(nft, enteredPrice, parseFloat(duration) * 3600)
            .send({ from: web3Ctx.account })
            .on("receipt", (receipt1) => {
              marketplaceCtx.setMktIsLoading(false);
            })
            .on("error", (error) => {
              window.alert(
                "Something went wrong when pushing to the blockchain"
              );
              marketplaceCtx.setMktIsLoading(false);
            });
          marketplaceCtx.setMktIsLoading(false);
        });
    }
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
        return (
          <div
            key={key}
            className="col-md-2 m-3 pb-3 card-nft border-info portfolio-item"
          >
            <div onClick={() => handleClickOpen(NFT.id)}>
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
            </div>
          </div>
        );
      })}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>NFT RENTING</DialogTitle>
        <DialogContent>
          <DialogContentText>ABC</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            id="price"
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="BNB..."
            label="Price"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            margin="dense"
            type="number"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            id="duration"
            inputProps={{ min: 0, step: 0.1 }}
            placeholder="hour..."
            label="Duration"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleLend}>RENT</Button>
        </DialogActions>
      </Dialog>
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
