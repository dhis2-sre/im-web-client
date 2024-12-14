import path from 'path'
import { expect } from '@playwright/test'

const defaultDbName = 'empty-db'
const dbExtension = '.sql.gz'

const dbFixturePath = path.join(__dirname, `../fixtures/${defaultDbName}${dbExtension}`)

export const uploadTestDatabase = async (page, dbName = defaultDbName) => {
    const fileName = `${dbName}${dbExtension}`

    // Navigate to Databases and wait for the view to load
    await page.getByRole('link', { name: 'Databases' }).click()

    // Wait for the two-panel view to be visible
    await expect(page.getByText('My groups')).toBeVisible()

    // Select a group (assuming first group) to enable upload
    const firstGroup = await page.getByRole('treeitem').first()
    await firstGroup.click()

    // Click upload button (now in the top bar)
    await expect(page.getByRole('button', { name: 'Upload' })).toBeEnabled()
    await page.getByRole('button', { name: 'Upload' }).click()

    // Handle file selection in modal
    await expect(page.getByRole('button', { name: 'Select database' })).toBeVisible()
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Select database' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(dbFixturePath)

    // Fill in database name
    await page.getByTestId('upload-database-name').getByRole('textbox').fill(dbName)
    await expect(page.getByText(`Selected database file: ${fileName}`)).toBeVisible()

    // Submit upload
    await expect(page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' })).toBeEnabled()
    await page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' }).click()

    // Wait for upload progress and success
    await expect(page.getByText(`Uploading database file: ${fileName}`)).toBeVisible()
    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText('Database added successfully')).toBeVisible()

    // Verify database appears in table
    await expect(page.getByRole('cell', { name: new RegExp(fileName) })).toBeVisible()

    return { fileName }
}
