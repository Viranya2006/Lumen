import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { LumenMarketplace } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LumenMarketplace Smart Contract", function () {
  let marketplace: LumenMarketplace;
  let owner: HardhatEthersSigner;
  let creator: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let unauthorized: HardhatEthersSigner;

  const sampleAsset = {
    name: "Cosmic Genesis #001",
    description: "First edition digital genesis artifact representing light in the void.",
    category: "Art",
    price: ethers.parseEther("0.25"),
    metadataURI: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
  };

  beforeEach(async function () {
    [owner, creator, buyer, recipient, unauthorized] = await ethers.getSigners();

    const LumenMarketplaceFactory = await ethers.getContractFactory("LumenMarketplace");
    marketplace = await LumenMarketplaceFactory.deploy();
    await marketplace.waitForDeployment();
  });

  describe("Asset Registration & Minting", function () {
    it("Should register an asset and mint an ERC-721 token to the creator", async function () {
      const tx = await marketplace
        .connect(creator)
        .registerAsset(
          sampleAsset.name,
          sampleAsset.description,
          sampleAsset.category,
          sampleAsset.price,
          sampleAsset.metadataURI
        );

      await expect(tx)
        .to.emit(marketplace, "AssetRegistered")
        .withArgs(1, creator.address, sampleAsset.name, (await ethers.provider.getBlock("latest"))?.timestamp);

      await expect(tx)
        .to.emit(marketplace, "AssetListed")
        .withArgs(1, sampleAsset.price);

      const asset = await marketplace.getAssetDetails(1);
      expect(asset.assetId).to.equal(1);
      expect(asset.name).to.equal(sampleAsset.name);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.currentOwner).to.equal(creator.address);
      expect(asset.price).to.equal(sampleAsset.price);
      expect(asset.forSale).to.be.true;
      expect(asset.metadataURI).to.equal(sampleAsset.metadataURI);

      expect(await marketplace.ownerOf(1)).to.equal(creator.address);
      expect(await marketplace.getTotalAssets()).to.equal(1);
    });

    it("Should register an unlisted asset when price is 0", async function () {
      await marketplace
        .connect(creator)
        .registerAsset(
          "Unlisted Token",
          "Not for sale yet",
          "Collectible",
          0,
          ""
        );

      const asset = await marketplace.getAssetDetails(1);
      expect(asset.forSale).to.be.false;
      expect(asset.price).to.equal(0);
    });

    it("Should reject registration with empty name", async function () {
      await expect(
        marketplace
          .connect(creator)
          .registerAsset("", "No name", "Art", sampleAsset.price, "")
      ).to.be.revertedWith("Asset name cannot be empty");
    });
  });

  describe("Listing and Unlisting", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .registerAsset("Item", "Desc", "Art", 0, "");
    });

    it("Should allow the owner to list an asset for sale", async function () {
      const newPrice = ethers.parseEther("0.5");
      const tx = await marketplace.connect(creator).listForSale(1, newPrice);

      await expect(tx)
        .to.emit(marketplace, "AssetListed")
        .withArgs(1, newPrice);

      const asset = await marketplace.getAssetDetails(1);
      expect(asset.forSale).to.be.true;
      expect(asset.price).to.equal(newPrice);
    });

    it("Should reject listing if price is 0", async function () {
      await expect(
        marketplace.connect(creator).listForSale(1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should allow the owner to unlist an asset", async function () {
      await marketplace.connect(creator).listForSale(1, ethers.parseEther("0.5"));
      const tx = await marketplace.connect(creator).unlistFromSale(1);

      await expect(tx)
        .to.emit(marketplace, "AssetUnlisted")
        .withArgs(1);

      const asset = await marketplace.getAssetDetails(1);
      expect(asset.forSale).to.be.false;
    });

    it("Should reject listing and unlisting from non-owner", async function () {
      await expect(
        marketplace.connect(unauthorized).listForSale(1, ethers.parseEther("1.0"))
      ).to.be.revertedWith("Caller is not the asset owner");

      await marketplace.connect(creator).listForSale(1, ethers.parseEther("1.0"));

      await expect(
        marketplace.connect(unauthorized).unlistFromSale(1)
      ).to.be.revertedWith("Caller is not the asset owner");
    });
  });

  describe("Buying Assets", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .registerAsset(
          sampleAsset.name,
          sampleAsset.description,
          sampleAsset.category,
          sampleAsset.price,
          sampleAsset.metadataURI
        );
    });

    it("Should successfully execute purchase, transfer funds and ownership", async function () {
      const initialSellerBalance = await ethers.provider.getBalance(creator.address);

      const tx = await marketplace
        .connect(buyer)
        .buyAsset(1, { value: sampleAsset.price });

      await expect(tx)
        .to.emit(marketplace, "AssetSold")
        .withArgs(1, creator.address, buyer.address, sampleAsset.price, (await ethers.provider.getBlock("latest"))?.timestamp);

      // Verify ownership
      expect(await marketplace.ownerOf(1)).to.equal(buyer.address);
      const asset = await marketplace.getAssetDetails(1);
      expect(asset.currentOwner).to.equal(buyer.address);
      expect(asset.forSale).to.be.false;

      // Verify seller received funds
      const finalSellerBalance = await ethers.provider.getBalance(creator.address);
      expect(finalSellerBalance - initialSellerBalance).to.equal(sampleAsset.price);

      // Verify transaction count
      expect(await marketplace.getTotalTransactions()).to.equal(1);

      // Verify ownership history
      const history = await marketplace.getOwnershipHistory(1);
      expect(history.length).to.equal(2);
      expect(history[0].owner).to.equal(creator.address);
      expect(history[0].price).to.equal(0);
      expect(history[1].owner).to.equal(buyer.address);
      expect(history[1].price).to.equal(sampleAsset.price);
    });

    it("Should refund excess payment when buyer overpays", async function () {
      const overpayment = ethers.parseEther("0.5");
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace
        .connect(buyer)
        .buyAsset(1, { value: overpayment });

      const receipt = await tx.wait();
      const gasSpent = receipt ? receipt.gasUsed * receipt.gasPrice : 0n;

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);
      // Buyer should only have spent sampleAsset.price + gasSpent
      expect(initialBuyerBalance - finalBuyerBalance).to.be.closeTo(
        sampleAsset.price + gasSpent,
        ethers.parseEther("0.001")
      );
    });

    it("Should reject purchase if asset is not for sale", async function () {
      await marketplace.connect(creator).unlistFromSale(1);

      await expect(
        marketplace.connect(buyer).buyAsset(1, { value: sampleAsset.price })
      ).to.be.revertedWith("Asset is not for sale");
    });

    it("Should reject purchase with insufficient funds", async function () {
      const insufficient = ethers.parseEther("0.1");

      await expect(
        marketplace.connect(buyer).buyAsset(1, { value: insufficient })
      ).to.be.revertedWith("Insufficient ETH sent for purchase");
    });

    it("Should reject purchase by current owner", async function () {
      await expect(
        marketplace.connect(creator).buyAsset(1, { value: sampleAsset.price })
      ).to.be.revertedWith("Cannot purchase your own asset");
    });
  });

  describe("Direct Transfers", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .registerAsset(
          sampleAsset.name,
          sampleAsset.description,
          sampleAsset.category,
          sampleAsset.price,
          sampleAsset.metadataURI
        );
    });

    it("Should successfully transfer an asset directly to another address", async function () {
      const tx = await marketplace
        .connect(creator)
        .transferAsset(1, recipient.address);

      await expect(tx)
        .to.emit(marketplace, "AssetTransferred")
        .withArgs(1, creator.address, recipient.address, (await ethers.provider.getBlock("latest"))?.timestamp);

      expect(await marketplace.ownerOf(1)).to.equal(recipient.address);
      const asset = await marketplace.getAssetDetails(1);
      expect(asset.currentOwner).to.equal(recipient.address);
      expect(asset.forSale).to.be.false;

      expect(await marketplace.getTotalTransactions()).to.equal(1);

      const history = await marketplace.getOwnershipHistory(1);
      expect(history.length).to.equal(2);
      expect(history[1].owner).to.equal(recipient.address);
      expect(history[1].price).to.equal(0);
    });

    it("Should reject direct transfer from non-owner", async function () {
      await expect(
        marketplace.connect(unauthorized).transferAsset(1, recipient.address)
      ).to.be.revertedWith("Caller is not the asset owner");
    });

    it("Should reject transfer to zero address or self", async function () {
      await expect(
        marketplace.connect(creator).transferAsset(1, ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot transfer to zero address");

      await expect(
        marketplace.connect(creator).transferAsset(1, creator.address)
      ).to.be.revertedWith("Cannot transfer to yourself");
    });
  });

  describe("Bulk Queries and Ownership Views", function () {
    beforeEach(async function () {
      // Register 3 assets
      await marketplace.connect(creator).registerAsset("Asset 1", "Desc 1", "Art", ethers.parseEther("0.1"), "");
      await marketplace.connect(creator).registerAsset("Asset 2", "Desc 2", "Music", ethers.parseEther("0.2"), "");
      await marketplace.connect(buyer).registerAsset("Asset 3", "Desc 3", "Domain", 0, "");
    });

    it("Should return all assets correctly via getAllAssets", async function () {
      const all = await marketplace.getAllAssets();
      expect(all.length).to.equal(3);
      expect(all[0].name).to.equal("Asset 1");
      expect(all[1].name).to.equal("Asset 2");
      expect(all[2].name).to.equal("Asset 3");
    });

    it("Should return assets filtered by owner via getAssetsByOwner", async function () {
      const creatorAssets = await marketplace.getAssetsByOwner(creator.address);
      expect(creatorAssets.length).to.equal(2);
      expect(creatorAssets[0].name).to.equal("Asset 1");
      expect(creatorAssets[1].name).to.equal("Asset 2");

      const buyerAssets = await marketplace.getAssetsByOwner(buyer.address);
      expect(buyerAssets.length).to.equal(1);
      expect(buyerAssets[0].name).to.equal("Asset 3");
    });

    it("Should return accurate total assets count", async function () {
      expect(await marketplace.getTotalAssets()).to.equal(3);
    });
  });
});
