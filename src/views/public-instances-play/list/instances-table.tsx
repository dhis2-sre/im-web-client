import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableRow, NoticeBox, Center, CircularLoader, LogoIcon, DataTableHead, TabBar, Tab } from '@dhis2/ui'
import { Deployment } from '../../../types/index.ts'
import { InstancePlay } from './instance-play.tsx'
import { CategorizedDeployments, useInstanceTableData } from './instance-table-filters.tsx'
import styles from './instances-table.module.css'

interface TableBodyProps {
    deployments: Deployment[]
    category: string
}

interface TablesByCategoryProps {
    categorizedDeployments: CategorizedDeployments
    category: string
}

const TableBody = ({ deployments, category }: TableBodyProps) => {
    const { getCoreInstanceLink } = useInstanceTableData()

    return (
        <>
            <DataTableRow>
                <DataTableColumnHeader colSpan="3">
                    <span className={styles.groupName}>{category}</span>
                </DataTableColumnHeader>
            </DataTableRow>
            {deployments.map((deployment) => (
                <DataTableRow className={styles.clickableRow} key={deployment.id}>
                    <DataTableCell>
                        <span className={styles.instance} onClick={() => window.open(getCoreInstanceLink(deployment), '_blank', 'noopener,noreferrer')}>
                            <LogoIcon /> {deployment.name}
                        </span>
                    </DataTableCell>
                    <DataTableCell>{deployment.description || "No description provided"}</DataTableCell>
                </DataTableRow>
            ))}
        </>
    )
}

const TablesByCategory = ({ categorizedDeployments, category }: TablesByCategoryProps) => (
    <>
        {categorizedDeployments.stable.length > 0 && <TableBody deployments={categorizedDeployments.stable} category={`${category} - Stable`} />}
        {categorizedDeployments.canary.length > 0 && <TableBody deployments={categorizedDeployments.canary} category={`${category} - Canary`} />}
        {categorizedDeployments.underDevelopment.length > 0 && <TableBody deployments={categorizedDeployments.underDevelopment} category={`${category} - Under Development`} />}
    </>
)

export const InstancesTable = () => {
    const { groupsWithDeployments, error, loading, categorizedCoreDeployments } = useInstanceTableData()

    if (loading) {
        return (<div className={styles.loadingWrapper}>
            <Center>
                <CircularLoader />
            </Center>
        </div>)
    }
    if (error) {
        return <NoticeBox title="Error loading instances">{error.message}</NoticeBox>
    }
    if (groupsWithDeployments.length === 0) {
        return <NoticeBox title="No instances available">There are no instances to display.</NoticeBox>
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <TabBar>
                    <Tab selected>Play</Tab>
                </TabBar>
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
                            <TablesByCategory categorizedDeployments={categorizedCoreDeployments} category="Core" />
                        </DataTableBody>
                    </DataTable>
                </div>
            </div>
        </div>
    )
}
