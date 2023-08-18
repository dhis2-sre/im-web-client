import { expect } from '@playwright/test'

export const logout = async (page) => {
    await page.getByRole('button', { name: 'Logout' }).click()

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
}
