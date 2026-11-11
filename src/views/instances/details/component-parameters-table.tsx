import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconLock16 } from '@dhis2/ui'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useDatabaseLabel } from '../../../hooks/index.ts'
import { ParameterEntry } from '../../../utils/component-parameters.ts'
import styles from './instance-components.module.css'

const DatabaseLink: FC<{ id: string }> = ({ id }) => {
    const { label } = useDatabaseLabel(id)

    if (!id) {
        return null
    }

    return <Link to={`/databases/${id}`}>{label}</Link>
}

export const ComponentParametersTable: FC<{ parameters: ParameterEntry[] }> = ({ parameters }) => (
    <DataTable>
        <DataTableHead>
            <DataTableRow>
                <DataTableColumnHeader>Name</DataTableColumnHeader>
                <DataTableColumnHeader>Value</DataTableColumnHeader>
            </DataTableRow>
        </DataTableHead>
        <DataTableBody>
            {parameters.map((parameter) => (
                <DataTableRow key={parameter.name}>
                    <DataTableCell staticStyle>{parameter.displayName}</DataTableCell>
                    <DataTableCell staticStyle>
                        {parameter.sensitive && (
                            <span className={styles.hidden}>
                                <IconLock16 />
                                Hidden
                            </span>
                        )}
                        {!parameter.sensitive && parameter.name === 'DATABASE_ID' && <DatabaseLink id={String(parameter.value ?? '')} />}
                        {!parameter.sensitive && parameter.name !== 'DATABASE_ID' && (parameter.value.trim() || <span className={styles.muted}>Not set</span>)}
                    </DataTableCell>
                </DataTableRow>
            ))}
        </DataTableBody>
    </DataTable>
)
