import { test, expect } from '@playwright/test'
import { deleteTestDatabase, login, logout } from './utils/index.ts'

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

    test('copy/rename database', async ({ page }) => {
        await page.getByRole('link', { name: 'Databases' }).click()
        const firstRowButton = page
            .locator('table[data-test="dhis2-uicore-datatable"] tbody tr:first-child td[data-test="dhis2-uicore-datatablecell"]:last-child button[data-test="dhis2-uicore-button"]')
            .first()

        await firstRowButton.click()

        console.log(firstRowButton, 'firstRow')
        await page.getByRole('menuitem', { name: 'Copy' }).click()

        // Copy
        const inputName = page.locator('div[data-test="dhis2-uicore-input"] input')
        const name = await inputName.inputValue()
        const newName = `copy-${name}`
        await inputName.fill(newName)
        await page.selectOption('#group-select', 'whoami')
        await page.locator('button').getByText('Copy').click()

        // Rename
        const copiedDatabase = page.getByRole('row', { name: newName })
        await copiedDatabase.getByTestId('dhis2-uicore-button').click()
        await page.getByRole('menuitem', { name: 'Rename' }).click()
        const inputRename = page.locator('div[data-test="dhis2-uicore-input"] input')
        const rename = `rename-${newName}`
        await inputRename.fill(rename)
        await page.locator('button').getByText('Rename').click()

        // Delete
        await deleteTestDatabase(page, rename)

        // Confirm deletion
        const cellLocator = page.getByRole('cell', { name: rename })
        await expect(cellLocator).toHaveCount(0)
    })
})
