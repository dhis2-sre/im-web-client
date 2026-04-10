import path from 'path'
import { expect } from '@playwright/test'
import { targetGroup } from './env.ts'

const defaultDbName = 'empty-db'
const dbExtension = '.sql.gz'

const dbFixturePath = path.join(__dirname, `../fixtures/${defaultDbName}${dbExtension}`)

export const uploadTestDatabase = async (page, dbName = defaultDbName) => {
    const fileName = `${dbName}${dbExtension}`

    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()
    await page.getByRole('button', { name: 'Upload database' }).click()

    await expect(page.getByRole('button', { name: 'Select database' })).toBeVisible()

    // Select the target group
    await page.getByTestId('dhis2-uiwidgets-singleselectfield').filter({ hasText: 'Group' }).getByTestId('dhis2-uicore-select-input').click()
    await page.getByTestId('dhis2-uicore-singleselectoption').filter({ hasText: targetGroup }).dispatchEvent('click')
    await page.keyboard.press('Escape') // dismiss dropdown layer

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Select database' }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(dbFixturePath)
    await page.getByTestId('upload-database-name').getByRole('textbox').fill(dbName)

    await expect(page.getByText(`Selected database file: ${fileName}`)).toBeVisible()

    await expect(page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' })).toBeEnabled()
    await page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' }).click()

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText('Database added successfully')).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('cell', { name: fileName, exact: true })).toBeVisible()

    return { fileName }
}
