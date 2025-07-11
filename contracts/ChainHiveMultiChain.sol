// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ChainHiveMultiChain
 * @dev Multi-chain bridge and synchronization contract
 */
contract ChainHiveMultiChain is Ownable, ReentrancyGuard {
    
    // Events
    event CrossChainDataSynced(uint256 indexed chainId, address indexed user, string dataHash);
    event BridgeOperatorAdded(address indexed operator);
    event BridgeOperatorRemoved(address indexed operator);
    
    // Structs
    struct ChainData {
        uint256 chainId;
        address contractAddress;
        bool isActive;
        uint256 lastSyncBlock;
    }
    
    struct CrossChainMessage {
        uint256 sourceChain;
        uint256 targetChain;
        address user;
        bytes data;
        uint256 timestamp;
        bool processed;
    }
    
    // State variables
    mapping(uint256 => ChainData) public supportedChains;
    mapping(address => bool) public bridgeOperators;
    mapping(bytes32 => CrossChainMessage) public crossChainMessages;
    mapping(address => mapping(uint256 => string)) public userDataHashes; // user => chainId => dataHash
    
    uint256[] public activeChains;
    uint256 public messageNonce;
    
    modifier onlyBridgeOperator() {
        require(bridgeOperators[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor() {
        // Initialize with common chains
        _addChain(1, address(0), true); // Ethereum
        _addChain(137, address(0), true); // Polygon
        _addChain(56, address(0), true); // BSC
        _addChain(43114, address(0), true); // Avalanche
    }
    
    // Chain Management
    function addChain(uint256 _chainId, address _contractAddress) external onlyOwner {
        _addChain(_chainId, _contractAddress, true);
    }
    
    function _addChain(uint256 _chainId, address _contractAddress, bool _isActive) internal {
        if (supportedChains[_chainId].chainId == 0) {
            activeChains.push(_chainId);
        }
        
        supportedChains[_chainId] = ChainData({
            chainId: _chainId,
            contractAddress: _contractAddress,
            isActive: _isActive,
            lastSyncBlock: block.number
        });
    }
    
    function updateChainContract(uint256 _chainId, address _contractAddress) external onlyOwner {
        require(supportedChains[_chainId].chainId != 0, "Chain not supported");
        supportedChains[_chainId].contractAddress = _contractAddress;
    }
    
    function toggleChain(uint256 _chainId) external onlyOwner {
        require(supportedChains[_chainId].chainId != 0, "Chain not supported");
        supportedChains[_chainId].isActive = !supportedChains[_chainId].isActive;
    }
    
    // Bridge Operator Management
    function addBridgeOperator(address _operator) external onlyOwner {
        bridgeOperators[_operator] = true;
        emit BridgeOperatorAdded(_operator);
    }
    
    function removeBridgeOperator(address _operator) external onlyOwner {
        bridgeOperators[_operator] = false;
        emit BridgeOperatorRemoved(_operator);
    }
    
    // Cross-chain messaging
    function sendCrossChainMessage(
        uint256 _targetChain,
        address _user,
        bytes calldata _data
    ) external onlyBridgeOperator returns (bytes32 messageId) {
        require(supportedChains[_targetChain].isActive, "Target chain not active");
        
        messageId = keccak256(abi.encodePacked(block.chainid, _targetChain, _user, _data, messageNonce++));
        
        crossChainMessages[messageId] = CrossChainMessage({
            sourceChain: block.chainid,
            targetChain: _targetChain,
            user: _user,
            data: _data,
            timestamp: block.timestamp,
            processed: false
        });
    }
    
    function processCrossChainMessage(bytes32 _messageId) external onlyBridgeOperator {
        CrossChainMessage storage message = crossChainMessages[_messageId];
        require(!message.processed, "Message already processed");
        require(message.targetChain == block.chainid, "Wrong target chain");
        
        message.processed = true;
        
        // Process the cross-chain data
        // This would typically call the main ChainHive contract to update user data
    }
    
    // Data synchronization
    function syncUserData(
        address _user,
        uint256 _sourceChain,
        string calldata _dataHash
    ) external onlyBridgeOperator {
        userDataHashes[_user][_sourceChain] = _dataHash;
        supportedChains[_sourceChain].lastSyncBlock = block.number;
        
        emit CrossChainDataSynced(_sourceChain, _user, _dataHash);
    }
    
    // View functions
    function getSupportedChains() external view returns (uint256[] memory) {
        return activeChains;
    }
    
    function getChainData(uint256 _chainId) external view returns (ChainData memory) {
        return supportedChains[_chainId];
    }
    
    function getUserDataHash(address _user, uint256 _chainId) external view returns (string memory) {
        return userDataHashes[_user][_chainId];
    }
    
    function getCrossChainMessage(bytes32 _messageId) external view returns (CrossChainMessage memory) {
        return crossChainMessages[_messageId];
    }
    
    // Utility functions
    function getCurrentChainId() external view returns (uint256) {
        return block.chainid;
    }
    
    function isChainSupported(uint256 _chainId) external view returns (bool) {
        return supportedChains[_chainId].isActive;
    }
}