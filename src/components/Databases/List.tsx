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
} from '@dhis2/ui'
import {useApi} from '../../api/useApi'
import styles from './List.module.css'
import {GroupWithDatabases} from "../../types";
import {getDatabases, postDatabase} from "../../api";
import Moment from "react-moment";
import {useCallback, useState} from "react";
import {useAuthHeader} from "react-auth-kit";

const ListDatabases = () => {
    const {data: groupWithDatabases, refetch} = useApi<GroupWithDatabases>(getDatabases)
    const [signUpError, setSignUpError] = useState('')
    const getAuthHeader = useAuthHeader()

    const upload = useCallback(async (event, group) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("group", group)
        formData.append("database", file, file.name)
        const authHeader = getAuthHeader()
        try {
            const result = await postDatabase(authHeader, formData)
            if (result.status === 201) {
                await refetch()
            } else {
                setSignUpError(result.data.toString())
            }
        } catch (error) {
            setSignUpError(error.response.data)
        }
    }, [getAuthHeader, refetch])

    return (
        <div className={styles.wrapper}>
            <div className={styles.heading}>
                <h1>All databases</h1>
            </div>
            {signUpError && <Help error>{signUpError}</Help>}

            {groupWithDatabases?.map((group) => {
                return (
                    <div key={group.Name}>
                        <TableToolbar className={styles.tabletoolbar}>
                            <span>{group.Name}</span>
                            <Button icon={<IconAdd24/>}>
                                <label htmlFor="upload">Upload database</label>
                            </Button>
                            <input id="upload" type="file" onChange={(event) => upload(event, group.Name)}
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
                                {group.Databases?.map(database => {
                                    return (
                                        <DataTableRow key={database.ID}>
                                            <DataTableCell>{database.Name}</DataTableCell>
                                            <DataTableCell>
                                                <Moment date={database.CreatedAt} durationFromNow/>
                                            </DataTableCell>
                                            <DataTableCell>{database.UpdatedAt}</DataTableCell>
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
