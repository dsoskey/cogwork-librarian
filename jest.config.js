module.exports = {
  setupFilesAfterEnv: ['./test/setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    'tsx?$': ['@swc/jest'],
  },
};
