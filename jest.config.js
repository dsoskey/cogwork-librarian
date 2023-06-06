module.exports = {
  setupFilesAfterEnv: ['./test/setup.ts'],
  testEnvironment: 'jsdom',
  testMatch: ["**/src/**/*.test.[jt]s", '**/test/**/*.test.[jt]s'],
  // collectCoverage: true,
  coverageReporters: ["html", "text"],
  transform: {
    'tsx?$': ['@swc/jest'],
    "^.+\\.ne$": "jest-transform-nearley",
  },
}
