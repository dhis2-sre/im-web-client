import { test, expect } from '@playwright/test'
import { login, logout } from './utils/index.ts'

test.describe('stack', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })
    test.afterEach(async ({ page }) => {
        await logout(page)
    })

    test('can list stacks', async ({ page }) => {
        const stacksLink = await page.getByRole('link', { name: 'Stacks' })
        await expect(stacksLink).toBeVisible()

        await stacksLink.click()

        await expect(page.getByRole('link', { name: 'whoami-go' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'pgadmin' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'dhis2', exact: true })).toBeVisible()
    })
})
