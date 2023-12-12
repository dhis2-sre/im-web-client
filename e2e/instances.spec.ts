import { test, expect } from '@playwright/test'
import {login, logout, uploadTestDatabase} from './utils'

test.describe('new instance', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await uploadTestDatabase(page)
    })
    test.afterEach(async ({ page }) => {
        await logout(page)
    })

    test('create new dhis2 instance', async ({ page }) => {
        await page.getByRole('link', { name: 'Instances' }).click()

        await page.getByRole('button', { name: 'New DHIS2 instance' }).click()

        await expect(page.getByRole('group', { name: 'Basic information' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'Instance configuration' })).toBeVisible()
        await expect(page.getByText('Advanced configuration')).toBeVisible()

        const randomName = 'e2e-test-' + Math.random().toString().substring(8)
        await page.getByRole('textbox', { name: 'Name'}).fill(randomName)
        await page.getByRole('textbox', { name: 'Description'}).fill('This is an e2e test instance.')

        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: /^Database\*$/ }).getByTestId('dhis2-uicore-select-input').click()
        await page.getByText('whoami/test/empty-db.sql.gz').click()

        await expect(page.getByRole('button', { name: 'Create instance' })).toBeEnabled()
        await page.getByRole('button', { name: 'Create instance' }).click()
        await expect(page.getByRole('cell', { name: randomName })).toBeVisible();

        // TODO make sure instance is Running
    })
})
