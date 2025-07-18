// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../ChainHiveToken.sol";
import "../ChainHive.sol";
import "../ChainHiveMultiChain.sol";
import "../ChainHiveGovernance.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/interfaces/IERC5805.sol";

/**
 * @title DeployScript
 * @dev Deployment script for ChainHive contracts
 */
contract DeployScript is Script {
    
    function run() external {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // Handle private key with or without 0x prefix
        if (bytes(privateKeyStr).length == 64) {
            // No 0x prefix, add it
            deployerPrivateKey = vm.parseUint(string.concat("0x", privateKeyStr));
        } else {
            // Has 0x prefix or other format
            deployerPrivateKey = vm.parseUint(privateKeyStr);
        }
        
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy ChainHive Token
        ChainHiveToken token = new ChainHiveToken();
        console.log("ChainHiveToken deployed at:", address(token));
        
        // 2. Skip TimelockController (simplified governance)
        console.log("Skipping TimelockController deployment (simplified governance)");
        
        // 3. Deploy Main ChainHive Contract
        ChainHive chainHive = new ChainHive(address(token));
        console.log("ChainHive deployed at:", address(chainHive));
        
        // 4. Deploy Multi-chain Bridge
        ChainHiveMultiChain multiChain = new ChainHiveMultiChain();
        console.log("ChainHiveMultiChain deployed at:", address(multiChain));
        
        // 5. Deploy Governance
        ChainHiveGovernance governance = new ChainHiveGovernance(
            IERC5805(address(token))
        );
        console.log("ChainHiveGovernance deployed at:", address(governance));
        
        // 6. Setup roles and permissions
        // Add ChainHive contract as minter for rewards
        token.addMinter(address(chainHive));
        
        // Add multi-chain contract as bridge operator
        multiChain.addBridgeOperator(deployer); // Initially, deployer manages bridge
        
        // Transfer ownerships to governance
        chainHive.transferOwnership(address(governance));
        multiChain.transferOwnership(address(governance));
        token.transferOwnership(address(governance));
        
        vm.stopBroadcast();
        
        // Output contract addresses for frontend integration
        console.log("\n=== ChainHive Contract Addresses ===");
        console.log("Network: %s", getChainName(block.chainid));
        console.log("ChainHiveToken: %s", address(token));
        console.log("ChainHive: %s", address(chainHive));
        console.log("ChainHiveMultiChain: %s", address(multiChain));
        console.log("ChainHiveGovernance: %s", address(governance));
        console.log("=====================================\n");
        
        // Create deployment configuration file
        string memory config = string.concat(
            "{\n",
            '  "network": "', getChainName(block.chainid), '",\n',
            '  "chainId": ', vm.toString(block.chainid), ',\n',
            '  "contracts": {\n',
            '    "ChainHiveToken": "', vm.toString(address(token)), '",\n',
            '    "ChainHive": "', vm.toString(address(chainHive)), '",\n',
            '    "ChainHiveMultiChain": "', vm.toString(address(multiChain)), '",\n',
            '    "ChainHiveGovernance": "', vm.toString(address(governance)), '"\n',
            '  }\n',
            '}'
        );
        
        vm.writeFile("./deployments/latest.json", config);
        console.log("Deployment config saved to: ./deployments/latest.json");
    }
    
    function getChainName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 1) return "ethereum";
        if (chainId == 137) return "polygon";
        if (chainId == 56) return "bsc";
        if (chainId == 43114) return "avalanche";
        if (chainId == 42161) return "arbitrum";
        if (chainId == 10) return "optimism";
        if (chainId == 1001) return "kairos";
        if (chainId == 31337) return "localhost";
        return "unknown";
    }
}