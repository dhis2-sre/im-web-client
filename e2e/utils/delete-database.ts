import { expect } from '@playwright/test'
import path from "path";

const testDbName = 'test/empty-db.sql.gz'
const testGroup = 'whoami'

export const deleteTestDatabase = async (page) => {
    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()
    await expect(page.getByRole('cell', { name: testDbName })).toBeVisible()

    const testDatabaseRow = page.locator(`//table[@data-test='dhis2-uicore-datatable']//tr[contains(td[1], '${testDbName}')]`)
    await testDatabaseRow.getByRole('button', {name: 'Delete'}).click()

    await expect(page.getByTestId('dhis2-uicore-modalcontent')).toContainText(testDbName)
    await page.getByRole('button', {name: 'Confirm'}).click()

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText(`Successfully deleted ${testGroup}/${testDbName}`)).toBeVisible()
}
