import { expect, Page } from '@playwright/test'
import { password, username } from './env.ts'

export const login = async (page: Page) => {
    await page.goto('/')

    await page.getByLabel('email').click()
    await page.getByLabel('email').fill(username)
    await page.getByLabel('password').click()
    await page.getByLabel('password').fill(password)
    await page.getByRole('button', { name: 'Login' }).click()

    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
}
