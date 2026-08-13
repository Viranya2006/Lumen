// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LumenMarketplace
 * @notice Decentralized digital asset marketplace supporting the registration,
 *         minting, listing, buying, and transferring of unique digital assets
 *         with on-chain ownership history tracking.
 * @dev Inherits OpenZeppelin ERC721 and ReentrancyGuard. Follows CEI pattern.
 */
contract LumenMarketplace is ERC721, ReentrancyGuard {
    // ---------------------------------------------------------
    // Data Structures
    // ---------------------------------------------------------

    /**
     * @notice Represents an ownership record in the asset's history timeline.
     * @param owner Address of the owner
     * @param timestamp Timestamp when ownership was acquired
     * @param price Price in wei paid for the asset (0 for minting / direct transfer)
     */
    struct OwnershipRecord {
        address owner;
        uint256 timestamp;
        uint256 price;
    }

    /**
     * @notice Full metadata and state representation of a digital asset.
     * @param assetId Unique ID of the asset
     * @param name Name / title of the digital asset
     * @param description Full description of the asset
     * @param category Category (e.g. Art, Collectible, Domain, Music, Photography, Virtual World, Utility)
     * @param creator Original creator wallet address
     * @param currentOwner Current owner wallet address
     * @param price Price in wei if listed for sale
     * @param forSale Whether the asset is currently available for purchase
     * @param createdAt Timestamp when the asset was registered
     * @param metadataURI Image URL, IPFS link, or placeholder identifier
     */
    struct Asset {
        uint256 assetId;
        string name;
        string description;
        string category;
        address creator;
        address currentOwner;
        uint256 price;
        bool forSale;
        uint256 createdAt;
        string metadataURI;
    }

    // ---------------------------------------------------------
    // State Variables
    // ---------------------------------------------------------

    uint256 private _totalAssetCount;
    uint256 private _totalTransactionCount;

    // Mapping from asset ID to Asset details
    mapping(uint256 => Asset) private _assets;

    // Mapping from asset ID to array of ownership records
    mapping(uint256 => OwnershipRecord[]) private _ownershipHistories;

    // ---------------------------------------------------------
    // Events
    // ---------------------------------------------------------

    event AssetRegistered(
        uint256 indexed assetId,
        address indexed creator,
        string name,
        uint256 timestamp
    );

    event AssetListed(uint256 indexed assetId, uint256 price);

    event AssetUnlisted(uint256 indexed assetId);

    event AssetSold(
        uint256 indexed assetId,
        address indexed from,
        address indexed to,
        uint256 price,
        uint256 timestamp
    );

    event AssetTransferred(
        uint256 indexed assetId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // ---------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------

    constructor() ERC721("Lumen Digital Asset", "LUMEN") {}

    // ---------------------------------------------------------
    // Core Functions
    // ---------------------------------------------------------

    /**
     * @notice Registers a new digital asset and mints an ERC-721 token to the caller.
     * @param name Name of the asset
     * @param description Description of the asset
     * @param category Category name
     * @param price Initial listing price in wei (if 0, asset is not listed for sale)
     * @param metadataURI Image URL or metadata reference
     * @return assetId The unique ID of the newly registered asset
     */
    function registerAsset(
        string calldata name,
        string calldata description,
        string calldata category,
        uint256 price,
        string calldata metadataURI
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Asset name cannot be empty");

        _totalAssetCount++;
        uint256 newAssetId = _totalAssetCount;

        bool isListed = price > 0;

        _assets[newAssetId] = Asset({
            assetId: newAssetId,
            name: name,
            description: description,
            category: category,
            creator: msg.sender,
            currentOwner: msg.sender,
            price: price,
            forSale: isListed,
            createdAt: block.timestamp,
            metadataURI: metadataURI
        });

        // Record initial creator ownership
        _ownershipHistories[newAssetId].push(
            OwnershipRecord({
                owner: msg.sender,
                timestamp: block.timestamp,
                price: 0
            })
        );

        _safeMint(msg.sender, newAssetId);

        emit AssetRegistered(newAssetId, msg.sender, name, block.timestamp);

        if (isListed) {
            emit AssetListed(newAssetId, price);
        }

        return newAssetId;
    }

    /**
     * @notice Lists an existing asset for sale or updates its sale price.
     * @param assetId The ID of the asset to list
     * @param price The sale price in wei
     */
    function listForSale(uint256 assetId, uint256 price) external {
        require(_ownerOf(assetId) != address(0), "Asset does not exist");
        require(ownerOf(assetId) == msg.sender, "Caller is not the asset owner");
        require(price > 0, "Price must be greater than zero");

        _assets[assetId].price = price;
        _assets[assetId].forSale = true;

        emit AssetListed(assetId, price);
    }

    /**
     * @notice Removes an asset from sale.
     * @param assetId The ID of the asset to unlist
     */
    function unlistFromSale(uint256 assetId) external {
        require(_ownerOf(assetId) != address(0), "Asset does not exist");
        require(ownerOf(assetId) == msg.sender, "Caller is not the asset owner");
        require(_assets[assetId].forSale, "Asset is not listed for sale");

        _assets[assetId].forSale = false;

        emit AssetUnlisted(assetId);
    }

    /**
     * @notice Purchases a listed digital asset.
     * @dev Follows Checks-Effects-Interactions and protected with nonReentrant.
     * @param assetId The ID of the asset to purchase
     */
    function buyAsset(uint256 assetId) external payable nonReentrant {
        require(_ownerOf(assetId) != address(0), "Asset does not exist");
        Asset storage asset = _assets[assetId];
        require(asset.forSale, "Asset is not for sale");
        require(msg.value >= asset.price, "Insufficient ETH sent for purchase");

        address seller = ownerOf(assetId);
        require(msg.sender != seller, "Cannot purchase your own asset");

        uint256 salePrice = asset.price;
        uint256 excessPayment = msg.value - salePrice;

        // Effects
        asset.currentOwner = msg.sender;
        asset.forSale = false;
        _totalTransactionCount++;

        _ownershipHistories[assetId].push(
            OwnershipRecord({
                owner: msg.sender,
                timestamp: block.timestamp,
                price: salePrice
            })
        );

        _transfer(seller, msg.sender, assetId);

        emit AssetSold(assetId, seller, msg.sender, salePrice, block.timestamp);

        // Interactions
        (bool success, ) = payable(seller).call{value: salePrice}("");
        require(success, "Payment transfer to seller failed");

        // Refund any overpaid ETH
        if (excessPayment > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excessPayment}("");
            require(refundSuccess, "Excess payment refund failed");
        }
    }

    /**
     * @notice Transfers an asset to another wallet without payment.
     * @param assetId The ID of the asset to transfer
     * @param to The recipient address
     */
    function transferAsset(uint256 assetId, address to) external {
        require(_ownerOf(assetId) != address(0), "Asset does not exist");
        require(ownerOf(assetId) == msg.sender, "Caller is not the asset owner");
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to yourself");

        Asset storage asset = _assets[assetId];
        address from = msg.sender;

        // Effects
        asset.currentOwner = to;
        asset.forSale = false;
        _totalTransactionCount++;

        _ownershipHistories[assetId].push(
            OwnershipRecord({
                owner: to,
                timestamp: block.timestamp,
                price: 0
            })
        );

        _transfer(from, to, assetId);

        emit AssetTransferred(assetId, from, to, block.timestamp);
    }

    // ---------------------------------------------------------
    // View Functions
    // ---------------------------------------------------------

    /**
     * @notice Returns the full ownership history timeline of an asset.
     * @param assetId The ID of the asset
     * @return Array of OwnershipRecord structs
     */
    function getOwnershipHistory(uint256 assetId)
        external
        view
        returns (OwnershipRecord[] memory)
    {
        require(_ownerOf(assetId) != address(0), "Asset does not exist");
        return _ownershipHistories[assetId];
    }

    /**
     * @notice Returns full details for a given asset ID.
     * @param assetId The ID of the asset
     * @return The Asset struct
     */
    function getAssetDetails(uint256 assetId)
        external
        view
        returns (Asset memory)
    {
        require(_ownerOf(assetId) != address(0), "Asset does not exist");
        return _assets[assetId];
    }

    /**
     * @notice Returns all registered assets on the marketplace.
     * @return Array of all Asset structs
     */
    function getAllAssets() external view returns (Asset[] memory) {
        uint256 total = _totalAssetCount;
        Asset[] memory all = new Asset[](total);
        for (uint256 i = 1; i <= total; i++) {
            all[i - 1] = _assets[i];
        }
        return all;
    }

    /**
     * @notice Returns all assets currently owned by a specific address.
     * @param owner The wallet address to query
     * @return Array of Asset structs owned by the address
     */
    function getAssetsByOwner(address owner)
        external
        view
        returns (Asset[] memory)
    {
        uint256 total = _totalAssetCount;
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (_ownerOf(i) == owner) {
                count++;
            }
        }

        Asset[] memory owned = new Asset[](count);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (_ownerOf(i) == owner) {
                owned[currentIndex] = _assets[i];
                currentIndex++;
            }
        }

        return owned;
    }

    /**
     * @notice Returns the total number of assets created on the platform.
     * @return Total asset count
     */
    function getTotalAssets() external view returns (uint256) {
        return _totalAssetCount;
    }

    /**
     * @notice Returns the total number of transactions (buys + transfers) executed.
     * @return Total transaction count
     */
    function getTotalTransactions() external view returns (uint256) {
        return _totalTransactionCount;
    }
}
