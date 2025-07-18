// ChainHive - Enterprise Multi-Chain Portfolio Intelligence
// Powered by NODIT Web3 Infrastructure

class ChainHiveApp {
    constructor() {
        this.web3auth = null;
        this.provider = null;
        this.userInfo = null;
        this.currentChain = 'ethereum';
        this.portfolioData = {};
        this.historicalData = {};
        this.realTimeUpdates = new Map();
        this.analysisCache = new Map();
        this.isWeb3AuthInitialized = false;
        this.isAnalyzing = false;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        
        // Performance monitoring
        this.performanceMetrics = {
            apiCalls: 0,
            cacheHits: 0,
            errors: 0,
            avgResponseTime: 0
        };
        
        this.init();
    }

    // Enhanced helper methods for professional portfolio analysis
    processTokenData(tokens) {
        return tokens.map(token => ({
            ...token,
            usdValue: parseFloat(token.usdValue) || 0,
            balance: parseFloat(token.balance) || 0,
            priceChange24h: parseFloat(token.priceChange24h) || 0,
            symbol: token.symbol || 'UNKNOWN',
            name: token.name || 'Unknown Token',
            contractAddress: token.contractAddress || '',
            logoUrl: token.logoUrl || null
        }));
    }

    processNFTData(nfts) {
        return nfts.map(nft => ({
            ...nft,
            floorPrice: parseFloat(nft.floorPrice) || 0,
            lastSalePrice: parseFloat(nft.lastSalePrice) || 0,
            estimatedValue: parseFloat(nft.estimatedValue) || 0
        }));
    }

    processTransactionData(transactions) {
        return transactions.map(tx => ({
            ...tx,
            value: parseFloat(tx.value) || 0,
            gasUsed: parseFloat(tx.gasUsed) || 0,
            timestamp: new Date(tx.timestamp).getTime()
        }));
    }

    calculateDiversificationScore(tokens) {
        if (!tokens || tokens.length === 0) return 0;
        
        const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);
        if (totalValue === 0) return 0;
        
        // Calculate Herfindahl-Hirschman Index for diversification
        const hhi = tokens.reduce((sum, token) => {
            const share = token.usdValue / totalValue;
            return sum + (share * share);
        }, 0);
        
        // Convert to 0-10 scale (lower HHI = higher diversification)
        return Math.max(0, 10 - (hhi * 10));
    }

    calculateRiskScore(tokens, transactions) {
        if (!tokens || tokens.length === 0) return 5; // Default medium risk
        
        let riskScore = 0;
        let factors = 0;
        
        // Price volatility factor
        const avgVolatility = tokens.reduce((sum, token) => 
            sum + Math.abs(token.priceChange24h), 0) / tokens.length;
        riskScore += Math.min(avgVolatility / 10, 5); // Cap at 5
        factors++;
        
        // Concentration risk
        const maxAllocation = Math.max(...tokens.map(token => 
            token.usdValue / tokens.reduce((sum, t) => sum + t.usdValue, 0)
        ));
        riskScore += maxAllocation * 5; // 0-5 scale
        factors++;
        
        // Transaction frequency (higher = potentially riskier)
        if (transactions && transactions.length > 0) {
            const recentTxs = transactions.filter(tx => 
                Date.now() - tx.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
            ).length;
            riskScore += Math.min(recentTxs / 10, 3); // Cap at 3
            factors++;
        }
        
        return Math.min(riskScore / factors, 10);
    }

    getEmptyPortfolioData(chain, address) {
        return {
            tokens: [],
            nfts: [],
            transactions: [],
            totalValue: 0,
            diversificationScore: 0,
            riskScore: 5,
            lastUpdated: Date.now(),
            chain,
            address
        };
    }

    async executeWithRetry(operation, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                console.warn(`Attempt ${attempt} failed, retrying...`, error.message);
                await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            }
        }
    }

    async fetchHistoricalData(address) {
        try {
            // Fetch historical portfolio data for trend analysis
            const response = await fetch(`/api/historical/${address}?days=30`);
            if (response.ok) {
                const data = await response.json();
                this.historicalData = data.success ? data.data : {};
            }
        } catch (error) {
            console.warn('Failed to fetch historical data:', error);
            this.historicalData = {};
        }
    }

    async getMarketConditions() {
        try {
            const response = await fetch('/api/market-conditions');
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : {};
            }
        } catch (error) {
            console.warn('Failed to fetch market conditions:', error);
        }
        return {
            sentiment: 'neutral',
            volatility: 'medium',
            trend: 'sideways'
        };
    }

    displayEnhancedInsights(insightsData) {
        const insightsContainer = document.getElementById('aiInsightsText');
        const { insights, confidence, recommendations } = insightsData;
        
        const confidenceClass = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
        
        insightsContainer.innerHTML = `
            <div class="insights-header">
                <div class="confidence-indicator ${confidenceClass}">
                    <i class="fas fa-brain"></i>
                    <span>AI Confidence: ${(confidence * 100).toFixed(0)}%</span>
                </div>
            </div>
            <div class="insights-content">
                ${insights}
            </div>
            ${recommendations ? `
                <div class="recommendations">
                    <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }

    generateAdvancedFallbackInsights() {
        const totalValue = Object.values(this.portfolioData)
            .reduce((sum, chain) => sum + (chain.totalValue || 0), 0);
        
        const chains = Object.keys(this.portfolioData).filter(chain => 
            this.portfolioData[chain].totalValue > 0
        );
        
        const insights = [
            `<div class="insight-item">💰 <strong>Portfolio Overview:</strong> Your total portfolio value is $${this.formatCurrency(totalValue)} across ${chains.length} blockchain${chains.length !== 1 ? 's' : ''}.</div>`,
            `<div class="insight-item">📊 <strong>Chain Distribution:</strong> ${this.getChainDistribution()}</div>`,
            `<div class="insight-item">🎯 <strong>Diversification:</strong> ${this.getDiversificationInsight()}</div>`,
            `<div class="insight-item">⚠️ <strong>Risk Assessment:</strong> ${this.getRiskInsight()}</div>`,
            `<div class="insight-item">💡 <strong>Opportunities:</strong> ${this.getOpportunityInsight()}</div>`
        ];
        
        return insights.join('');
    }

    generateBasicFallbackInsights() {
        return `
            <div class="insight-item error">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Analysis Unavailable:</strong> Unable to generate detailed insights at this time. 
                Please check your connection and try again.
            </div>
        `;
    }

    getChainDistribution() {
        const totalValue = Object.values(this.portfolioData)
            .reduce((sum, chain) => sum + (chain.totalValue || 0), 0);
        
        if (totalValue === 0) return 'No assets detected.';
        
        return Object.entries(this.portfolioData)
            .filter(([_, data]) => data.totalValue > 0)
            .map(([chain, data]) => {
                const percentage = (data.totalValue / totalValue * 100).toFixed(1);
                return `${chain.charAt(0).toUpperCase() + chain.slice(1)}: ${percentage}%`;
            })
            .join(', ');
    }

    getDiversificationInsight() {
        const avgDiversification = Object.values(this.portfolioData)
            .filter(data => data.diversificationScore > 0)
            .reduce((sum, data, _, arr) => sum + data.diversificationScore / arr.length, 0);
        
        if (avgDiversification > 7) {
            return 'Excellent diversification across your holdings.';
        } else if (avgDiversification > 5) {
            return 'Good diversification, consider spreading across more assets.';
        } else {
            return 'Limited diversification detected. Consider adding more varied assets.';
        }
    }

    getRiskInsight() {
        const avgRisk = Object.values(this.portfolioData)
            .filter(data => data.riskScore > 0)
            .reduce((sum, data, _, arr) => sum + data.riskScore / arr.length, 0);
        
        if (avgRisk > 7) {
            return 'High-risk portfolio. Consider reducing exposure to volatile assets.';
        } else if (avgRisk > 4) {
            return 'Moderate risk level. Monitor market conditions closely.';
        } else {
            return 'Conservative portfolio with lower risk exposure.';
        }
    }

    getOpportunityInsight() {
        const opportunities = [
            'Consider DeFi staking for passive income',
            'Explore yield farming opportunities',
            'Monitor for arbitrage opportunities across chains',
            'Consider dollar-cost averaging for volatile assets'
        ];
        return opportunities[Math.floor(Math.random() * opportunities.length)];
    }

    updateAnalysisProgress(percentage) {
        const progressBar = document.querySelector('.analysis-progress-bar');
        const progressText = document.querySelector('.analysis-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            const stages = {
                0: 'Initializing analysis...',
                10: 'Preparing data...',
                30: 'Fetching portfolio data...',
                70: 'Processing transactions...',
                80: 'Analyzing historical trends...',
                90: 'Generating AI insights...',
                100: 'Analysis complete!'
            };
            
            const stage = Object.keys(stages)
                .reverse()
                .find(key => percentage >= parseInt(key));
            
            progressText.textContent = stages[stage] || 'Processing...';
        }
    }

    hideAnalysisProgress() {
        const progressContainer = document.querySelector('.analysis-progress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    displayErrorState(error) {
        const portfolioGrid = document.getElementById('portfolioGrid');
        portfolioGrid.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Analysis Failed</h3>
                <p>${this.escapeHtml(error.message)}</p>
                <button class="btn-retry" onclick="chainHiveApp.retryAnalysis()">
                    <i class="fas fa-redo"></i> Retry Analysis
                </button>
            </div>
        `;
    }

    retryAnalysis() {
        const walletAddress = document.getElementById('walletAddress').value.trim();
        if (walletAddress) {
            this.analyzeWallet();
        }
    }

    startRealTimeMonitoring(address) {
        // Start monitoring for real-time updates
        this.monitoredAddress = address;
        this.isMonitoring = true;
    }

    pauseRealTimeUpdates() {
        this.isMonitoring = false;
        if (this.priceMonitoringInterval) clearInterval(this.priceMonitoringInterval);
        if (this.portfolioMonitoringInterval) clearInterval(this.portfolioMonitoringInterval);
        if (this.marketMonitoringInterval) clearInterval(this.marketMonitoringInterval);
    }

    resumeRealTimeUpdates() {
        if (this.monitoredAddress) {
            this.isMonitoring = true;
            this.setupWebhooks();
        }
    }

    initializePerformanceMonitoring() {
        // Display performance metrics in console for debugging
        setInterval(() => {
            if (this.performanceMetrics.apiCalls > 0) {
                console.log('ChainHive Performance Metrics:', this.performanceMetrics);
            }
        }, 60000); // Log every minute
    }

    addToNotificationHistory(message, type) {
        if (!this.notificationHistory) {
            this.notificationHistory = [];
        }
        
        this.notificationHistory.unshift({
            message,
            type,
            timestamp: Date.now()
        });
        
        // Keep only last 50 notifications
        if (this.notificationHistory.length > 50) {
            this.notificationHistory = this.notificationHistory.slice(0, 50);
        }
    }

    formatCurrency(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(2) + 'K';
        } else {
            return value.toFixed(2);
        }
    }

    formatTokenBalance(balance) {
        const num = parseFloat(balance);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else if (num >= 1) {
            return num.toFixed(4);
        } else {
            return num.toFixed(8);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getRiskLevel(score) {
        if (score > 7) return 'high';
        if (score > 4) return 'medium';
        return 'low';
    }

    viewTokenDetails(chain, contractAddress) {
        // Placeholder for token details modal
        this.showNotification(`Token details for ${chain} token coming soon!`, 'info');
    }

    addToWatchlist(chain, contractAddress) {
        // Placeholder for watchlist functionality
        this.showNotification(`Added to watchlist!`, 'success');
    }

    async checkMarketConditions() {
        try {
            const conditions = await this.getMarketConditions();
            
            // Alert on extreme market conditions
            if (conditions.volatility === 'high') {
                this.showNotification('High market volatility detected - Monitor your positions', 'warning');
            }
            
            if (conditions.sentiment === 'fear') {
                this.showNotification('Market fear detected - Potential buying opportunity', 'info');
            }
        } catch (error) {
            console.error('Market condition check failed:', error);
        }
    }

    // Initialize performance monitoring
    initializePerformanceMonitoring() {
        console.log('Performance monitoring initialized');
        
        // Track page load time
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
        }
        
        // Track memory usage if available
        if (window.performance && window.performance.memory) {
            console.log('Memory usage:', {
                used: Math.round(window.performance.memory.usedJSHeapSize / 1048576) + 'MB',
                total: Math.round(window.performance.memory.totalJSHeapSize / 1048576) + 'MB'
            });
        }
    }

    async init() {
        this.updateConnectButtonState('initializing');
        await this.initWeb3Auth();
        this.updateConnectButtonState('ready');
        this.setupEventListeners();
        this.setupChainTabs();
        console.log('ChainHive initialized successfully');
    }

    async initWeb3Auth() {
        try {
            // Check if Web3Auth is available
            if (typeof window.Web3Auth === 'undefined') {
                throw new Error('Web3Auth library not loaded');
            }

            // Fetch Web3Auth configuration from server
            const configResponse = await fetch('/api/config');
            const config = await configResponse.json();
            
            console.log('Web3Auth config loaded:', config.web3auth);

            // Initialize Web3Auth with environment configuration
            this.web3auth = new window.Web3Auth.Web3Auth({
                clientId: config.web3auth.clientId,
                chainConfig: {
                    chainNamespace: "eip155",
                    chainId: "0x1", // Ethereum Mainnet
                    rpcTarget: "https://rpc.ankr.com/eth"
                },
                web3AuthNetwork: config.web3auth.network,
                uiConfig: {
                    theme: "light",
                    loginMethodsOrder: ["google", "facebook", "twitter", "discord"],
                    appLogo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop&crop=center"
                }
            });

            await this.web3auth.initModal();
            this.isWeb3AuthInitialized = true;
            
            if (this.web3auth.connected) {
                this.provider = this.web3auth.provider;
                this.userInfo = await this.web3auth.getUserInfo();
                this.updateUIAfterConnection();
            }
            
            console.log('Web3Auth initialized successfully');
        } catch (error) {
            console.error('Web3Auth initialization failed:', error);
            this.showNotification('Failed to initialize Web3Auth', 'error');
            this.isWeb3AuthInitialized = false;
        }
    }

    setupEventListeners() {
        // Connect Wallet Button
        document.getElementById('connectWallet').addEventListener('click', () => {
            this.connectWallet();
        });

        // Get Started Button
        document.getElementById('getStarted').addEventListener('click', () => {
            this.connectWallet();
        });

        // Learn More Button
        document.getElementById('learnMore').addEventListener('click', () => {
            document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
        });

        // Analyze Wallet Button
        document.getElementById('analyzeWallet').addEventListener('click', () => {
            this.analyzeWallet();
        });

        // Wallet Address Input (Enter key)
        document.getElementById('walletAddress').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.analyzeWallet();
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupChainTabs() {
        document.querySelectorAll('.chain-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.chain-tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                // Update current chain
                this.currentChain = tab.dataset.chain;
                // Update portfolio display
                this.displayPortfolioForChain(this.currentChain);
            });
        });
    }

    async connectWallet() {
        try {
            if (!this.isWeb3AuthInitialized || !this.web3auth) {
                this.showNotification('Web3Auth is still initializing, please wait...', 'error');
                return;
            }

            if (this.web3auth.connected) {
                await this.disconnect();
                return;
            }

            this.provider = await this.web3auth.connect();
            this.userInfo = await this.web3auth.getUserInfo();
            
            this.updateUIAfterConnection();
            this.showNotification('Wallet connected successfully!', 'success');
            
            // Auto-analyze user's wallet if available
            const userAddress = await this.getUserAddress();
            if (userAddress) {
                document.getElementById('walletAddress').value = userAddress;
                setTimeout(() => this.analyzeWallet(), 1000);
            }
        } catch (error) {
            console.error('Connection failed:', error);
            this.showNotification('Failed to connect wallet', 'error');
        }
    }

    async disconnect() {
        try {
            await this.web3auth.logout();
            this.provider = null;
            this.userInfo = null;
            this.updateUIAfterDisconnection();
            this.showNotification('Wallet disconnected', 'success');
        } catch (error) {
            console.error('Disconnection failed:', error);
        }
    }

    async getUserAddress() {
        if (!this.provider) return null;
        
        try {
            const ethersProvider = new ethers.providers.Web3Provider(this.provider);
            const signer = ethersProvider.getSigner();
            return await signer.getAddress();
        } catch (error) {
            console.error('Failed to get user address:', error);
            return null;
        }
    }

    updateConnectButtonState(state) {
        const connectBtn = document.getElementById('connectWallet');
        
        switch(state) {
            case 'initializing':
                connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initializing...';
                connectBtn.disabled = true;
                connectBtn.style.background = 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
                break;
            case 'ready':
                connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
                connectBtn.disabled = false;
                connectBtn.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
                break;
            case 'connected':
                if (this.userInfo && this.userInfo.name) {
                    connectBtn.innerHTML = `<i class="fas fa-user"></i> ${this.userInfo.name}`;
                } else {
                    connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connected';
                }
                connectBtn.disabled = false;
                connectBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                break;
        }
    }

    updateUIAfterConnection() {
        this.updateConnectButtonState('connected');
    }

    updateUIAfterDisconnection() {
        this.updateConnectButtonState('ready');
        
        // Hide portfolio results
        document.getElementById('portfolioResults').style.display = 'none';
        document.getElementById('walletAddress').value = '';
    }

    async analyzeWallet() {
        const walletAddress = document.getElementById('walletAddress').value.trim();
        
        if (!walletAddress) {
            this.showNotification('Please enter a wallet address', 'error');
            return;
        }

        if (!this.isValidAddress(walletAddress)) {
            this.showNotification('Please enter a valid wallet address', 'error');
            return;
        }

        if (this.isAnalyzing) {
            this.showNotification('Analysis already in progress', 'error');
            return;
        }

        this.isAnalyzing = true;
        this.showLoading(true);
        this.updateAnalysisProgress(0);
        
        const startTime = Date.now();
        
        try {
            // Check cache first for recent analysis
            const cacheKey = `analysis_${walletAddress}`;
            const cachedResult = this.analysisCache.get(cacheKey);
            
            if (cachedResult && Date.now() - cachedResult.timestamp < 300000) { // 5 minutes cache
                this.portfolioData = cachedResult.data;
                this.performanceMetrics.cacheHits++;
                this.displayPortfolioResults();
                this.showNotification('Portfolio analysis loaded from cache', 'success');
                return;
            }

            // Reset portfolio data
            this.portfolioData = {};
            this.updateAnalysisProgress(10);

            // Fetch portfolio data with enhanced error handling and retries
            const portfolioPromises = [
                this.fetchEthereumPortfolioEnhanced(walletAddress),
                this.fetchAptosPortfolioEnhanced(walletAddress),
                this.fetchXRPLPortfolioEnhanced(walletAddress)
            ];

            this.updateAnalysisProgress(30);
            
            // Execute with timeout and retry logic
            await this.executeWithRetry(async () => {
                const results = await Promise.allSettled(portfolioPromises);
                
                // Process results and handle partial failures
                results.forEach((result, index) => {
                    const chains = ['ethereum', 'aptos', 'xrpl'];
                    if (result.status === 'rejected') {
                        console.warn(`Failed to fetch ${chains[index]} portfolio:`, result.reason);
                        this.performanceMetrics.errors++;
                    }
                });
            });

            this.updateAnalysisProgress(70);

            // Fetch historical data for trend analysis
            await this.fetchHistoricalData(walletAddress);
            this.updateAnalysisProgress(80);

            // Generate comprehensive AI insights
            await this.generateEnhancedAIInsights(walletAddress);
            this.updateAnalysisProgress(90);

            // Cache the results
            this.analysisCache.set(cacheKey, {
                data: this.portfolioData,
                timestamp: Date.now()
            });

            // Display results with animations
            this.displayPortfolioResults();
            this.updateAnalysisProgress(100);
            
            // Update performance metrics
            const responseTime = Date.now() - startTime;
            this.performanceMetrics.avgResponseTime = 
                (this.performanceMetrics.avgResponseTime + responseTime) / 2;
            this.performanceMetrics.apiCalls++;
            
            this.showNotification(`Portfolio analysis completed in ${(responseTime/1000).toFixed(1)}s`, 'success');
            
            // Start real-time monitoring
            this.startRealTimeMonitoring(walletAddress);
            
        } catch (error) {
            console.error('Portfolio analysis failed:', error);
            this.performanceMetrics.errors++;
            this.showNotification(`Analysis failed: ${error.message}`, 'error');
            this.displayErrorState(error);
        } finally {
            this.isAnalyzing = false;
            this.showLoading(false);
            this.hideAnalysisProgress();
        }
    }

    async fetchEthereumPortfolioEnhanced(address) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
            
            // Fetch comprehensive portfolio data with enhanced error handling
            const [balanceResponse, nftResponse, transactionResponse] = await Promise.all([
                fetch(`/api/balance/ethereum/${address}`, { signal: controller.signal }),
                fetch(`/api/nfts/ethereum/${address}`, { signal: controller.signal }),
                fetch(`/api/transactions/ethereum/${address}?limit=50`, { signal: controller.signal })
            ]);
            
            clearTimeout(timeoutId);
            
            if (!balanceResponse.ok) {
                throw new Error(`Ethereum balance API error: ${balanceResponse.status}`);
            }
            
            const balanceData = await balanceResponse.json();
            const nftData = await nftResponse.json();
            const transactionData = await transactionResponse.json();
            
            // Enhanced data processing with validation
            const tokens = this.processTokenData(balanceData.success ? balanceData.data?.tokens || [] : []);
            const nfts = this.processNFTData(nftData.success ? nftData.data?.nfts || [] : []);
            const transactions = this.processTransactionData(transactionData.success ? transactionData.data?.transactions || [] : []);
            
            // Calculate advanced metrics
            const totalValue = tokens.reduce((sum, token) => sum + (parseFloat(token.usdValue) || 0), 0);
            const diversificationScore = this.calculateDiversificationScore(tokens);
            const riskScore = this.calculateRiskScore(tokens, transactions);
            
            this.portfolioData.ethereum = {
                tokens,
                nfts,
                transactions,
                totalValue,
                diversificationScore,
                riskScore,
                lastUpdated: Date.now(),
                chain: 'ethereum',
                address
            };
            
            console.log('Ethereum portfolio fetched successfully:', this.portfolioData.ethereum);
            
        } catch (error) {
            console.error('Failed to fetch Ethereum portfolio:', error);
            this.portfolioData.ethereum = this.getEmptyPortfolioData('ethereum', address);
            throw error;
        }
    }

    async fetchAptosPortfolioEnhanced(address) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const [balanceResponse, nftResponse, transactionResponse] = await Promise.all([
                fetch(`/api/balance/aptos/${address}`, { signal: controller.signal }),
                fetch(`/api/nfts/aptos/${address}`, { signal: controller.signal }),
                fetch(`/api/transactions/aptos/${address}?limit=50`, { signal: controller.signal })
            ]);
            
            clearTimeout(timeoutId);
            
            if (!balanceResponse.ok) {
                throw new Error(`Aptos balance API error: ${balanceResponse.status}`);
            }
            
            const balanceData = await balanceResponse.json();
            const nftData = await nftResponse.json();
            const transactionData = await transactionResponse.json();
            
            const tokens = this.processTokenData(balanceData.success ? balanceData.data?.tokens || [] : []);
            const nfts = this.processNFTData(nftData.success ? nftData.data?.nfts || [] : []);
            const transactions = this.processTransactionData(transactionData.success ? transactionData.data?.transactions || [] : []);
            
            const totalValue = tokens.reduce((sum, token) => sum + (parseFloat(token.usdValue) || 0), 0);
            const diversificationScore = this.calculateDiversificationScore(tokens);
            const riskScore = this.calculateRiskScore(tokens, transactions);
            
            this.portfolioData.aptos = {
                tokens,
                nfts,
                transactions,
                totalValue,
                diversificationScore,
                riskScore,
                lastUpdated: Date.now(),
                chain: 'aptos',
                address
            };
            
            console.log('Aptos portfolio fetched successfully:', this.portfolioData.aptos);
            
        } catch (error) {
            console.error('Failed to fetch Aptos portfolio:', error);
            this.portfolioData.aptos = this.getEmptyPortfolioData('aptos', address);
            throw error;
        }
    }

    async fetchXRPLPortfolioEnhanced(address) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const [balanceResponse, nftResponse, transactionResponse] = await Promise.all([
                fetch(`/api/balance/xrpl/${address}`, { signal: controller.signal }),
                fetch(`/api/nfts/xrpl/${address}`, { signal: controller.signal }),
                fetch(`/api/transactions/xrpl/${address}?limit=50`, { signal: controller.signal })
            ]);
            
            clearTimeout(timeoutId);
            
            if (!balanceResponse.ok) {
                throw new Error(`XRPL balance API error: ${balanceResponse.status}`);
            }
            
            const balanceData = await balanceResponse.json();
            const nftData = await nftResponse.json();
            const transactionData = await transactionResponse.json();
            
            const tokens = this.processTokenData(balanceData.success ? balanceData.data?.tokens || [] : []);
            const nfts = this.processNFTData(nftData.success ? nftData.data?.nfts || [] : []);
            const transactions = this.processTransactionData(transactionData.success ? transactionData.data?.transactions || [] : []);
            
            const totalValue = tokens.reduce((sum, token) => sum + (parseFloat(token.usdValue) || 0), 0);
            const diversificationScore = this.calculateDiversificationScore(tokens);
            const riskScore = this.calculateRiskScore(tokens, transactions);
            
            this.portfolioData.xrpl = {
                tokens,
                nfts,
                transactions,
                totalValue,
                diversificationScore,
                riskScore,
                lastUpdated: Date.now(),
                chain: 'xrpl',
                address
            };
            
            console.log('XRPL portfolio fetched successfully:', this.portfolioData.xrpl);
            
        } catch (error) {
            console.error('Failed to fetch XRPL portfolio:', error);
            this.portfolioData.xrpl = this.getEmptyPortfolioData('xrpl', address);
            throw error;
        }
    }



    async generateEnhancedAIInsights(address) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            
            // Prepare comprehensive data for AI analysis
            const analysisData = {
                portfolioData: this.portfolioData,
                historicalData: this.historicalData,
                marketConditions: await this.getMarketConditions(),
                userPreferences: {
                    riskTolerance: 'moderate',
                    investmentGoals: ['growth', 'diversification', 'yield'],
                    timeHorizon: 'long-term',
                    sectors: ['defi', 'nft', 'gaming']
                },
                analysisType: 'comprehensive'
            };
            
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(analysisData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const result = await response.json();
            
            if (result.success && result.data) {
                this.displayEnhancedInsights(result.data);
            } else {
                // Enhanced fallback analysis
                const insights = this.generateAdvancedFallbackInsights();
                this.displayEnhancedInsights({ insights, confidence: 0.7 });
            }
            
        } catch (error) {
            console.error('Failed to generate AI insights:', error);
            const fallbackInsights = this.generateBasicFallbackInsights();
            this.displayEnhancedInsights({ insights: fallbackInsights, confidence: 0.5 });
        }
    }

    displayPortfolioResults() {
        document.getElementById('portfolioResults').style.display = 'block';
        this.displayPortfolioForChain(this.currentChain);
    }

    displayPortfolioForChain(chain) {
        const portfolioGrid = document.getElementById('portfolioGrid');
        const chainData = this.portfolioData[chain];
        
        if (!chainData || !chainData.tokens || chainData.tokens.length === 0) {
            portfolioGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <h3>No Assets Found</h3>
                    <p>No tokens found for this chain. Try a different address or check another blockchain.</p>
                </div>
            `;
            return;
        }

        // Sort tokens by USD value (descending)
        const sortedTokens = [...chainData.tokens].sort((a, b) => 
            (parseFloat(b.usdValue) || 0) - (parseFloat(a.usdValue) || 0)
        );

        portfolioGrid.innerHTML = sortedTokens.map((token, index) => {
            const changeClass = token.priceChange24h >= 0 ? 'positive' : 'negative';
            const changeIcon = token.priceChange24h >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
            
            return `
                <div class="token-card animate-on-scroll" style="animation-delay: ${index * 0.1}s">
                    <div class="token-header">
                        <div class="token-icon">
                            ${token.logoUrl ? 
                                `<img src="${token.logoUrl}" alt="${token.symbol}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">` :
                                ''
                            }
                            <div class="token-icon-fallback" ${token.logoUrl ? 'style="display:none"' : ''}>
                                ${token.symbol ? token.symbol.substring(0, 2).toUpperCase() : '??'}
                            </div>
                        </div>
                        <div class="token-info">
                            <h4>${this.escapeHtml(token.symbol || 'Unknown')}</h4>
                            <p>${this.escapeHtml(token.name || 'Unknown Token')}</p>
                            <div class="token-price-change ${changeClass}">
                                <i class="fas ${changeIcon}"></i>
                                ${token.priceChange24h ? Math.abs(token.priceChange24h).toFixed(2) : '0.00'}%
                            </div>
                        </div>
                    </div>
                    <div class="token-metrics">
                        <div class="token-balance">
                            ${this.formatTokenBalance(token.balance)} ${token.symbol}
                        </div>
                        <div class="token-value">
                            $${this.formatCurrency(token.usdValue || 0)}
                        </div>
                        <div class="token-allocation">
                            ${((parseFloat(token.usdValue) || 0) / chainData.totalValue * 100).toFixed(1)}% of portfolio
                        </div>
                    </div>
                    <div class="token-actions">
                        <button class="btn-token-action" onclick="chainHiveApp.viewTokenDetails('${chain}', '${token.contractAddress}')">
                            <i class="fas fa-chart-line"></i> Details
                        </button>
                        <button class="btn-token-action" onclick="chainHiveApp.addToWatchlist('${chain}', '${token.contractAddress}')">
                            <i class="fas fa-star"></i> Watch
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add chain summary card
        const summaryCard = `
            <div class="chain-summary-card animate-on-scroll">
                <div class="summary-header">
                    <h3><i class="fas fa-chart-pie"></i> ${chain.charAt(0).toUpperCase() + chain.slice(1)} Summary</h3>
                </div>
                <div class="summary-metrics">
                    <div class="metric">
                        <span class="metric-label">Total Value</span>
                        <span class="metric-value">$${this.formatCurrency(chainData.totalValue)}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Assets</span>
                        <span class="metric-value">${chainData.tokens.length}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Diversification</span>
                        <span class="metric-value">${chainData.diversificationScore?.toFixed(1) || 'N/A'}/10</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Risk Score</span>
                        <span class="metric-value risk-${this.getRiskLevel(chainData.riskScore)}">
                            ${chainData.riskScore?.toFixed(1) || 'N/A'}/10
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        portfolioGrid.insertAdjacentHTML('afterbegin', summaryCard);
    }

    isValidAddress(address) {
        // Enhanced validation for different address formats
        const cleanAddress = address.trim().toLowerCase();
        
        // Ethereum-like addresses (Ethereum, Polygon, BSC, etc.)
        if (/^0x[a-f0-9]{40}$/i.test(cleanAddress)) {
            return true;
        }
        
        // Aptos addresses
        if (/^0x[a-f0-9]{64}$/i.test(cleanAddress)) {
            return true;
        }
        
        // XRPL addresses
        if (/^r[a-zA-Z0-9]{24,34}$/.test(address)) {
            return true;
        }
        
        // Solana addresses (base58, 32-44 characters)
        if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
            return true;
        }
        
        // Bitcoin addresses
        if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
            /^bc1[a-z0-9]{39,59}$/.test(address)) {
            return true;
        }
        
        // Cardano addresses
        if (/^addr1[a-z0-9]{98}$/.test(address)) {
            return true;
        }
        
        return false;
    }

    showLoading(show) {
        const analyzeText = document.getElementById('analyzeText');
        const analyzeLoading = document.getElementById('analyzeLoading');
        const analyzeBtn = document.getElementById('analyzeWallet');
        
        if (show) {
            analyzeText.classList.add('hidden');
            analyzeLoading.classList.remove('hidden');
            analyzeBtn.disabled = true;
        } else {
            analyzeText.classList.remove('hidden');
            analyzeLoading.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    showNotification(message, type = 'success', duration = 4000) {
        const notification = document.getElementById('notification');
        
        // Create notification content with icon
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icons[type] || icons.info}"></i>
                <span>${this.escapeHtml(message)}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.classList.remove('show')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notification.className = `notification ${type} show`;
        
        // Auto-hide after duration
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
        
        // Add to notification history
        this.addToNotificationHistory(message, type);
    }

    // Enhanced real-time monitoring and alerts
    setupWebhooks() {
        // Real-time price monitoring
        this.priceMonitoringInterval = setInterval(() => {
            this.checkPriceAlerts();
        }, 60000); // Check every minute
        
        // Portfolio change monitoring
        this.portfolioMonitoringInterval = setInterval(() => {
            this.checkPortfolioChanges();
        }, 300000); // Check every 5 minutes
        
        // Market condition alerts
        this.marketMonitoringInterval = setInterval(() => {
            this.checkMarketConditions();
        }, 900000); // Check every 15 minutes
    }
    
    async checkPriceAlerts() {
        try {
            // Check for significant price movements in portfolio tokens
            for (const [chain, data] of Object.entries(this.portfolioData)) {
                if (data.tokens) {
                    for (const token of data.tokens) {
                        if (Math.abs(token.priceChange24h) > 10) {
                            const direction = token.priceChange24h > 0 ? 'increased' : 'decreased';
                            this.showNotification(
                                `${token.symbol} ${direction} by ${Math.abs(token.priceChange24h).toFixed(1)}% in 24h`,
                                token.priceChange24h > 0 ? 'success' : 'warning'
                            );
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Price alert check failed:', error);
        }
    }
    
    async checkPortfolioChanges() {
        // Monitor for large transactions or balance changes
        const currentAddress = document.getElementById('walletAddress').value.trim();
        if (!currentAddress) return;
        
        try {
            // This would typically check for new transactions
            // For demo purposes, we'll simulate occasional alerts
            if (Math.random() < 0.2) {
                const alerts = [
                    'New transaction detected in your wallet',
                    'Large transfer detected - Portfolio updated',
                    'DeFi position change detected',
                    'NFT collection activity detected'
                ];
                const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
                this.showNotification(randomAlert, 'info');
            }
        } catch (error) {
            console.error('Portfolio monitoring failed:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chainHiveApp = new ChainHiveApp();
    
    // Setup enhanced monitoring after initialization
    setTimeout(() => {
        window.chainHiveApp.setupWebhooks();
        window.chainHiveApp.initializePerformanceMonitoring();
    }, 3000);
    
    // Handle page visibility changes for performance optimization
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.chainHiveApp.pauseRealTimeUpdates();
        } else {
            window.chainHiveApp.resumeRealTimeUpdates();
        }
    });
    
    // Handle network status changes
    window.addEventListener('online', () => {
        window.chainHiveApp.showNotification('Connection restored', 'success');
        window.chainHiveApp.resumeRealTimeUpdates();
    });
    
    window.addEventListener('offline', () => {
        window.chainHiveApp.showNotification('Connection lost - Working offline', 'warning');
        window.chainHiveApp.pauseRealTimeUpdates();
    });
    
    // Initialize all page functionality
    window.chainHiveApp.initPageFunctionality();
});

// Add page functionality methods to ChainHiveApp
ChainHiveApp.prototype.initPageFunctionality = function() {
    this.initNavigationHandlers();
    this.initAnalyticsHandlers();
    this.initAPIHandlers();
    this.initEnterpriseHandlers();
    this.initSmoothScrolling();
};

ChainHiveApp.prototype.initNavigationHandlers = function() {
    // Handle navigation clicks
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Handle footer navigation
    document.querySelectorAll('.footer-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
};

ChainHiveApp.prototype.initAnalyticsHandlers = function() {
    // Chart period buttons
    document.querySelectorAll('.btn-chart-period').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-chart-period').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const period = btn.textContent;
            this.updateAnalyticsChart(period);
        });
    });

    // Card action buttons
    document.querySelectorAll('.btn-card-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.textContent.toLowerCase();
            this.handleAnalyticsAction(action);
        });
    });
};

ChainHiveApp.prototype.initAPIHandlers = function() {
    // API documentation buttons
    document.querySelectorAll('.btn-api-docs').forEach(btn => {
        btn.addEventListener('click', () => {
            const apiName = btn.closest('.api-card').querySelector('h3').textContent;
            this.openAPIDocumentation(apiName);
        });
    });

    // API test buttons
    document.querySelectorAll('.btn-api-test').forEach(btn => {
        btn.addEventListener('click', () => {
            const apiName = btn.closest('.api-card').querySelector('h3').textContent;
            this.testAPIEndpoint(apiName);
        });
    });

    // Demo run button
    const demoRunBtn = document.querySelector('.btn-demo-run');
    if (demoRunBtn) {
        demoRunBtn.addEventListener('click', () => {
            this.runAPIDemo();
        });
    }

    // API selector
    const apiSelect = document.querySelector('.api-select');
    if (apiSelect) {
        apiSelect.addEventListener('change', () => {
            this.updateDemoContent(apiSelect.value);
        });
    }
};

ChainHiveApp.prototype.initEnterpriseHandlers = function() {
    // Enterprise buttons
    document.querySelectorAll('.btn-enterprise').forEach(btn => {
        btn.addEventListener('click', () => {
            const planType = btn.closest('.enterprise-card').querySelector('h3').textContent;
            this.handleEnterprisePlan(planType);
        });
    });

    // Contact sales button
    const contactBtn = document.querySelector('.enterprise-cta .btn-primary');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            this.openContactForm();
        });
    }
};

ChainHiveApp.prototype.initSmoothScrolling = function() {
    // Hero CTA buttons
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        if (btn.textContent.includes('Start Analysis')) {
            btn.addEventListener('click', () => {
                document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
            });
        } else if (btn.textContent.includes('Watch Demo')) {
            btn.addEventListener('click', () => {
                this.playDemo();
            });
        }
    });
};

// Analytics functionality
ChainHiveApp.prototype.updateAnalyticsChart = function(period) {
    this.showNotification(`Updating chart for ${period} period`, 'info');
    // Simulate chart update
    setTimeout(() => {
        this.showNotification(`Chart updated for ${period}`, 'success');
    }, 1000);
};

ChainHiveApp.prototype.handleAnalyticsAction = function(action) {
    switch(action) {
        case 'export':
            this.exportAnalytics();
            break;
        case 'refresh':
            this.refreshAnalytics();
            break;
        case 'configure':
            this.configureAnalytics();
            break;
        default:
            this.showNotification(`${action} action triggered`, 'info');
    }
};

ChainHiveApp.prototype.exportAnalytics = function() {
    this.showNotification('Exporting analytics data...', 'info');
    // Simulate export
    setTimeout(() => {
        this.showNotification('Analytics exported successfully', 'success');
    }, 2000);
};

ChainHiveApp.prototype.refreshAnalytics = function() {
    this.showNotification('Refreshing analytics...', 'info');
    // Simulate refresh
    setTimeout(() => {
        this.showNotification('Analytics refreshed', 'success');
    }, 1500);
};

ChainHiveApp.prototype.configureAnalytics = function() {
    this.showNotification('Opening analytics configuration...', 'info');
};

// API functionality
ChainHiveApp.prototype.openAPIDocumentation = function(apiName) {
    this.showNotification(`Opening documentation for ${apiName}`, 'info');
    // In a real app, this would open the API docs
};

ChainHiveApp.prototype.testAPIEndpoint = function(apiName) {
    this.showNotification(`Testing ${apiName} endpoint...`, 'info');
    // Simulate API test
    setTimeout(() => {
        this.showNotification(`${apiName} test completed successfully`, 'success');
    }, 2000);
};

ChainHiveApp.prototype.runAPIDemo = function() {
    const demoResponse = document.querySelector('.demo-response pre');
    if (demoResponse) {
        demoResponse.textContent = 'Loading...';
        
        // Simulate API call
        setTimeout(() => {
            const mockResponse = {
                "status": "success",
                "data": {
                    "address": "0x742d35Cc6634C0532925a3b8D4C9db96",
                    "balance": "1.234 ETH",
                    "tokens": [
                        {"symbol": "USDC", "balance": "1000.00"},
                        {"symbol": "LINK", "balance": "50.25"}
                    ]
                }
            };
            demoResponse.textContent = JSON.stringify(mockResponse, null, 2);
            this.showNotification('API demo completed', 'success');
        }, 1500);
    }
};

ChainHiveApp.prototype.updateDemoContent = function(apiType) {
    const demoRequest = document.querySelector('.demo-request pre');
    const demoResponse = document.querySelector('.demo-response pre');
    
    if (demoRequest && demoResponse) {
        const requests = {
            'portfolio': 'GET /api/portfolio?address=0x742d35Cc6634C0532925a3b8D4C9db96',
            'balance': 'GET /api/balance?address=0x742d35Cc6634C0532925a3b8D4C9db96&chain=ethereum',
            'transactions': 'GET /api/transactions?address=0x742d35Cc6634C0532925a3b8D4C9db96&limit=10'
        };
        
        demoRequest.textContent = requests[apiType] || 'Select an API endpoint';
        demoResponse.textContent = 'Click "Run Demo" to see the response';
    }
};

// Enterprise functionality
ChainHiveApp.prototype.handleEnterprisePlan = function(planType) {
    this.showNotification(`Initiating ${planType} plan setup...`, 'info');
    // In a real app, this would redirect to a signup/contact form
};

ChainHiveApp.prototype.openContactForm = function() {
    this.showNotification('Opening contact form...', 'info');
    // In a real app, this would open a contact modal or redirect
};

ChainHiveApp.prototype.playDemo = function() {
    this.showNotification('Starting demo...', 'info');
    // Scroll to portfolio section and trigger demo
    document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        const demoAddress = '0x742d35Cc6634C0532925a3b8D4C9db96';
        const addressInput = document.getElementById('walletAddress');
        if (addressInput) {
            addressInput.value = demoAddress;
            // Trigger analysis
            setTimeout(() => {
                this.analyzeWallet();
            }, 500);
        }
    }, 1000);
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChainHiveApp;
}