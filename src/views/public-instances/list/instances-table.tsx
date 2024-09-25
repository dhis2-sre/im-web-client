import { DataTable, DataTableBody, DataTableHead, DataTableRow, DataTableCell, NoticeBox, Center, CircularLoader, LogoIcon, DataTableColumnHeader } from '@dhis2/ui'
import { InstancePlay } from './instance-play.tsx'
import { useInstanceTableData, GroupWithCategories, Instance } from './instance-table-filters.tsx'
import styles from './instances-table.module.css'

interface TableBodyProps {
    instances: Instance[]
    category: string
}

const TableBody = ({ instances, category }: TableBodyProps) => (
    <>
        <DataTableRow>
            <DataTableColumnHeader colSpan="3">
                <span className={styles.groupName}>{category}</span>
            </DataTableColumnHeader>
        </DataTableRow>
        {instances.map((instance) => (
            <DataTableRow key={instance.name}>
                <DataTableCell onClick={() => window.open(instance.hostname, '_blank', 'noopener,noreferrer')}>
                    <span className={styles.instance}>
                        <LogoIcon /> {instance.name}
                    </span>
                </DataTableCell>
                <DataTableCell onClick={() => window.open(instance.hostname, '_blank', 'noopener,noreferrer')}>{instance.description || 'No description provided'}</DataTableCell>
            </DataTableRow>
        ))}
    </>
)

interface TablesByCategoryProps {
    groupsWithCategories: GroupWithCategories[]
}

const TablesByCategory = ({ groupsWithCategories }: TablesByCategoryProps) => (
    <>
        {groupsWithCategories.map((group) => (
            <>
                {group.categories.map((category) => (
                    <TableBody key={category.label} instances={category.instances} category={category.label} />
                ))}
            </>
        ))}
    </>
)

export const InstancesTable = () => {
    const { groupsWithCategories, error, loading } = useInstanceTableData()

    if (loading) {
        return (
            <div className={styles.loadingWrapper}>
                <Center>
                    <CircularLoader />
                </Center>
            </div>
        )
    }
    if (error) {
        return <NoticeBox title="Error loading instances">{error.message}</NoticeBox>
    }
    if (!groupsWithCategories || groupsWithCategories.length === 0) {
        return <NoticeBox title="No instances available">There are no instances to display.</NoticeBox>
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.tableWrapper}>
                    <InstancePlay />
                    <DataTable>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableCell>Name</DataTableCell>
                                <DataTableCell>Description</DataTableCell>
                            </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                            <TablesByCategory groupsWithCategories={groupsWithCategories} />
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    )
}
