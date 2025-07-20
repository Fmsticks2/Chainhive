// Jest configuration for ChainHive project
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'middleware/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    'config/**/*.js',
    'api/**/*.js',
    '!api/server.js', // Exclude server entry point
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './middleware/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Global variables
  globals: {
    'NODE_ENV': 'test'
  },

  // Setup environment variables
  setupFiles: ['<rootDir>/tests/setup.js'],
  
  // Module name mapping for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@config/(.*)$': '<rootDir>/config/$1'
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // Watch plugins (commented out - install jest-watch-typeahead if needed)
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // // Reporter configuration
  reporters: [
    'default',
    // Uncomment below if you install jest-html-reporters
    // [
    //   'jest-html-reporters',
    //   {
    //     publicPath: './coverage/html-report',
    //     filename: 'report.html',
    //     expand: true,
    //     hideIcon: false,
    //     pageTitle: 'ChainHive Test Report'
    //   },
    // ],
  ],
  
  // Bail configuration
  bail: false,
  
  // Force exit
  forceExit: false,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max workers
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Notify mode
  notify: false,
  
  // Notify mode
  notifyMode: 'failure-change',
  
  // Project configuration for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/tests/middleware/**/*.test.js',
        '<rootDir>/tests/services/**/*.test.js',
        '<rootDir>/tests/utils/**/*.test.js',
        '<rootDir>/tests/config/**/*.test.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/tests/integration/**/*.test.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      testTimeout: 30000
    }
  ]
};