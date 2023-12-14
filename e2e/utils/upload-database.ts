import { expect } from '@playwright/test'
import path from "path";

const dbNamePrefix = 'test/'
const dbName = 'empty-db'
const dbExtension = '.sql.gz'

export const uploadTestDatabase = async (page) => {
    await page.getByRole('link', { name: 'Databases' }).click()
    await expect(page.getByRole('button', { name: 'Upload database' })).toBeVisible()
    // TODO find a better way to make sure the page is loaded and if there was an test db uploaded it's shown.
    // The problem is that if there are no databases uploaded, only the "Upload database" button is displayed
    // and it loads before the databases list table, so it's unreliable to just wait for the button to be visible.
    // page.waitForLoadState() with any of the state options doesn't work.
    await page.waitForTimeout(3000)

    const testDatabaseIsVisible = await page.getByRole('cell', { name: `${dbNamePrefix}${dbName}${dbExtension}` }).isVisible()

    if (!testDatabaseIsVisible) {
        await page.getByRole('button', { name: 'Upload database' }).click()

        await expect(page.getByRole('button', { name: 'Select database' })).toBeVisible()
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.getByRole('button', { name: 'Select database' }).click()
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(path.join(__dirname, `../fixtures/${dbName}${dbExtension}`));
        await page.getByTestId('upload-database-name').getByRole('textbox').fill(`${dbNamePrefix}${dbName}`);
        await expect(page.getByText(`Selected database file: ${dbNamePrefix}${dbName}${dbExtension}`)).toBeVisible();

        await expect(page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' })).toBeEnabled()
        await page.getByTestId('dhis2-uicore-modalactions').getByRole('button', { name: 'Upload' }).click()
        await expect(page.getByText('Uploading database file: test/empty-db.sql.gz')).toBeVisible();

        await expect(page.getByTestId('dhis2-uicore-alertbar').getByText('Database added successfully')).toBeVisible();
        await expect(page.getByRole('cell', { name: `${dbNamePrefix}${dbName}${dbExtension}` })).toBeVisible();
    }
}
