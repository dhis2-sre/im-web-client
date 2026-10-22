import { expect, Page } from '@playwright/test'

/* The backend holds a deployment's deploy lock for the whole deploy and refuses a delete while it
 * does, which the list reflects by offering no delete until the deploy lands. Tearing an instance
 * down therefore means waiting the deploy out, so a test that is not itself about the delete still
 * leaves nothing behind. */
export const deleteDeployment = async (page: Page, name: string, deployTimeout = 15 * 60 * 1000) => {
    await page.getByRole('link', { name: 'Instances' }).click()
    await expect(page.getByRole('cell', { name, exact: true })).toBeVisible({ timeout: 60000 })

    // The open menu follows the list as it refetches, so it can stay open while the deploy lands.
    await page
        .getByRole('row', { name })
        .getByRole('button', { name: `Actions for ${name}` })
        .click()
    const deleteItem = page.getByRole('menuitem', { name: 'Delete' })
    await expect(deleteItem).not.toHaveAttribute('aria-disabled', 'true', { timeout: deployTimeout })
    await deleteItem.dispatchEvent('click')

    // Scope to the confirmation dialog. @dhis2/ui's Modal sets aria-modal="true" but not
    // role="dialog" (see upstream issue), so we scope via the aria-modal attribute. Deleting an
    // instance asks for its name to be typed out.
    const confirmDialog = page.locator('[aria-modal="true"]')
    await confirmDialog.getByLabel(`Type ${name} to confirm`).fill(name)
    await confirmDialog.getByRole('button', { name: 'Delete' }).dispatchEvent('click')

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(`Successfully deleted instance "${name}"`)).toBeVisible({ timeout: 90000 })
}
