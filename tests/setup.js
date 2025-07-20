// Test setup and configuration
const { config } = require('../config');
const { logger } = require('../utils/logger');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock external dependencies
jest.mock('axios');
jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        setEx: jest.fn(),
        del: jest.fn(),
        exists: jest.fn(),
        flushDb: jest.fn(),
        on: jest.fn()
    }))
}));

// Global test utilities
global.testUtils = {
    // Create mock request object
    createMockReq: (overrides = {}) => ({
        method: 'GET',
        url: '/test',
        headers: {},
        query: {},
        params: {},
        body: {},
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        get: jest.fn((header) => overrides.headers?.[header.toLowerCase()]),
        ...overrides
    }),

    // Create mock response object
    createMockRes: () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            setHeader: jest.fn().mockReturnThis(),
            removeHeader: jest.fn().mockReturnThis(),
            end: jest.fn().mockReturnThis(),
            locals: {}
        };
        return res;
    },

    // Create mock next function
    createMockNext: () => jest.fn(),

    // Wait for async operations
    wait: (ms = 10) => new Promise(resolve => setTimeout(resolve, ms)),

    // Generate test wallet address
    generateAddress: () => '0x' + '1'.repeat(40),

    // Generate test transaction hash
    generateTxHash: () => '0x' + 'a'.repeat(64),

    // Create test token data
    createTestToken: (overrides = {}) => ({
        symbol: 'TEST',
        name: 'Test Token',
        address: '0x' + '2'.repeat(40),
        balance: '1000000000000000000',
        decimals: 18,
        price: 1.0,
        value: 1.0,
        change24h: 0.05,
        ...overrides
    }),

    // Create test NFT data
    createTestNFT: (overrides = {}) => ({
        tokenId: '1',
        contractAddress: '0x' + '3'.repeat(40),
        name: 'Test NFT',
        description: 'A test NFT',
        image: 'https://example.com/image.png',
        collection: 'Test Collection',
        rarity: 'common',
        floorPrice: 0.1,
        lastSale: 0.15,
        attributes: [],
        ...overrides
    }),

    // Create test transaction data
    createTestTransaction: (overrides = {}) => ({
        hash: '0x' + 'b'.repeat(64),
        blockNumber: 12345678,
        timestamp: new Date().toISOString(),
        from: '0x' + '4'.repeat(40),
        to: '0x' + '5'.repeat(40),
        value: '1000000000000000000',
        gasUsed: '21000',
        gasPrice: '20000000000',
        status: 'success',
        type: 'transfer',
        tokenTransfers: [],
        ...overrides
    })
};

// Global test constants
global.testConstants = {
    VALID_ADDRESS: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    INVALID_ADDRESS: '0xinvalid',
    VALID_CHAINS: ['ethereum', 'polygon', 'bsc'],
    INVALID_CHAIN: 'invalid-chain',
    TEST_API_KEY: 'test-api-key-12345'
};

// Setup and teardown hooks
beforeAll(async () => {
    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(async () => {
    // Restore console output
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
});

beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

// Custom matchers
expect.extend({
    toBeValidAddress(received) {
        const pass = /^0x[a-fA-F0-9]{40}$/.test(received);
        return {
            message: () => `expected ${received} to be a valid Ethereum address`,
            pass
        };
    },

    toBeValidTxHash(received) {
        const pass = /^0x[a-fA-F0-9]{64}$/.test(received);
        return {
            message: () => `expected ${received} to be a valid transaction hash`,
            pass
        };
    },

    toHaveValidApiResponse(received) {
        const hasSuccess = typeof received.success === 'boolean';
        const hasData = received.success ? received.data !== undefined : received.error !== undefined;
        const pass = hasSuccess && hasData;
        
        return {
            message: () => `expected ${JSON.stringify(received)} to be a valid API response`,
            pass
        };
    }
});

// Export test configuration
module.exports = {
    testTimeout: 10000,
    setupFilesAfterEnv: [__filename]
};