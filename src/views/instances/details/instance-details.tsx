import { Button, Card, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconLock16 } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DeploymentInstance, Stack, StackParameter } from '../../../types/index.ts'
import styles from '../list/instances-list.module.css'
import { InstanceSummary } from './instance-summary.tsx'

export const InstanceDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [instance, setInstance] = useState<DeploymentInstance>()
    const [stackParameters, setStackParameters] = useState<Stack>(null)
    const [{ data, loading: loadingDetails }] = useAuthAxios<DeploymentInstance>({ url: `/instances/${id}/details` })
    const [{ loading: loadingStack }, fetchStack] = useAuthAxios<Stack>({ method: 'GET' }, { manual: true })

    const fetchStackCallback = useCallback(async () => {
        const response = await fetchStack({ url: `/stacks/${data.stackName}` })
        const stackParametersMap = response.data.parameters.reduce(
            (map, parameter) => {
                map[parameter.parameterName] = parameter
                return map
            },
            {} as Record<number, StackParameter>
        )
        setStackParameters(stackParametersMap)
    }, [data, fetchStack])

    useEffect(() => {
        setInstance(data)
        void fetchStackCallback()
    }, [data, fetchStackCallback])

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
                                {!stackParameters[name].sensitive && instance.parameters[name].value}
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </DataTableBody>
            </DataTable>
        </>
    )
}
