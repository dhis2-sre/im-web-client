import { expect, test } from '@playwright/test'
import { deleteTestDatabase, login, logout, uploadTestDatabase, targetGroup } from './utils/index.ts'

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
        const dbName = `e2e-copy-test-${Date.now()}`
        const { fileName } = await uploadTestDatabase(page, dbName)

        // Open the action menu for the uploaded database and copy it
        const row = page.getByRole('row', { name: fileName })
        await row.getByTestId('dhis2-uicore-button').click()
        await page.getByRole('menuitem', { name: 'Copy' }).dispatchEvent('click')

        // Fill in the new name
        const inputName = page.getByTestId('dhis2-uicore-modalcontent').locator('div[data-test="dhis2-uicore-input"] input')
        const newName = `copy-${fileName}`
        await inputName.fill(newName, { force: true })

        // Wait for groups to load, then select the target group
        await expect(page.locator('#group-select')).toBeEnabled()
        await page.selectOption('#group-select', targetGroup)

        // Click the Copy button in the modal actions
        const copyButton = page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Copy' })
        await expect(copyButton).toBeEnabled()
        await copyButton.dispatchEvent('click')

        // Wait for the copy to succeed, then dismiss the modal
        await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(/copied successfully/)).toBeVisible({ timeout: 10000 })
        await page.keyboard.press('Escape')

        // Delete the copy
        await deleteTestDatabase(page, newName)

        // Confirm deletion of the copy
        const copyCellLocator = page.getByRole('cell', { name: newName })
        await expect(copyCellLocator).toHaveCount(0)

        // Delete the original uploaded database
        await deleteTestDatabase(page, fileName)
    })
})
