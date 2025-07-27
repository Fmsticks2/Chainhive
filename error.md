ffff:10.222.26.168 - - [27/Jul/2025:10:49:32 +0000] "GET /api/health HTTP/1.1" 200 133 "-" "Render/1.0"
::ffff:10.222.26.168 - - [27/Jul/2025:10:49:37 +0000] "GET /api/health HTTP/1.1" 200 133 "-" "Render/1.0"
::ffff:10.222.26.168 - - [27/Jul/2025:10:49:42 +0000] "GET /api/health HTTP/1.1" 200 133 "-" "Render/1.0"
::ffff:10.222.26.168 - - [27/Jul/2025:10:49:42 +0000] "GET /api/health HTTP/1.1" 200 133 "-" "Render/1.0"
Request to https://web3.nodit.io/v1/v1/ethereum/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/tokens failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getTokenBalances (file:///opt/render/project/src/nodit-service.js:152:30)
    at async file:///opt/render/project/src/api/server.js:135:25
Token balances not available for ethereum: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/balance/ethereum/0x5cbd1abe5029c5c717038f86c31b706f027640ab HTTP/1.1" 200 285 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/nfts/xrpl/0x5cbd1abe5029c5c717038f86c31b706f027640ab HTTP/1.1" 200 65 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/xrpl/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/nfts failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getNFTPortfolio (file:///opt/render/project/src/nodit-service.js:189:30)
    at async NoditService.getNFTData (file:///opt/render/project/src/nodit-service.js:475:20)
    at async file:///opt/render/project/src/api/server.js:187:22
NFT data not available for xrpl: API request failed: 404 Not Found - This API is not supported on the requested chain.
Request to https://web3.nodit.io/v1/v1/aptos/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/tokens failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getTokenBalances (file:///opt/render/project/src/nodit-service.js:152:30)
    at async file:///opt/render/project/src/api/server.js:135:25
Token balances not available for aptos: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/balance/aptos/0x5cbd1abe5029c5c717038f86c31b706f027640ab HTTP/1.1" 200 292 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/xrpl/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/transactions?limit=50 failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getRecentTransactions (file:///opt/render/project/src/nodit-service.js:217:30)
    at async NoditService.getTransactionHistory (file:///opt/render/project/src/nodit-service.js:466:20)
    at async file:///opt/render/project/src/api/server.js:159:30
Transaction history not available for xrpl: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/transactions/xrpl/0x5cbd1abe5029c5c717038f86c31b706f027640ab?limit=50 HTTP/1.1" 200 65 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/ethereum/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/nfts failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getNFTPortfolio (file:///opt/render/project/src/nodit-service.js:189:30)
    at async NoditService.getNFTData (file:///opt/render/project/src/nodit-service.js:475:20)
    at async file:///opt/render/project/src/api/server.js:187:22
NFT data not available for ethereum: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/nfts/ethereum/0x5cbd1abe5029c5c717038f86c31b706f027640ab HTTP/1.1" 200 65 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/aptos/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/nfts failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getNFTPortfolio (file:///opt/render/project/src/nodit-service.js:189:30)
    at async NoditService.getNFTData (file:///opt/render/project/src/nodit-service.js:475:20)
    at async file:///opt/render/project/src/api/server.js:187:22
NFT data not available for aptos: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/nfts/aptos/0x5cbd1abe5029c5c717038f86c31b706f027640ab HTTP/1.1" 200 65 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/aptos/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/transactions?limit=50 failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getRecentTransactions (file:///opt/render/project/src/nodit-service.js:217:30)
    at async NoditService.getTransactionHistory (file:///opt/render/project/src/nodit-service.js:466:20)
    at async file:///opt/render/project/src/api/server.js:159:30
Transaction history not available for aptos: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/transactions/aptos/0x5cbd1abe5029c5c717038f86c31b706f027640ab?limit=50 HTTP/1.1" 200 65 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/xrpl/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/tokens failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getTokenBalances (file:///opt/render/project/src/nodit-service.js:152:30)
    at async file:///opt/render/project/src/api/server.js:135:25
Token balances not available for xrpl: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/balance/xrpl/0x5cbd1abe5029c5c717038f86c31b706f027640ab HTTP/1.1" 200 292 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
Request to https://web3.nodit.io/v1/v1/ethereum/address/0x5cbd1abe5029c5c717038f86c31b706f027640ab/transactions?limit=50 failed: Error: API request failed: 404 Not Found - This API is not supported on the requested chain.
    at NoditService.makeRequest (file:///opt/render/project/src/nodit-service.js:597:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.getRecentTransactions (file:///opt/render/project/src/nodit-service.js:217:30)
    at async NoditService.getTransactionHistory (file:///opt/render/project/src/nodit-service.js:466:20)
    at async file:///opt/render/project/src/api/server.js:159:30
Transaction history not available for ethereum: API request failed: 404 Not Found - This API is not supported on the requested chain.
::1 - - [27/Jul/2025:10:49:43 +0000] "GET /api/transactions/ethereum/0x5cbd1abe5029c5c717038f86c31b706f027640ab?limit=50 HTTP/1.1" 200 65 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
::1 - - [27/Jul/2025:10:49:45 +0000] "GET /api/historical/0x5cbd1abe5029c5c717038f86c31b706f027640ab?days=30 HTTP/1.1" 404 50 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
::1 - - [27/Jul/2025:10:49:47 +0000] "GET /api/market-conditions HTTP/1.1" 404 50 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
::ffff:10.222.26.168 - - [27/Jul/2025:10:49:47 +0000] "GET /api/health HTTP/1.1" 200 133 "-" "Render/1.0"
MCP request failed: Error: MCP request failed: 404
    at NoditService.makeMCPRequest (file:///opt/render/project/src/nodit-service.js:623:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.generatePortfolioInsights (file:///opt/render/project/src/nodit-service.js:259:30)
    at async file:///opt/render/project/src/api/server.js:227:26
MCP analysis failed: Error: MCP request failed: 404
    at NoditService.makeMCPRequest (file:///opt/render/project/src/nodit-service.js:623:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async NoditService.generatePortfolioInsights (file:///opt/render/project/src/nodit-service.js:259:30)
    at async file:///opt/render/project/src/api/server.js:227:26
::1 - - [27/Jul/2025:10:49:49 +0000] "POST /api/insights HTTP/1.1" 200 390 "https://chainhive.vercel.app/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"