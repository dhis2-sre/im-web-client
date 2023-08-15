import { expect } from '@playwright/test'
import { password, username } from './env'

export const login = async (page) => {
    await page.goto('/login')
    await page.getByLabel('username').click()
    await page.getByLabel('username').fill(username)
    await page.getByLabel('password').click()
    await page.getByLabel('password').fill(password)
    await page.getByRole('button', { name: 'Login' }).click()

    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
}
