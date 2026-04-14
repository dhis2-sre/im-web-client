import { test, expect } from '@playwright/test'
import { login, logout, uploadTestDatabase, deleteTestDatabase, targetGroup, dhis2CoreImageTag } from './utils/index.ts'

test.describe('new instance', () => {
    let dbFileName: string
    const dbName = `e2e-test-${Date.now()}`

    test.beforeEach(async ({ page }) => {
        await login(page)
        const result = await uploadTestDatabase(page, dbName)
        dbFileName = result.fileName
    })

    test.afterEach(async ({ page }) => {
        await deleteTestDatabase(page, dbFileName)
        await logout(page)
    })

    // This test doesn't make sure that the newly created instance is running, only that it's
    // shown in the list view. This is because currently we don't show the status of an instance or
    // its components on the UI.
    // TODO once the status is shown in the UI, update the test to make sure an instance becomes ready after creating it.
    test('create new dhis2 instance', async ({ page }) => {
        test.setTimeout(2 * 60 * 1000) // 2 minutes

        await page.getByRole('link', { name: 'Instances' }).click()
        await page.getByRole('button', { name: 'New instance' }).click()

        await expect(page.getByRole('group', { name: 'Basic information' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'DHIS2 Core' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'Database' })).toBeVisible()

        const randomName = 'e2e-test-' + Math.random().toString().substring(8)
        await page.getByRole('textbox', { name: 'Name' }).fill(randomName)
        await page.getByRole('textbox', { name: 'Description' }).fill('This is an e2e test instance.')

        // Select the test group
        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Group' }).getByTestId('dhis2-uicore-select-input').click()
        await page.getByTestId('dhis2-uicore-singleselectoption').filter({ hasText: targetGroup }).dispatchEvent('click')
        await page.keyboard.press('Escape') // dismiss dropdown layer

        // Select 1 hour lifetime
        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Lifetime' }).getByTestId('dhis2-uicore-select-input').click()
        await page.locator('[data-test="dhis2-uicore-singleselectoption"][data-value="3600"]').dispatchEvent('click')
        await page.keyboard.press('Escape') // dismiss dropdown layer

        // Select the DHIS2 core image tag
        const imageTagSelect = page
            .getByRole('group', { name: 'DHIS2 Core' })
            .locator('div', { hasText: /^Image Tag/ })
            .getByTestId('dhis2-uicore-select-input')
        await imageTagSelect.click()
        await page.getByPlaceholder('Filter options').fill(dhis2CoreImageTag)
        await page.locator(`[data-test="dhis2-uicore-singleselectoption"][data-value="${dhis2CoreImageTag}"]`).dispatchEvent('click')
        await page.keyboard.press('Escape') // dismiss dropdown layer

        // Select the database
        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Database' }).getByTestId('dhis2-uicore-select-input').click()

        // If there are more than 7 databases uploaded, we need to interact with the conditional #filter field.
        const numberOfDatabases = await page.getByTestId('dhis2-uicore-singleselectoption').count()
        if (numberOfDatabases > 7) {
            await page.locator('#filter').fill(dbFileName)
        }
        await page.getByText(dbFileName).dispatchEvent('click')
        await page.keyboard.press('Escape') // dismiss dropdown layer

        await expect(page.getByRole('button', { name: 'Create instance' })).toBeEnabled()
        await page.getByRole('button', { name: 'Create instance' }).click()

        // Navigate back to the instances list
        await expect(page.getByRole('button', { name: 'Back to list' })).toBeVisible({ timeout: 60000 })
        await page.getByRole('button', { name: 'Back to list' }).click()

        await expect(page.getByRole('cell', { name: randomName })).toBeVisible({ timeout: 60000 })

        const newInstanceRow = page.getByRole('row', { name: randomName })
        await newInstanceRow.getByRole('button', { name: 'Delete' }).click()

        // Scope to the confirmation dialog. @dhis2/ui's Modal sets aria-modal="true"
        // but not role="dialog" (see upstream issue), so we scope via the aria-modal
        // attribute rather than getByRole('dialog').
        const confirmDialog = page.locator('[aria-modal="true"]')
        await expect(confirmDialog.getByText(`Are you sure you want to delete instance "${randomName}"`)).toBeVisible()
        await confirmDialog.getByRole('button', { name: 'Confirm' }).dispatchEvent('click')

        // Instance teardown is backend-heavy and can exceed the default timeout, especially
        // when the instance is still provisioning at delete time (see TODO at the top of this test).
        await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(`Successfully deleted instance "${randomName}"`)).toBeVisible({ timeout: 90000 })
    })
})
