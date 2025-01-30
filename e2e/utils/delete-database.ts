import { expect } from '@playwright/test'

export const deleteTestDatabase = async (page, dbName: string) => {
    await page.route(`/databases/${dbName}`, async (route) => {
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })

    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText(`Successfully deleted [^/]+/${dbName}`)).toBeVisible()
}
