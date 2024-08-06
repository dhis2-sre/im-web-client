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

const Loading = () => (
    <div className={styles.loadingWrapper}>
        <Center>
            <CircularLoader />
        </Center>
    </div>
)

const ErrorNotice = ({ message }: { message: string }) => <NoticeBox title="Error loading instances">{message}</NoticeBox>

const NoInstancesNotice = () => <NoticeBox title="No instances available">There are no instances to display.</NoticeBox>

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
                    <DataTableCell>{deployment.description}</DataTableCell>
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
    const { instances, error, loading, categorizedCoreDeployments } = useInstanceTableData()

    if (loading) {
        return <Loading />
    }
    if (error) {
        return <ErrorNotice message={error.message} />
    }
    if (instances.length === 0) {
        return <NoInstancesNotice />
    }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <TabBar>
                    <Tab selected>Core</Tab>
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
