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
    await web3Ctx.loadAccount(web3);
  };

  let etherscanUrl = "https://testnet.bscscan.com/";

  return (
    <div
      style={{
        fontSize: 20,
        position: "absolute",
        top: 20,
        right: "10%",
      }}
    >
      <Grid container>
        {web3Ctx.account ? (
          <div
            style={{ padding: 10, backgroundColor: "grey", borderRadius: 20 }}
          >
            <span>{(web3Ctx.balance / 10 ** 18).toFixed(2)} BNB: </span>
            <a
              href={`${etherscanUrl}/address/${web3Ctx.account}`}
              target="blank"
              rel="noopener noreferrer"
            >
              {web3Ctx.account.slice(0, 6) +
                "..." +
                web3Ctx.account.slice(38, 42)}
            </a>
          </div>
        ) : (
          <ButtonCustom onClick={() => connectWalletHandler()}>
            Connect wallet
          </ButtonCustom>
        )}
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
