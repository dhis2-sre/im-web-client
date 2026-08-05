/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+.tsx?$': ['ts-jest', {}],
    },
    // e2e holds Playwright specs, which have their own runner.
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
}
