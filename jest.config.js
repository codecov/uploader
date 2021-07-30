module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/ci_providers/provider_template.js',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageReporters: ['text', 'cobertura', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/test_helpers.js'],
  reporters: ['jest-spec-reporter'],
}
