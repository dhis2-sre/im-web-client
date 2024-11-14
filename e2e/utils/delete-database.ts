import { expect } from '@playwright/test'

const defaultDbName = 'empty-db'
const dbNameExt = 'sql.gz'

export const deleteTestDatabase = async (page, dbName = defaultDbName) => {
    const dbFileName = `${dbName}.${dbNameExt}`

    // Navigate to Databases
    await page.getByRole('link', { name: 'Databases' }).click()
    
    // Wait for the view to load
    await expect(page.getByText('My groups')).toBeVisible()

    // Find the database in the table (accounting for icon in cell)
    const databaseCell = page.getByRole('cell', { name: new RegExp(dbFileName) })
    await expect(databaseCell).toBeVisible()

    // Find the row containing our database
    const databaseRow = databaseCell.locator('xpath=ancestor::tr')
    
    // Click the delete button in the actions column
    // Note: We now look for it within the actions cell
    const actionsCell = databaseRow.locator('td').last()
    await actionsCell.getByRole('button').filter({ hasIcon: 'delete' }).click()

    // Verify and confirm deletion
    await expect(page.getByTestId('dhis2-uicore-modalcontent')).toContainText(dbFileName)
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Verify success message
    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(new RegExp(`Successfully deleted [^/]+/${dbFileName}`))).toBeVisible()
    
    // Verify database is removed from table
    await expect(page.getByRole('cell', { name: new RegExp(dbFileName) })).not.toBeVisible()
}
