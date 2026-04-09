import { expect, Page } from '@playwright/test'

export const logout = async (page: Page) => {
    // Dismiss any open modals by pressing Escape
    await page.keyboard.press('Escape')

    // Navigate to a known state to avoid blocked UI
    await page.goto('/')
    await page.getByRole('button', { name: 'Logout' }).click()

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
}
