import { Button, Card, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import prettyBytes from 'pretty-bytes'
import { useEffect, useState } from 'react'
import Moment from 'react-moment'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { Database } from '../../types/generated/models/Database.ts'
import styles from './databases-list.module.css'

export const DatabaseDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [{ data: database, loading }] = useAuthAxios<Database>(`databases/${id}`)

    const [db, setDb] = useState<Database>()

    useEffect(() => {
        setDb(database)
    }, [database])

    if (loading || !db) {
        return (
            <Center className={styles.loaderWrap}>
                <CircularLoader />
            </Center>
        )
    }

    const details = [
        { name: 'ID', value: db.id?.toString() },
        { name: 'Name', value: db.name },
        { name: 'Description', value: db.description },
        { name: 'Slug', value: db.slug },
        { name: 'Type', value: db.type },
        { name: 'Size', value: db.size ? prettyBytes(db.size) : undefined },
        { name: 'URL', value: db.url },
        { name: 'Group', value: db.groupName },
        { name: 'Created', value: db.createdAt ? <Moment date={db.createdAt} fromNow /> : undefined },
        { name: 'Updated', value: db.updatedAt ? <Moment date={db.updatedAt} fromNow /> : undefined },
        {
            name: 'Filestore ID',
            value: db.filestoreId ? (
                <span onClick={() => navigate(`/databases/${db.filestoreId}`)} style={{ cursor: 'pointer', color: 'var(--colors-blue600)', textDecoration: 'underline' }}>
                    {db.filestore?.name || db.filestoreId}
                </span>
            ) : undefined,
        },
        { name: 'User', value: db.user?.email },
    ].filter((d) => d.value !== undefined && d.value !== null)

    return (
        <>
            <Heading title="Database details">
                <Button onClick={() => navigate('/databases')}>Back to list</Button>
            </Heading>
            <div className={styles.cardWrap}>
                <Card className={styles.card}>
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
        </>
    )
}
