module.exports = {
  setupFilesAfterEnv: ['./test/setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ["**/src/**/*.test.[jt]s"],
  // collectCoverage: true,
  transform: {
    'tsx?$': ['@swc/jest'],
    "^.+\\.ne$": "jest-transform-nearley",
  },
}
