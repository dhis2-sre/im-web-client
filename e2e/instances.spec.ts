import { test, expect } from '@playwright/test'
import { login, logout, uploadTestDatabase, deleteTestDatabase } from './utils'

test.describe('new instance', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await uploadTestDatabase(page)
    })
    test.afterEach(async ({ page }) => {
        await deleteTestDatabase(page)
        await logout(page)
    })

    // This test doesn't make sure that the newly created instance is running, only that it's
    // shown in the list view. This is because currently we don't show the status of an instance or
    // its components on the UI.
    // TODO once the status is shown in the UI, update the test to make sure an instance becomes ready after creating it.
    test('create new dhis2 instance', async ({ page }) => {
        test.setTimeout(10 * 60 * 1000) // 10 minutes

        await page.getByRole('link', { name: 'Instances' }).click()
        await page.getByRole('button', { name: 'New instance' }).click()

        await expect(page.getByRole('group', { name: 'Basic information' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'DHIS2 Core' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'Database' })).toBeVisible()

        const randomName = 'e2e-test-' + Math.random().toString().substring(8)
        await page.getByRole('textbox', { name: 'Name' }).fill(randomName)
        await page.getByRole('textbox', { name: 'Description' }).fill('This is an e2e test instance.')

        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Database' }).getByTestId('dhis2-uicore-select-input').click()
        await page.getByText('whoami/test/empty-db.sql.gz').click()

        await expect(page.getByRole('button', { name: 'Create instance' })).toBeEnabled()
        await page.getByRole('button', { name: 'Create instance' }).click()
        await expect(page.getByRole('cell', { name: randomName })).toBeVisible({ timeout: 10000 })

        await page.getByRole('button', { name: 'Delete' }).click()
        await expect(page.getByTestId('dhis2-uicore-modalcontent')).toContainText(randomName)
        await page.getByRole('button', { name: 'Confirm' }).click()

        await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(`Successfully deleted instance "${randomName}"`)).toBeVisible({ timeout: 10000 })
    })
})
