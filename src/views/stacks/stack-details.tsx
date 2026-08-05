import { Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, DataTableToolbar, NoticeBox } from '@dhis2/ui'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useStack } from '../../hooks/index.ts'
import { StackWithParameterGroups } from '../../types/index.ts'
import { groupStackParameters } from '../../utils/stack-parameter-groups.ts'
import styles from './stack-details.module.css'

export const StackDetails = () => {
    const { name } = useParams()
    const { stack, loading, error } = useStack(name ?? '')
    const sections = useMemo(() => groupStackParameters(stack as StackWithParameterGroups | undefined), [stack])

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Could not fetch stack details">
                {error.message}
            </NoticeBox>
        )
    }

    if (!stack) {
        return (
            <NoticeBox error title="Stack not found">
                {`No stack named "${name}" exists.`}
            </NoticeBox>
        )
    }

    return (
        <div key={stack.name}>
            <Heading title={stack.name} />
            {sections.map((section) => (
                <div key={section.group?.name ?? 'ungrouped'}>
                    <DataTableToolbar className={styles.tabletoolbar}>
                        {section.group?.title ?? 'Parameters'}
                        {section.group?.when && (
                            <span className={styles.groupCondition}>
                                in effect when {section.group.when.parameter} is {section.group.when.equals}
                            </span>
                        )}
                    </DataTableToolbar>
                    <DataTable className={styles.datatable}>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Default value</DataTableColumnHeader>
                                <DataTableColumnHeader>Sensitive</DataTableColumnHeader>
                                <DataTableColumnHeader>Consumed</DataTableColumnHeader>
                            </DataTableRow>
                        </DataTableHead>

                        <DataTableBody>
                            {section.parameters.map((parameter) => (
                                <DataTableRow key={parameter.parameterName}>
                                    <DataTableCell>{parameter.displayName}</DataTableCell>
                                    <DataTableCell>{parameter.defaultValue}</DataTableCell>
                                    <DataTableCell>{parameter.sensitive?.toString()}</DataTableCell>
                                    <DataTableCell>{parameter.consumed?.toString()}</DataTableCell>
                                </DataTableRow>
                            ))}
                        </DataTableBody>
                    </DataTable>
                </div>
            ))}
            <DataTableToolbar className={styles.tabletoolbar}>Requires</DataTableToolbar>
            <DataTable className={styles.datatable}>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>

                <DataTableBody>
                    {stack.requires
                        ?.sort((a, b) => (a.name < b.name ? -1 : 1))
                        .map((parameter) => {
                            return (
                                <DataTableRow key={parameter.name}>
                                    <DataTableCell>{parameter.name}</DataTableCell>
                                </DataTableRow>
                            )
                        })}
                </DataTableBody>
            </DataTable>
        </div>
    )
}
