import { expect, Page } from '@playwright/test'

export const logout = async (page: Page) => {
    // Dismiss any open modals by pressing Escape
    await page.keyboard.press('Escape')

    // Navigate to a known state to avoid blocked UI
    await page.goto('/')

    // If we're already logged out (e.g. due to a failed test), skip
    const logoutButton = page.getByRole('button', { name: 'Logout' })
    const loginButton = page.getByRole('button', { name: 'Login' })
    const visibleButton = await Promise.race([logoutButton.waitFor({ timeout: 5000 }).then(() => 'logout'), loginButton.waitFor({ timeout: 5000 }).then(() => 'login')])

    if (visibleButton === 'logout') {
        await logoutButton.click()
        await expect(loginButton).toBeVisible()
    }
}
