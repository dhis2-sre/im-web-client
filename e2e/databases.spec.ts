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
        await row.getByRole('button', { name: `Actions for ${fileName}` }).click()
        await page.getByRole('menuitem', { name: 'Copy' }).dispatchEvent('click')

        // Scope all further interactions to the copy dialog.
        // @dhis2/ui's Modal sets aria-modal="true" but not role="dialog" (see upstream issue),
        // so we scope via the aria-modal attribute rather than getByRole('dialog').
        const copyDialog = page.locator('[aria-modal="true"]')

        // Fill in the new name
        const newName = `copy-${fileName}`
        await copyDialog.getByLabel('New Name').fill(newName, { force: true })

        // Wait for groups to load, then select the target group
        const groupSelect = copyDialog.getByLabel(/select group/i)
        await expect(groupSelect).toBeEnabled()
        await groupSelect.selectOption(targetGroup)

        // Click the Copy button in the modal actions
        const copyButton = copyDialog.getByRole('button', { name: 'Copy' })
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
