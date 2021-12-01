import { useContext, useState } from "react";

import Web3Context from "../../store/web3-context";
import MarketplaceContext from "../../store/marketplace-context";
import web3 from "../../connection/web3";
import { formatPrice } from "../../helpers/utils";

import Grid from "@mui/material/Grid";

import styled from "styled-components";

const Navbar = () => {
  const [fundsLoading, setFundsLoading] = useState(false);

  const web3Ctx = useContext(Web3Context);
  const marketplaceCtx = useContext(MarketplaceContext);

  const connectWalletHandler = async () => {
    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.error(error);
    }

    // Load accounts
    web3Ctx.loadAccount(web3);
  };

  const claimFundsHandler = () => {
    marketplaceCtx.contract.methods
      .claimFunds()
      .send({ from: web3Ctx.account })
      .on("transactionHash", (hash) => {
        setFundsLoading(true);
      })
      .on("error", (error) => {
        window.alert("Something went wrong when pushing to the blockchain");
        setFundsLoading(false);
      });
  };

  // Event ClaimFunds subscription
  marketplaceCtx.contract.events
    .ClaimFunds()
    .on("data", (event) => {
      marketplaceCtx.loadUserFunds(marketplaceCtx.contract, web3Ctx.account);
      setFundsLoading(false);
    })
    .on("error", (error) => {
      console.log(error);
    });

  let etherscanUrl = "https://testnet.bscscan.com/";

  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        right: "10%",
        width: "50%",
        zIndex: 100,
      }}
    >
      <Grid container>
        <Grid item xs={12} sm={7}>
          {web3Ctx.account && (
            <div style={{ fontSize: 20 }}>
              <span>My account: </span>
              <a
                href={`${etherscanUrl}/address/${web3Ctx.account}`}
                target="blank"
                rel="noopener noreferrer"
              >
                {web3Ctx.account.slice(0, 10) +
                  "..." +
                  web3Ctx.account.slice(35, 46)}
              </a>
            </div>
          )}
        </Grid>
        <Grid item xs={12} sm={5}>
          {marketplaceCtx.userFunds > 0 && !fundsLoading && (
            <ButtonCustom onClick={claimFundsHandler}>
              {`CLAIM ${formatPrice(marketplaceCtx.userFunds)} BNB`}
            </ButtonCustom>
          )}
          {fundsLoading && (
            <div class="d-flex justify-content-center text-info">
              <div class="spinner-border" role="status">
                <span class="sr-only"></span>
              </div>
            </div>
          )}
          {!web3Ctx.account && (
            <ButtonCustom onClick={() => connectWalletHandler()}>
              Connect wallet
            </ButtonCustom>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Navbar;

const ButtonCustom = styled.a`
  text-decoration: none;
  text-align: center;

  cursor: pointer;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 97px rgba(255, 86, 246, 0.51);

  font-size: 16px;
  color: white;
  padding: 18px 36px 19px;
  background: #f66614;
  border-radius: 25.5px;
`;
