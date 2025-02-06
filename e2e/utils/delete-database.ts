import { expect } from '@playwright/test'

const defaultDbName = 'empty-db.sql.gz'

export const deleteTestDatabase = async (page, dbName = defaultDbName) => {
    const dbFileName = `${dbName}`

    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()

    await expect(page.getByRole('cell', { name: dbFileName })).toBeVisible()
}
