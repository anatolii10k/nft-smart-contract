const { assert } = require("chai");
const XDVToken = artifacts.require("KLIP");

contract("XDVController: registerMinter()", (accounts) => {
  const accountNotary = accounts[2];
  const accountDataProvider = accounts[1];
  let xdvContract;

  before(async () => {
    xdvContract = await XDVToken.deployed();
  });

  it("should create a new minter", async () => {
    const res = await xdvContract.registerMinter(
      "NOTARIO 9VNO - APOSTILLADO",
      "0x0a2Cd4F28357D59e9ff26B1683715201Ea53Cc3b",
      false,
      web3.utils.toWei("20"),
      {
        from: accountDataProvider,
      },
    );

    const documentMinterAddress = res.logs[0].args.minter;
    assert.strictEqual(documentMinterAddress, accountDataProvider);
  });

  it("should create the Data Provider", async () => {
    // Starting Document
    const result = await xdvContract.requestDataProviderService(
      "did:test:1",
      accountDataProvider,
      `did:eth:${accountNotary}`,
      "ipfs://test",
      "Lorem Ipsum",
    );
    const event = result.receipt.logs[0];

    assert.strictEqual(event.event, "DocumentAnchored");
    assert.strictEqual(event.args.id.toString(), "0");
    assert.strictEqual(event.args.user, accounts[0]);
    assert.strictEqual(event.args.documentURI, "ipfs://test");
  });
});
