import { expect } from '@playwright/test'

const defaultDbName = 'empty-db'
const dbNameExt = 'sql.gz'

export const deleteTestDatabase = async (page, dbName = defaultDbName) => {
    const dbFileName = `${dbName}.${dbNameExt}`

    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()

    await expect(page.getByRole('cell', { name: dbFileName })).toBeVisible()
    const testDatabaseRow = page.getByRole('row', { name: dbFileName })
    await testDatabaseRow.getByTestId('dhis2-uicore-button').click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()

    await expect(page.getByTestId('dhis2-uicore-modalcontent')).toContainText(dbFileName)
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(new RegExp(`Successfully deleted [^/]+/${dbFileName}`))).toBeVisible()
}
