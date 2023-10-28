module.exports = {
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ["**/src/**/*.test.[jt]s", '**/test/**/*.test.[jt]s'],
  collectCoverage: false,
  coverageReporters: ["html", "text"],
  coveragePathIgnorePatterns: ["/node_modules/", ".ne$"],
  transform: {
    'tsx?$': ['@swc/jest'],
    "^.+\\.ne$": "jest-transform-nearley",
  },
  moduleNameMapper: {
    '^configuration$': "<rootDir>/config/development",
    "\\.(css|sass)$": "identity-obj-proxy",
  }
}
