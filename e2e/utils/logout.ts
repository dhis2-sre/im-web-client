import { expect, Page } from '@playwright/test'

export const logout = async (page: Page) => {
    await page.getByRole('button', { name: 'Logout' }).click()

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
}
