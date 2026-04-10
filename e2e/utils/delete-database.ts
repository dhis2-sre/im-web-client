import { expect, Page } from '@playwright/test'

export const deleteTestDatabase = async (page: Page, name: string) => {
    // Dismiss any open modals and navigate to databases via client-side navigation
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()

    await expect(page.getByRole('cell', { name: name, exact: true })).toBeVisible()
    const row = page.getByRole('row', { name: name })
    await row.getByTestId('dhis2-uicore-button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).dispatchEvent('click')

    await expect(page.getByText('Are you sure you wish to delete')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).dispatchEvent('click')

    const expectMessage = page.getByTestId('dhis2-uicore-alertbar').getByText(new RegExp(`Successfully deleted [^/]+/${name}`))
    await expect(expectMessage).toBeVisible()
}
