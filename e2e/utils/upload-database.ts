import path from 'path'
import { expect } from '@playwright/test'
import { targetGroup } from './env.ts'

const defaultDbName = 'empty-db'
const dbExtension = '.sql.gz'

const dbFixturePath = path.join(import.meta.dirname, `../fixtures/${defaultDbName}${dbExtension}`)

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

    // Scope further interactions to the upload dialog.
    // @dhis2/ui's Modal sets aria-modal="true" but not role="dialog" (see upstream issue),
    // so we scope via the aria-modal attribute rather than getByRole('dialog').
    const uploadDialog = page.locator('[aria-modal="true"]')

    await uploadDialog.getByLabel('Name').fill(dbName)

    await expect(page.getByText(`Selected database file: ${fileName}`)).toBeVisible()

    const uploadButton = uploadDialog.getByRole('button', { name: 'Upload' })
    await expect(uploadButton).toBeEnabled()
    await uploadButton.click()

    await expect(page.getByTestId('dhis2-uicore-alertbar').getByText('Database added successfully')).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('cell', { name: fileName, exact: true })).toBeVisible()

    return { fileName }
}
