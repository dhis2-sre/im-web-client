import { expect, Page } from '@playwright/test'

export const deleteTestDatabase = async (page: Page, name: string) => {
    await page.locator('body').click()

    await page.getByRole('link', { name: 'Databases' }).click()
    //    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()

    await expect(page.getByRole('cell', { name: name })).toBeVisible()
    const row = page.getByRole('row', { name: name })
    await row.getByTestId('dhis2-uicore-button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(page.getByTestId('dhis2-uicore-modalcontent')).toContainText(name)
    await page.getByRole('button', { name: 'Confirm' }).click()

    const expectMessage = page.getByTestId('dhis2-uicore-alertbar').getByText(new RegExp(`Successfully deleted [^/]+/${name}`))
    await expect(expectMessage).toBeVisible()
}
