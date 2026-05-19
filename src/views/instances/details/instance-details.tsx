import { Button, Card, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconLock16 } from '@dhis2/ui'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useAuthAxios, useStack } from '../../../hooks/index.ts'
import { DeploymentInstance, StackParameter } from '../../../types/index.ts'
import styles from '../list/instances-list.module.css'
import { InstanceSummary } from './instance-summary.tsx'

export const InstanceDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [{ data: instance, loading: loadingDetails }] = useAuthAxios<DeploymentInstance>({ url: `/instances/${id}/details` })
    const { stack, loading: loadingStack } = useStack(instance?.stackName ?? '')

    const stackParameters = useMemo(() => {
        if (!stack?.parameters) {
            return null
        }
        return stack.parameters.reduce<Record<string, StackParameter>>((map, parameter) => {
            map[parameter.parameterName] = parameter
            return map
        }, {})
    }, [stack])

    if (loadingDetails || loadingStack || !instance || !stackParameters) {
        return (
            <Center className={styles.loaderWrap}>
                <CircularLoader />
            </Center>
        )
    }

    return (
        <>
            <Heading title="Instance details">
                <Button onClick={() => navigate(`/instances/${instance.deploymentId}/details`)}>Back to list</Button>
            </Heading>
            <div className={styles.cardWrap}>
                <Card className={styles.card}>
                    <InstanceSummary instance={instance} />
                </Card>
            </div>
            <br />
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                        <DataTableColumnHeader>Value</DataTableColumnHeader>
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody loading={loadingDetails}>
                    {Object.keys(instance.parameters).map((name) => (
                        <DataTableRow key={name}>
                            <DataTableCell staticStyle>{name}</DataTableCell>
                            <DataTableCell staticStyle>
                                {stackParameters[name].sensitive && (
                                    <span>
                                        <Button disabled={true}>
                                            <IconLock16 />
                                        </Button>
                                    </span>
                                )}
                                {!stackParameters[name].sensitive && name === 'DATABASE_ID' && (
                                    <Link to={`/databases/${instance.parameters[name].value}`}>{instance.parameters[name].value}</Link>
                                )}
                                {!stackParameters[name].sensitive && name !== 'DATABASE_ID' && instance.parameters[name].value}
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </DataTableBody>
            </DataTable>
        </>
    )
}
