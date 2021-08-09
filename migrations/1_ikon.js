const IkonicCoin = artifacts.require("IkonicCoin");
const IkonicMarket = artifacts.require("Marketplace");

module.exports = async (deployer) => {
  await deployer.deploy(IkonicCoin);
  const coinContract = await IkonicCoin.deployed();
  const coinAddress = coinContract.address;
  //const coinAddress = '0x301Fe0CF20d1819D8F7eBAF3Ba80C805587d693D'; //Mock coin address

  await deployer.deploy(IkonicMarket, coinAddress, 1, '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');

  // Setup default shares
  const datatoken = await IkonicMarket.deployed();
  await Promise.all([
    datatoken.setPublicationFee(web3.utils.toWei("0.1")),
  ]);
};
