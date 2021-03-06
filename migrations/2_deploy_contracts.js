const NFTCollection = artifacts.require("NFTCollection");
const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function (deployer) {
  await deployer.deploy(NFTCollection);

  const deployedNFT =  await NFTCollection.deployed();
  const NFTAddress = await deployedNFT.address;
  const serviceFee = 1000;
  await deployer.deploy(NFTMarketplace, NFTAddress, serviceFee);
};