import { test, expect } from '@playwright/test'
import { login, logout } from './utils/index.ts'

test.describe('databases', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })
    test.afterEach(async ({ page }) => {
        await logout(page)
    })

    test('has a database section', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'Databases' })).toBeVisible()
    })
})
