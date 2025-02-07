import { expect } from '@playwright/test'

export const deleteTestDatabase = async (page) => {
    await page.locator('body').click()

    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()

    const firstRowButton = page
        .locator('table[data-test="dhis2-uicore-datatable"] tbody tr:first-child td[data-test="dhis2-uicore-datatablecell"]:last-child button[data-test="dhis2-uicore-button"]')
        .first()

    await firstRowButton.click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(page.getByTestId('dhis2-uicore-modalcontent')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    const alertBar = page.locator('div[data-test="dhis2-uicore-alertbar"]')
    
    await expect(alertBar.first()).toBeVisible()
}
