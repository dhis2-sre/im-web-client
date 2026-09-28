import { test, expect } from '@playwright/test'
import { login, logout, uploadTestDatabase, deleteTestDatabase, deleteDeployment, targetGroup, dhis2CoreImageTag, dhis2CoreUpdateImageTag } from './utils/index.ts'

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
        test.setTimeout(30 * 60 * 1000) // the teardown waits the deploy out, since a delete mid-deploy is refused

        await page.getByRole('link', { name: 'Instances' }).click()
        await page.getByRole('button', { name: 'New instance', exact: true }).click()

        await expect(page.getByRole('group', { name: 'Basic information' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'DHIS 2 Core' })).toBeVisible()
        await expect(page.getByRole('group', { name: 'PostgreSQL' })).toBeVisible()

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
            .getByRole('group', { name: 'DHIS 2 Core' })
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

        await expect(page.getByRole('cell', { name: randomName, exact: true })).toBeVisible({ timeout: 60000 })

        // A deploy holds the deployment's deploy lock and the backend refuses a delete until it
        // finishes, so the row says so instead of offering a delete that would be turned away.
        const newInstanceRow = page.getByRole('row', { name: randomName })
        await expect(newInstanceRow.getByRole('button', { name: 'Delete' })).toBeDisabled()

        await deleteDeployment(page, randomName)
    })

    test('update existing dhis2 instance', async ({ page }) => {
        test.setTimeout(50 * 60 * 1000) // the edit waits out the first deploy and the teardown waits out the redeploy it triggers

        const randomName = 'e2e-test-' + Math.random().toString().substring(8)
        const updatedDescription = 'Updated by e2e test.'

        // Create the instance to update.
        await page.getByRole('link', { name: 'Instances' }).click()
        await page.getByRole('button', { name: 'New instance', exact: true }).click()

        await page.getByRole('textbox', { name: 'Name' }).fill(randomName)
        await page.getByRole('textbox', { name: 'Description' }).fill('Initial description.')

        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Group' }).getByTestId('dhis2-uicore-select-input').click()
        await page.getByTestId('dhis2-uicore-singleselectoption').filter({ hasText: targetGroup }).dispatchEvent('click')
        await page.keyboard.press('Escape')

        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Lifetime' }).getByTestId('dhis2-uicore-select-input').click()
        await page.locator('[data-test="dhis2-uicore-singleselectoption"][data-value="3600"]').dispatchEvent('click')
        await page.keyboard.press('Escape')

        const imageTagSelect = page
            .getByRole('group', { name: 'DHIS 2 Core' })
            .locator('div', { hasText: /^Image Tag/ })
            .getByTestId('dhis2-uicore-select-input')
        await imageTagSelect.click()
        await page.getByPlaceholder('Filter options').fill(dhis2CoreImageTag)
        await page.locator(`[data-test="dhis2-uicore-singleselectoption"][data-value="${dhis2CoreImageTag}"]`).dispatchEvent('click')
        await page.keyboard.press('Escape')

        await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Database' }).getByTestId('dhis2-uicore-select-input').click()
        const numberOfDatabases = await page.getByTestId('dhis2-uicore-singleselectoption').count()
        if (numberOfDatabases > 7) {
            await page.locator('#filter').fill(dbFileName)
        }
        await page.getByText(dbFileName).dispatchEvent('click')
        await page.keyboard.press('Escape')

        await page.getByRole('button', { name: 'Create instance' }).click()
        await expect(page.getByRole('button', { name: 'Back to list' })).toBeVisible({ timeout: 60000 })
        await page.getByRole('button', { name: 'Back to list' }).click()
        await expect(page.getByRole('cell', { name: randomName, exact: true })).toBeVisible({ timeout: 60000 })

        // Open details, then the edit form. An edit takes the same deploy lock a deploy holds, so
        // the page offers no edit until the deploy lands.
        await page.getByRole('row', { name: randomName }).click()
        await expect(page.getByRole('heading', { name: 'Instance details' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeEnabled({ timeout: 15 * 60 * 1000 })
        await page.getByRole('button', { name: 'Edit', exact: true }).click()
        await expect(page.getByRole('heading', { name: `Edit ${randomName}` })).toBeVisible()

        // Update the description.
        const descriptionInput = page.getByRole('textbox', { name: 'Description' })
        await descriptionInput.fill(updatedDescription)

        // Update the image tag, which is what makes the edit imply a redeploy.
        if (dhis2CoreUpdateImageTag !== dhis2CoreImageTag) {
            const editImageTagSelect = page
                .getByRole('group', { name: 'DHIS 2 Core' })
                .locator('div', { hasText: /^Image Tag/ })
                .getByTestId('dhis2-uicore-select-input')
            await editImageTagSelect.click()
            await page.getByPlaceholder('Filter options').fill(dhis2CoreUpdateImageTag)
            await page.locator(`[data-test="dhis2-uicore-singleselectoption"][data-value="${dhis2CoreUpdateImageTag}"]`).dispatchEvent('click')
            await page.keyboard.press('Escape')
        }

        await page.getByRole('button', { name: 'Save changes' }).click()

        // Successful update redirects back to the details view.
        await expect(page.getByRole('heading', { name: 'Instance details' })).toBeVisible({ timeout: 30000 })
        await expect(page.getByText(updatedDescription)).toBeVisible()

        // Cleanup.
        await page.getByRole('button', { name: 'Back to list' }).click()
        await deleteDeployment(page, randomName)
    })
})
