module.exports = {
  // Test environment (Node.js for backend)
  testEnvironment: 'node',
  
  // Where to find test files
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  
  // Collect test coverage
  collectCoverage: true,
  
  // Which files to include in coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',           // Exclude main app file
    '!**/node_modules/**'    // Exclude dependencies
  ],
  
  // Where to put coverage reports
  coverageDirectory: 'coverage',
  
  // Types of coverage reports
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Minimum coverage requirements (you can adjust these)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Add this for automatic mocking
  automock: false,
  // Tell Jest where to find our mocks
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
