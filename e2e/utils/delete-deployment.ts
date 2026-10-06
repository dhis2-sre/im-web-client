import { expect, Page } from '@playwright/test'

/* The backend holds a deployment's deploy lock for the whole deploy and refuses a delete while it
 * does, which the list reflects by offering no delete until the deploy lands. Tearing an instance
 * down therefore means waiting the deploy out, so a test that is not itself about the delete still
 * leaves nothing behind. */
export const deleteDeployment = async (page: Page, name: string, deployTimeout = 15 * 60 * 1000) => {
    await page.getByRole('link', { name: 'Instances' }).click()
    await expect(page.getByRole('cell', { name, exact: true })).toBeVisible({ timeout: 60000 })

    const deleteButton = page.getByRole('row', { name }).getByRole('button', { name: 'Delete' })
    await expect(deleteButton).toBeEnabled({ timeout: deployTimeout })
    await deleteButton.click()

    // Scope to the confirmation dialog. @dhis2/ui's Modal sets aria-modal="true" but not
    // role="dialog" (see upstream issue), so we scope via the aria-modal attribute.
    const confirmDialog = page.locator('[aria-modal="true"]')
    await expect(confirmDialog.getByText(`Are you sure you want to delete instance "${name}"`)).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Confirm' }).dispatchEvent('click')

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(`Successfully deleted instance "${name}"`)).toBeVisible({ timeout: 90000 })
}
