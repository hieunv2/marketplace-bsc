import React from "react";

const Web3Context = React.createContext({
  account: null,
  balance: 0,
  networkId: null,
  loadAccount: () => {},
  loadBalance: () => {},
  loadNetworkId: () => {},
});

export default Web3Context;
