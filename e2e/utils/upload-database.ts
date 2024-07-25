import path from 'path'
import { expect } from '@playwright/test'

const defaultDbName = 'empty-db'
const dbExtension = '.sql.gz'

const dbFixturePath = path.join(__dirname, `../fixtures/${defaultDbName}${dbExtension}`)

export const uploadTestDatabase = async (page, dbName = defaultDbName) => {
    const fileName = `${dbName}${dbExtension}`

    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()
    await page.getByRole('button', { name: 'Upload database' }).click()

    await expect(page.getByRole('button', { name: 'Select database' })).toBeVisible()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Select database' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(dbFixturePath)
    await page.getByTestId('upload-database-name').getByRole('textbox').fill(dbName)
    await expect(page.getByText(`Selected database file: ${fileName}`)).toBeVisible()

    await expect(page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' })).toBeEnabled()
    await page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' }).click()
    await expect(page.getByText(`Uploading database file: ${fileName}`)).toBeVisible()

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText('Database added successfully')).toBeVisible()
    await expect(page.getByRole('cell', { name: fileName })).toBeVisible()

    return { fileName }
}
