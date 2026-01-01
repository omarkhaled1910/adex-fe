// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AdExchange is EIP712, Ownable, ReentrancyGuard {
    
    struct Settlement {
        string auctionId;
        address publisher;
        address advertiser;
        uint256 amount;
        uint256 nonce;
    }

    bytes32 private constant SETTLEMENT_TYPEHASH = keccak256(
        "Settlement(string auctionId,address publisher,address advertiser,uint256 amount,uint256 nonce)"
    );

    mapping(address => uint256) public balances;
    mapping(address => uint256) public publisherEarnings;
    mapping(uint256 => bool) public usedNonces;

    uint256 public constant PLATFORM_FEE_PERCENT = 5;

    event Deposited(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event AuctionSettled(
        string auctionId,
        address indexed publisher,
        address indexed advertiser,
        uint256 amount,
        uint256 fee
    );

    constructor(string memory name, string memory version) EIP712(name, version) Ownable(msg.sender) {}

    function deposit() external payable nonReentrant {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
    
    function withdrawPublisherEarnings() external nonReentrant {
        uint256 earnings = publisherEarnings[msg.sender];
        require(earnings > 0, "No earnings to withdraw");
        publisherEarnings[msg.sender] = 0;
        payable(msg.sender).transfer(earnings);
        emit Withdrawn(msg.sender, earnings);
    }

    function settleAuction(Settlement calldata settlement, bytes calldata signature) external nonReentrant {
        require(!usedNonces[settlement.nonce], "Nonce already used");
        
        bytes32 digest = _hashSettlement(settlement);
        address signer = ECDSA.recover(digest, signature);
        
        require(signer == owner(), "Invalid signature");
        
        usedNonces[settlement.nonce] = true;

        uint256 totalAmount = settlement.amount;
        require(balances[settlement.advertiser] >= totalAmount, "Advertiser has insufficient balance");

        uint256 fee = (totalAmount * PLATFORM_FEE_PERCENT) / 100;
        uint256 publisherShare = totalAmount - fee;

        balances[settlement.advertiser] -= totalAmount;
        publisherEarnings[settlement.publisher] += publisherShare;
        balances[owner()] += fee;

        emit AuctionSettled(settlement.auctionId, settlement.publisher, settlement.advertiser, publisherShare, fee);
    }

    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }

    function _hashSettlement(Settlement calldata settlement) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            SETTLEMENT_TYPEHASH,
            keccak256(bytes(settlement.auctionId)),
            settlement.publisher,
            settlement.advertiser,
            settlement.amount,
            settlement.nonce
        )));
    }
}