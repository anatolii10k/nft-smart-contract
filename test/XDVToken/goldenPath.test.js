const { assert } = require("chai");
const Bluebird = require("bluebird");
const MockCoin = artifacts.require("MockCoin");
const XDVToken = artifacts.require("XDVToken");

contract("XDVToken: Golden Path", (accounts) => {
  const accountNotary = accounts[0];
  const accountDataProvider = accounts[1];
  const accountTokenOwner = accounts[2];
  let tokenId;
  let erc20Contract;
  let xdvContract;

  before(async () => {
    // Get the contracts
    [erc20Contract, xdvContract] = await Bluebird.all([
      MockCoin.deployed(),
      XDVToken.deployed(),
    ]);
  });

  it("should mint the tokens", async () => {
    // Starting Document
    const documentResult = await xdvContract.requestDataProviderService(
      "did:test:1",
      accountDataProvider,
      `did:eth:${accountNotary}`,
      "ipfs://test",
      "Lorem Ipsum",
    );
    const requestId = documentResult.receipt.logs[0].args.id;

    // Mint the token
    const mintResult = await xdvContract.mint(
      requestId,
      accountTokenOwner,
      accountNotary,
      "ipfs://test2",
    );

    ({ tokenId } = mintResult.logs.find((e) => e.event === "Transfer").args);
    const { owner, balance } = await Bluebird.props({
      owner: xdvContract.ownerOf(tokenId),
      balance: xdvContract.balanceOf(accountTokenOwner),
    });
    assert.equal(owner, accountTokenOwner);
    assert.equal(balance, 1);
  });

  it("should save the fileUri", async () => {
    const fileUri = await xdvContract.fileUri(tokenId);
    expect(fileUri).to.equal("ipfs://test2");
  });

  it("should burn and charge the account", async () => {
    // Mint erc20s and approve transfer of them
    await Bluebird.all([
      erc20Contract.mint(accountTokenOwner, web3.utils.toWei("200")),
      erc20Contract.approve(xdvContract.address, web3.utils.unitMap.tether, {
        from: accountTokenOwner,
      }),
    ]);

    // Get Starting Values
    const [
      startingClientBalance,
      startingContractBalance,
      startingAddressBalance,
      feeForPaymentAddress,
      feeForContract,
    ] = await Bluebird.all([
      erc20Contract.balanceOf(accountTokenOwner),
      erc20Contract.balanceOf(xdvContract.address),
      erc20Contract.balanceOf(accountNotary),
      xdvContract.serviceFeeForPaymentAddress(),
      xdvContract.serviceFeeForContract(),
    ]);

    // Burn the token
    const result = await xdvContract.burn(tokenId, {
      from: accountTokenOwner,
    });

    // Execution Results
    const event = result.logs.find((e) => e.event === "ServiceFeePaid");
    assert.isNotNull(event, "The ServiceFeePaid event must exist");
    const { args } = event;
    assert.equal(
      args.from,
      accountTokenOwner,
      "Should have come from NFT Owner",
    );
    assert.equal(
      args.paymentAddress,
      accountNotary,
      "Should sent the Fee to the correct address",
    );
    assert.equal(
      args.paidToContract.toString(),
      feeForContract.toString(),
      "Should Pay the Contract its correct share",
    );
    assert.equal(
      args.paidToPaymentAddress.toString(),
      feeForPaymentAddress.toString(),
      "Should Pay the Payment Address its Fee",
    );
    assert.equal(
      args.tokenId.toString(),
      tokenId.toString(),
      "Must have returned the correct Token ID",
    );

    // New token Balances
    const {
      clientBalance,
      contractBalance,
      paymentAddressBalance,
    } = await Bluebird.props({
      contractBalance: erc20Contract.balanceOf(xdvContract.address),
      paymentAddressBalance: erc20Contract.balanceOf(accountNotary),
      clientBalance: erc20Contract.balanceOf(accountTokenOwner),
    });

    // Make sure the new balances are correct!
    const totalFeePaid = feeForContract.add(feeForPaymentAddress);
    assert.equal(
      clientBalance.toString(),
      startingClientBalance.sub(totalFeePaid).toString(),
      "The client's balance must have been reduced",
    );
    assert.equal(
      contractBalance.toString(),
      startingContractBalance.add(feeForContract).toString(),
      "The contract must have received tokens",
    );
    assert.equal(
      paymentAddressBalance.toString(),
      startingAddressBalance.add(feeForPaymentAddress).toString(),
      "The Payment Address must have received tokens",
    );
  });

  it("should preserve the File Uri for later retrieval", async () => {
    const fileUri = await xdvContract.fileUri(tokenId);
    expect(fileUri).to.equal("ipfs://test2");
  });

  it("should mint a second token with a different ID", async () => {
    // Starting Document
    const documentResult = await xdvContract.requestDataProviderService(
      "did:test:1",
      accountDataProvider,
      `did:eth:${accountNotary}`,
      "ipfs://test",
      "Lorem Ipsum",
    );
    const requestId = documentResult.receipt.logs[0].args.id;

    // Mint the token
    const mintResult = await xdvContract.mint(
      requestId,
      accountTokenOwner,
      accountNotary,
      "ipfs://test2",
    );

    const event = mintResult.logs.find((e) => e.event === "Transfer");
    const { tokenId: tokenId2 } = event.args;
    expect(tokenId2.toString()).not.equal(tokenId);
  });
});
