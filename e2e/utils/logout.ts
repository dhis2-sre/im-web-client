import { expect, Page } from '@playwright/test'
import { username } from './env.ts'

export const logout = async (page: Page) => {
    // Dismiss any open modals by pressing Escape
    await page.keyboard.press('Escape')

    // Navigate to a known state to avoid blocked UI
    await page.goto('/')

    // If we're already logged out (e.g. due to a failed test), skip
    // Logging out lives in the account menu, opened from the row showing the user's email
    const accountButton = page.getByRole('button', { name: username })
    const loginButton = page.getByRole('button', { name: 'Login' })
    const visibleButton = await Promise.race([accountButton.waitFor({ timeout: 5000 }).then(() => 'logout'), loginButton.waitFor({ timeout: 5000 }).then(() => 'login')])

    if (visibleButton === 'logout') {
        await accountButton.click()
        await page.getByRole('menuitem', { name: 'Log out' }).click()
        await expect(loginButton).toBeVisible()
    }
}
