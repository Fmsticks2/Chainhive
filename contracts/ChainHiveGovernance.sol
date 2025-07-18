// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/interfaces/IERC5805.sol";

/**
 * @title ChainHiveGovernance
 * @dev Governance contract for ChainHive DAO
 */
contract ChainHiveGovernance is
    Governor,
    GovernorCountingSimple,
    GovernorVotes
{
    constructor(
        IERC5805 _token
    )
        Governor("ChainHiveGovernance")
        GovernorVotes(_token)
    {}
    
    function votingDelay() public pure override returns (uint256) {
        return 7200; // 1 day
    }
    
    function votingPeriod() public pure override returns (uint256) {
        return 50400; // 1 week
    }
    
    function proposalThreshold() public pure override returns (uint256) {
        return 1000e18; // 1000 tokens
    }
    
    function quorum(uint256 blockNumber) public view override returns (uint256) {
        return (token().getPastTotalSupply(blockNumber) * 4) / 100; // 4% quorum
    }
    

}