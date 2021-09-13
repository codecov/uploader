module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/ci_providers/provider_template.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageReporters: ['text', 'cobertura', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/test_helpers.js'],
  reporters: ['jest-spec-reporter'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
}
