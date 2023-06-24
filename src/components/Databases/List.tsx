import {
    Button,
    DataTable,
    DataTableBody as TableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableHead as TableHead,
    DataTableRow,
    DataTableToolbar as TableToolbar,
    Help,
    IconAdd24,
    IconDelete16,
    IconLaunch16,
    LinearLoader
} from '@dhis2/ui'
import {useApi} from '../../api/useApi'
import styles from './List.module.css'
import {GroupWithDatabases} from "../../types"
import {API_HOST, createExternalDownloadDatabase, deleteDatabase, getDatabases, postDatabase} from "../../api"
import Moment from "react-moment"
import {useCallback, useState} from "react"
import {useAuthHeader} from "react-auth-kit"

const ListDatabases = () => {
    const {data: groupWithDatabases, refetch} = useApi<GroupWithDatabases>(getDatabases)
    const [databaseError, setDatabaseError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const getAuthHeader = useAuthHeader()
    const [uploadAmount, setUploadAmount] = useState(0);
    const [showUploadProgress, setShowUploadProgress] = useState(false);

    const upload = useCallback(async (event, group) => {
        const file = event.target.files[0]
        const formData = new FormData()
        formData.append("group", group)
        formData.append("database", file, file.name)
        const authHeader = getAuthHeader()
        try {
            setShowUploadProgress(true)
            const result = await postDatabase(authHeader, formData, (progressEvent) => {
                setUploadAmount(progressEvent.loaded / file.size * 100)
            })
            if (result.status === 201) {
                await refetch()
            } else {
                setDatabaseError(result.data.toString())
            }
        } catch (error) {
            setDatabaseError(error.response.data)
        } finally {
            setShowUploadProgress(false)
        }
    }, [getAuthHeader, refetch])

    const deleteDatabaseCallback = useCallback(async (database) => {
            if (!window.confirm(`Are you sure you wish to delete "${database.groupName}/${database.name}"?`)) {
                return
            }

            const authHeader = getAuthHeader()
            try {
                setIsDeleting(true)
                const result = await deleteDatabase(authHeader, database.id)
                if (result.status === 202) {
                    await refetch()
                } else {
                    setDatabaseError(result.data)
                }
            } catch (error) {
                setDatabaseError(error.response.data)
            } finally {
                setIsDeleting(false)
            }
        }, [getAuthHeader, refetch]
    )

    const download = useCallback(async (id) => {
        try {
            setIsDeleting(true)
            const authHeader = getAuthHeader()
            const response = await createExternalDownloadDatabase(authHeader, id, 5)
            const link = document.createElement('a')
            link.href = API_HOST + "/databases/external/" + response.data.uuid
            link.target = "_blank"
            link.click()
        } catch (error) {
            setDatabaseError(error.toString())
        } finally {
            setIsDeleting(false)
        }
    }, [getAuthHeader])

    return (
        <div className={styles.wrapper}>
            { showUploadProgress ? <LinearLoader className={styles.loader} amount={uploadAmount}/> : null }
            <div className={styles.heading}>
                <h1>All databases</h1>
            </div>
            {databaseError && <Help error>{databaseError}</Help>}

            {groupWithDatabases?.map(group => {
                return (
                    <div key={group.name}>
                        <TableToolbar className={styles.tabletoolbar}>
                            <span>{group.name}</span>
                            <Button icon={<IconAdd24/>}>
                                <label htmlFor="upload">Upload database</label>
                            </Button>
                            <input id="upload" type="file" onChange={(event) => upload(event, group.name)}
                                   hidden={true}/>
                        </TableToolbar>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader>Name</DataTableColumnHeader>
                                    <DataTableColumnHeader>Created</DataTableColumnHeader>
                                    <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                    <DataTableColumnHeader></DataTableColumnHeader>
                                </DataTableRow>
                            </TableHead>
                            <TableBody>
                                {group.databases?.map(database => {
                                    return (
                                        <DataTableRow key={database.id}>
                                            <DataTableCell>{database.name}</DataTableCell>
                                            <DataTableCell>
                                                <Moment date={database.createdAt} fromNow/>
                                            </DataTableCell>
                                            <DataTableCell>
                                                <Moment date={database.updatedAt} fromNow/>
                                            </DataTableCell>
                                            <DataTableCell>
                                                <Button small loading={isDeleting}
                                                        disabled={isDeleting} icon={<IconLaunch16/>}
                                                        onClick={() => download(database.id)}>Download</Button>
                                                &nbsp;
                                                <Button small destructive loading={isDeleting}
                                                        disabled={isDeleting} icon={<IconDelete16/>}
                                                        onClick={() => deleteDatabaseCallback(database)}>Delete</Button>
                                            </DataTableCell>
                                        </DataTableRow>
                                    )
                                })}
                            </TableBody>
                        </DataTable>
                    </div>
                )
            })}
        </div>
    )
}

export default ListDatabases
