import { expect, Page } from '@playwright/test'

export const deleteTestDatabase = async (page: Page, name: string) => {
    // Dismiss any open modals and navigate to databases via client-side navigation
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()

    await expect(page.getByRole('cell', { name: name, exact: true })).toBeVisible()
    const row = page.getByRole('row', { name: name })
    await row.getByRole('button', { name: `Actions for ${name}` }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).dispatchEvent('click')

    // Scope to the confirmation dialog. @dhis2/ui's Modal sets aria-modal="true"
    // but not role="dialog" (see upstream issue), so we scope via the aria-modal
    // attribute rather than getByRole('dialog').
    const confirmDialog = page.locator('[aria-modal="true"]')
    await expect(confirmDialog.getByText('Are you sure you want to delete')).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Confirm' }).dispatchEvent('click')

    const expectMessage = page.getByTestId('dhis2-uicore-alertbar').getByText(new RegExp(`Successfully deleted [^/]+/${name}`))
    await expect(expectMessage).toBeVisible()
}
