//export default {
//  preset: 'ts-jest',
//  testEnvironment: 'node',
//  testMatch: ['**/tests/**/*.test.ts'],
//  collectCoverage: true,
//  coverageDirectory: 'coverage',
//  coverageReporters: ['text', 'lcov'],
//};
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.[t]s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        allowJs: true,
        useESM: true,
      },
    ],
  },
  // Remove the deprecated 'globals' section
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json',
  //     allowJs: true,
  //   },
  // },
  // ... other configurations ...
};