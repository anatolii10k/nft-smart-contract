const { assert } = require("chai");
const Bluebird = require("bluebird");
const MockCoin = artifacts.require("MockCoin");
const XDVToken = artifacts.require("XDVToken");

contract("XDVToken: Paused Contract", (accounts) => {
  const accountNotary = accounts[0];
  const accountDataProvider = accounts[1];
  const accountTokenOwner = accounts[2];
  let erc20Contract;
  let xdvContract;
  let requestId;

  before(async () => {
    [erc20Contract, xdvContract] = await Bluebird.all([
      MockCoin.deployed(),
      XDVToken.deployed(),
    ]);

    // Mint erc20s and approve transfer of them
    await Bluebird.all([
      erc20Contract.mint(accountTokenOwner, web3.utils.toWei("200")),
      erc20Contract.approve(xdvContract.address, web3.utils.unitMap.tether, {
        from: accountTokenOwner,
      }),
    ]);
  });

  beforeEach(async () => {
    // Starting Document
    const result = await xdvContract.requestDataProviderService(
      "did:test:1",
      accountDataProvider,
      `did:eth:${accountNotary}`,
      "ipfs://test",
      "Lorem Ipsum",
    );
    requestId = result.receipt.logs[0].args.id;
  });

  afterEach(async () => {
    const isPaused = await xdvContract.paused();
    if (isPaused) {
      await xdvContract.unpause();
    }
  });

  it("should not transfer if the contract is paused", async () => {
    assert.isFalse(await xdvContract.paused(), "Must not start paused");
    await xdvContract.pause();

    try {
      await xdvContract.mint(
        requestId,
        accountTokenOwner,
        accountNotary,
        "ipfs://test2",
      );

      assert.fail("Should not arrive here");
    } catch (error) {
      assert.equal(error.reason, "ERC721Pausable: token transfer while paused");
    }
  });

  it("only owner should be able to pause the contract", async () => {
    try {
      await xdvContract.pause({ from: accountTokenOwner });
      assert.fail("Should not arrive here");
    } catch (error) {
      assert.equal(error.reason, "Ownable: caller is not the owner");
    }
  });
});
