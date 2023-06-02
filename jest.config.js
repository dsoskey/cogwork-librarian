module.exports = {
  setupFilesAfterEnv: ['./test/setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ["**/src/**/*.test.[jt]s"],
  transform: {
    'tsx?$': ['@swc/jest'],
    "^.+\\.ne$": "jest-transform-nearley",
  },
}
