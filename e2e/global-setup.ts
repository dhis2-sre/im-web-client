import { request } from '@playwright/test'
import { password, targetGroup, username } from './utils/env.ts'

// A run that fails or is cancelled before its own cleanup leaves its databases behind. Runs share
// the target group, so only databases older than any run can still be are removed.
const staleAfterMs = 2 * 60 * 60 * 1000
const testDatabaseName = /^(copy-)?e2e-(copy-)?test-\d+/

export default async function deleteStaleTestDatabases() {
    const api = await request.newContext({ baseURL: process.env.API_URL })
    try {
        const basicAuth = Buffer.from(`${username}:${password}`).toString('base64')
        const signIn = await api.post('/tokens', { headers: { Authorization: `Basic ${basicAuth}` }, data: {} })
        if (!signIn.ok()) {
            throw new Error(`Signing in to delete stale test databases failed: ${signIn.status()}`)
        }

        const response = await api.get('/databases')
        if (!response.ok()) {
            throw new Error(`Listing databases to delete stale test databases failed: ${response.status()}`)
        }
        const groups: { name: string; databases: { id: number; name: string; createdAt: string }[] }[] = await response.json()
        const databases = groups.find((group) => group.name === targetGroup)?.databases ?? []
        const stale = databases.filter((database) => testDatabaseName.test(database.name) && Date.now() - Date.parse(database.createdAt) > staleAfterMs)

        for (const database of stale) {
            const deleted = await api.delete(`/databases/${database.id}`)
            if (!deleted.ok()) {
                console.warn(`Could not delete stale test database ${targetGroup}/${database.name}: ${deleted.status()}`)
            }
        }
    } finally {
        await api.dispose()
    }
}
