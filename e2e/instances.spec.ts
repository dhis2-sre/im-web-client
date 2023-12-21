import { test, expect } from '@playwright/test'
import {login, logout, uploadTestDatabase, deleteTestDatabase} from './utils'

test.describe('new instance', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await uploadTestDatabase(page)
    })
    test.afterEach(async ({ page }) => {
        await deleteTestDatabase(page)
        await logout(page)
    })

    test('create new dhis2 instance', async ({ page }) => {
        test.setTimeout(10 * 60 * 1000) // 10 minutes

        await page.getByRole('link', { name: 'Instances' }).click()
        await page.getByRole('button', { name: 'New DHIS2 instance' }).click()

        await expect(page.getByRole('group', { name: 'Basic information' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'Instance configuration' })).toBeVisible()
        await expect(page.getByText('Advanced configuration')).toBeVisible()

        const randomName = 'e2e-test-' + Math.random().toString().substring(8)
        await page.getByRole('textbox', { name: 'Name'}).fill(randomName)
        await page.getByRole('textbox', { name: 'Description'}).fill('This is an e2e test instance.')

        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Database' }).getByTestId('dhis2-uicore-select-input').click()
        await page.getByText('whoami/test/empty-db.sql.gz').click()

        await expect(page.getByRole('button', { name: 'Create instance' })).toBeEnabled()
        await page.getByRole('button', { name: 'Create instance' }).click()
        await expect(page.getByRole('cell', { name: randomName })).toBeVisible({timeout: 10000})

        // TODO is there a better way to make sure instance is Running?
        const newInstanceRow = page.locator(`//table[@data-test='dhis2-uicore-datatable']//tr[contains(td[2], '${randomName}')]`)

        let status: string

        do {
            await expect(newInstanceRow.locator('td:first-child')).toHaveText(/^[A-Za-z]+$/)
            status = await newInstanceRow.locator('td:first-child').textContent()
            await page.waitForTimeout(5000)
            await page.reload()
        } while (status !== 'Running')

        await expect(newInstanceRow.locator('td:first-child')).toContainText('Running')

        await newInstanceRow.getByTestId('instances-list-menu-button').click()
        await page.locator('a').filter({ hasText: 'Delete' }).click()
        await expect(page.getByTestId('dhis2-uicore-modalcontent')).toContainText(randomName)
        await page.getByRole('button', {name: 'Confirm'}).click()

        await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(`Successfully deleted instance "${randomName}"`)).toBeVisible({timeout: 10000})
    })
})
