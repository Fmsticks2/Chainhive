// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IChainHive
 * @dev Interface for ChainHive main contract
 */
interface IChainHive {
    
    struct UserProfile {
        string profileHash;
        uint256 registrationTime;
        uint8 subscriptionTier;
        uint256 subscriptionExpiry;
        uint256 totalAnalyses;
        uint256 rewardsEarned;
        bool isActive;
    }
    
    struct PortfolioSnapshot {
        string dataHash;
        uint256 totalValue;
        uint256 timestamp;
        uint8 riskScore;
        uint8 diversificationScore;
    }
    
    struct AIInsight {
        string contentHash;
        uint8 insightType;
        uint256 timestamp;
        uint8 confidenceScore;
        bool isPublic;
    }
    
    struct Alert {
        uint8 alertType;
        string conditions;
        bool isActive;
        uint256 createdAt;
        uint256 triggeredCount;
    }
    
    // Events
    event UserRegistered(address indexed user, string profileHash);
    event PortfolioAnalyzed(address indexed user, string portfolioHash, uint256 timestamp);
    event AIInsightGenerated(address indexed user, string insightHash, uint8 insightType);
    event AlertCreated(address indexed user, uint256 alertId, uint8 alertType);
    event AlertTriggered(address indexed user, uint256 alertId, string data);
    
    // User management
    function registerUser(string memory _profileHash) external;
    function updateProfile(string memory _profileHash) external;
    function getUserProfile(address _user) external view returns (UserProfile memory);
    
    // Portfolio analysis
    function recordPortfolioAnalysis(
        string memory _dataHash,
        uint256 _totalValue,
        uint8 _riskScore,
        uint8 _diversificationScore
    ) external;
    
    function getPortfolioHistory(address _user) external view returns (PortfolioSnapshot[] memory);
    function getLatestPortfolio(address _user) external view returns (PortfolioSnapshot memory);
    
    // AI insights
    function storeAIInsight(
        string memory _contentHash,
        uint8 _insightType,
        uint8 _confidenceScore,
        bool _isPublic
    ) external;
    
    function getUserInsights(address _user) external view returns (AIInsight[] memory);
    
    // Alerts
    function createAlert(uint8 _alertType, string memory _conditions) external returns (uint256 alertId);
    function triggerAlert(address _user, uint256 _alertId, string memory _data) external;
    function toggleAlert(uint256 _alertId) external;
    function getUserAlerts(address _user) external view returns (Alert[] memory);
    
    // Rewards
    function claimRewards() external;
    
    // Subscription
    function purchaseSubscription(uint8 _tier) external;
}