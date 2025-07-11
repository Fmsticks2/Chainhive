// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ChainHive - Web3 AI Assistant Smart Contract
 * @dev Main contract for ChainHive platform built on Nodit infrastructure
 */
contract ChainHive is Ownable, ReentrancyGuard, Pausable {
    
    // Events
    event UserRegistered(address indexed user, string profileHash);
    event PortfolioAnalyzed(address indexed user, string portfolioHash, uint256 timestamp);
    event AIInsightGenerated(address indexed user, string insightHash, uint8 insightType);
    event AlertCreated(address indexed user, uint256 alertId, uint8 alertType);
    event AlertTriggered(address indexed user, uint256 alertId, string data);
    event SubscriptionPurchased(address indexed user, uint8 tier, uint256 expiresAt);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    // Structs
    struct UserProfile {
        string profileHash; // IPFS hash containing user preferences
        uint256 registrationTime;
        uint8 subscriptionTier; // 0: Free, 1: Pro, 2: Enterprise
        uint256 subscriptionExpiry;
        uint256 totalAnalyses;
        uint256 rewardsEarned;
        bool isActive;
    }
    
    struct PortfolioSnapshot {
        string dataHash; // IPFS hash of portfolio data
        uint256 totalValue; // in USD (18 decimals)
        uint256 timestamp;
        uint8 riskScore; // 1-10
        uint8 diversificationScore; // 1-10
    }
    
    struct AIInsight {
        string contentHash; // IPFS hash of insight content
        uint8 insightType; // 1: Analysis, 2: Recommendation, 3: Alert, 4: Prediction
        uint256 timestamp;
        uint8 confidenceScore; // 1-100
        bool isPublic;
    }
    
    struct Alert {
        uint8 alertType; // 1: Price, 2: Portfolio, 3: Transaction, 4: DeFi
        string conditions; // JSON string of alert conditions
        bool isActive;
        uint256 createdAt;
        uint256 triggeredCount;
    }
    
    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(address => PortfolioSnapshot[]) public portfolioHistory;
    mapping(address => AIInsight[]) public userInsights;
    mapping(address => Alert[]) public userAlerts;
    mapping(address => uint256) public userRewards;
    
    // Platform settings
    uint256 public constant REWARD_PER_ANALYSIS = 10 * 10**18; // 10 tokens
    uint256 public constant PRO_SUBSCRIPTION_PRICE = 50 * 10**18; // 50 tokens/month
    uint256 public constant ENTERPRISE_SUBSCRIPTION_PRICE = 200 * 10**18; // 200 tokens/month
    
    address public rewardToken;
    uint256 public totalUsers;
    uint256 public totalAnalyses;
    
    // Modifiers
    modifier onlyRegistered() {
        require(userProfiles[msg.sender].isActive, "User not registered");
        _;
    }
    
    modifier validSubscription() {
        require(
            userProfiles[msg.sender].subscriptionTier == 0 || 
            userProfiles[msg.sender].subscriptionExpiry > block.timestamp,
            "Subscription expired"
        );
        _;
    }
    
    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = _rewardToken;
    }
    
    // User Management
    function registerUser(string memory _profileHash) external {
        require(!userProfiles[msg.sender].isActive, "User already registered");
        
        userProfiles[msg.sender] = UserProfile({
            profileHash: _profileHash,
            registrationTime: block.timestamp,
            subscriptionTier: 0, // Free tier
            subscriptionExpiry: 0,
            totalAnalyses: 0,
            rewardsEarned: 0,
            isActive: true
        });
        
        totalUsers++;
        emit UserRegistered(msg.sender, _profileHash);
    }
    
    function updateProfile(string memory _profileHash) external onlyRegistered {
        userProfiles[msg.sender].profileHash = _profileHash;
    }
    
    // Portfolio Analysis
    function recordPortfolioAnalysis(
        string memory _dataHash,
        uint256 _totalValue,
        uint8 _riskScore,
        uint8 _diversificationScore
    ) external onlyRegistered validSubscription {
        require(_riskScore >= 1 && _riskScore <= 10, "Invalid risk score");
        require(_diversificationScore >= 1 && _diversificationScore <= 10, "Invalid diversification score");
        
        portfolioHistory[msg.sender].push(PortfolioSnapshot({
            dataHash: _dataHash,
            totalValue: _totalValue,
            timestamp: block.timestamp,
            riskScore: _riskScore,
            diversificationScore: _diversificationScore
        }));
        
        userProfiles[msg.sender].totalAnalyses++;
        totalAnalyses++;
        
        // Reward user for analysis
        _rewardUser(msg.sender, REWARD_PER_ANALYSIS);
        
        emit PortfolioAnalyzed(msg.sender, _dataHash, block.timestamp);
    }
    
    // AI Insights
    function storeAIInsight(
        string memory _contentHash,
        uint8 _insightType,
        uint8 _confidenceScore,
        bool _isPublic
    ) external onlyRegistered {
        require(_insightType >= 1 && _insightType <= 4, "Invalid insight type");
        require(_confidenceScore >= 1 && _confidenceScore <= 100, "Invalid confidence score");
        
        userInsights[msg.sender].push(AIInsight({
            contentHash: _contentHash,
            insightType: _insightType,
            timestamp: block.timestamp,
            confidenceScore: _confidenceScore,
            isPublic: _isPublic
        }));
        
        emit AIInsightGenerated(msg.sender, _contentHash, _insightType);
    }
    
    // Alert System
    function createAlert(
        uint8 _alertType,
        string memory _conditions
    ) external onlyRegistered returns (uint256 alertId) {
        require(_alertType >= 1 && _alertType <= 4, "Invalid alert type");
        
        alertId = userAlerts[msg.sender].length;
        userAlerts[msg.sender].push(Alert({
            alertType: _alertType,
            conditions: _conditions,
            isActive: true,
            createdAt: block.timestamp,
            triggeredCount: 0
        }));
        
        emit AlertCreated(msg.sender, alertId, _alertType);
    }
    
    function triggerAlert(address _user, uint256 _alertId, string memory _data) external onlyOwner {
        require(userAlerts[_user][_alertId].isActive, "Alert not active");
        
        userAlerts[_user][_alertId].triggeredCount++;
        emit AlertTriggered(_user, _alertId, _data);
    }
    
    function toggleAlert(uint256 _alertId) external onlyRegistered {
        require(_alertId < userAlerts[msg.sender].length, "Invalid alert ID");
        userAlerts[msg.sender][_alertId].isActive = !userAlerts[msg.sender][_alertId].isActive;
    }
    
    // Subscription Management
    function purchaseSubscription(uint8 _tier) external onlyRegistered nonReentrant {
        require(_tier == 1 || _tier == 2, "Invalid subscription tier");
        
        uint256 price = _tier == 1 ? PRO_SUBSCRIPTION_PRICE : ENTERPRISE_SUBSCRIPTION_PRICE;
        
        IERC20(rewardToken).transferFrom(msg.sender, address(this), price);
        
        userProfiles[msg.sender].subscriptionTier = _tier;
        userProfiles[msg.sender].subscriptionExpiry = block.timestamp + 30 days;
        
        emit SubscriptionPurchased(msg.sender, _tier, userProfiles[msg.sender].subscriptionExpiry);
    }
    
    // Rewards System
    function _rewardUser(address _user, uint256 _amount) internal {
        userRewards[_user] += _amount;
        userProfiles[_user].rewardsEarned += _amount;
    }
    
    function claimRewards() external onlyRegistered nonReentrant {
        uint256 amount = userRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        IERC20(rewardToken).transfer(msg.sender, amount);
        
        emit RewardsClaimed(msg.sender, amount);
    }
    
    // View Functions
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }
    
    function getPortfolioHistory(address _user) external view returns (PortfolioSnapshot[] memory) {
        return portfolioHistory[_user];
    }
    
    function getUserInsights(address _user) external view returns (AIInsight[] memory) {
        return userInsights[_user];
    }
    
    function getUserAlerts(address _user) external view returns (Alert[] memory) {
        return userAlerts[_user];
    }
    
    function getLatestPortfolio(address _user) external view returns (PortfolioSnapshot memory) {
        require(portfolioHistory[_user].length > 0, "No portfolio data");
        return portfolioHistory[_user][portfolioHistory[_user].length - 1];
    }
    
    // Admin Functions
    function setRewardToken(address _newToken) external onlyOwner {
        rewardToken = _newToken;
    }
    
    function withdrawFees() external onlyOwner {
        IERC20(rewardToken).transfer(owner(), IERC20(rewardToken).balanceOf(address(this)));
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency Functions
    function emergencyWithdraw(address _token) external onlyOwner {
        IERC20(_token).transfer(owner(), IERC20(_token).balanceOf(address(this)));
    }
}