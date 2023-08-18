import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

function loadEnvVariables() {
    // Assume it's a development environment unless one of these indicates otherwise
    const mode =
        process.env.ENVIRONMENT === 'prod' || process.env.ENVIRONMENT === 'production' || process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production'
            ? 'production'
            : 'development'
    /* Note that order matters here. The values from the .env files with more specific names
       need to override the values that may have been set in more generically named env files. */
    const validEnvFileNamesForCurrentEnv = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]

    for (const fileName of validEnvFileNamesForCurrentEnv) {
        dotenvExpand.expand(dotenv.config({ path: path.resolve(__dirname, fileName) }))
    }
}
loadEnvVariables()

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        testIdAttribute: 'data-test',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'BROWSER=none yarn start',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        stderr: 'pipe',
        stdout: 'pipe',
    },
})
