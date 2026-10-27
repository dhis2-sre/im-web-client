import { Card, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, Tooltip } from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import { useEffect, useState } from 'react'
import Moment from 'react-moment'
import { Link, useParams } from 'react-router-dom'
import { Page } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/generated/models/Database.ts'

export const DatabaseDetails = () => {
    const { id } = useParams()
    const [{ data: database, loading, error }] = useAuthAxios<Database>(`databases/${id}`)

    const [db, setDb] = useState<Database>()

    useEffect(() => {
        setDb(database)
    }, [database])

    if (!db) {
        return (
            <Page
                parent={{ label: 'Databases', to: '/databases' }}
                loading={loading || !error}
                error={error ? { title: 'Could not fetch the database', description: error.message } : undefined}
            />
        )
    }

    const details = [
        { name: 'ID', value: db.id?.toString() },
        { name: 'Name', value: db.name },
        { name: 'Description', value: db.description },
        { name: 'Slug', value: db.slug },
        { name: 'Type', value: db.type },
        { name: 'Size', value: db.size ? <Tooltip content={`${db.size} bytes`}>{prettyBytes(db.size)}</Tooltip> : '-' },
        { name: 'Group', value: db.groupName },
        {
            name: 'Created',
            value: db.createdAt ? (
                <Tooltip content={<Moment date={db.createdAt} format="YYYY-MM-DD HH:mm:ss" />}>
                    <Moment date={db.createdAt} fromNow />
                </Tooltip>
            ) : undefined,
        },
        {
            name: 'Updated',
            value: db.updatedAt ? (
                <Tooltip content={<Moment date={db.updatedAt} format="YYYY-MM-DD HH:mm:ss" />}>
                    <Moment date={db.updatedAt} fromNow />
                </Tooltip>
            ) : undefined,
        },
        {
            name: 'Files',
            value: db.filestoreId ? (
                <Link to={`/databases/${db.filestoreId}`}>
                    {db.filestore?.name ?? `Filestore ${db.filestoreId}`}
                    {db.filestore?.size ? ` (${prettyBytes(db.filestore.size)})` : ''}
                </Link>
            ) : (
                'None saved with this database'
            ),
        },
        { name: 'User', value: db.user?.email },
    ].filter((d) => d.value !== undefined && d.value !== null)

    return (
        <Page parent={{ label: 'Databases', to: '/databases' }} title={db.name || 'Database'}>
            <div>
                <Card>
                    <DataTable>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Value</DataTableColumnHeader>
                            </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                            {details.map((detail) => (
                                <DataTableRow key={detail.name}>
                                    <DataTableCell staticStyle>{detail.name}</DataTableCell>
                                    <DataTableCell staticStyle>{detail.value}</DataTableCell>
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                    </DataTable>
                </Card>
            </div>
        </Page>
    )
}
