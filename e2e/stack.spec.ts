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
        const stacksLink = page.getByRole('link', { name: 'Stacks' })

        // Stacks link is only visible to administrators
        if (!(await stacksLink.isVisible())) {
            test.skip(true, 'Stacks link not visible — user is not an administrator')
        }

        await stacksLink.click()

        await expect(page.getByRole('link', { name: 'whoami-go' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'pgadmin' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'dhis2', exact: true })).toBeVisible()
    })
})
