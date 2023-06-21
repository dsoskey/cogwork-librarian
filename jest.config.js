module.exports = {
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ["**/src/**/*.test.[jt]s", '**/test/**/*.test.[jt]s'],
  // collectCoverage: true,
  coverageReporters: ["html", "text"],
  coveragePathIgnorePatterns: ["/node_modules/", ".ne$"],
  transform: {
    'tsx?$': ['@swc/jest'],
    "^.+\\.ne$": "jest-transform-nearley",
  },
}
