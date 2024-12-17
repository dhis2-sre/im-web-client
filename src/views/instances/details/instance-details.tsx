import { Button, Card, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import type { AxiosResponse } from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useAuthAxios } from '../../../hooks/index.ts'
import { DeploymentInstance } from '../../../types/index.ts'
import styles from '../list/instances-list.module.css'
import { InstanceSummary } from './instance-summary.tsx'

export const InstanceDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [instance, setInstance] = useState<DeploymentInstance>()
    const [isDecrypted, setIsDecrypted] = useState<boolean>()
    const [{ data, loading: loadingDetails }, instanceDetails] = useAuthAxios<DeploymentInstance>({ url: `/instances/${id}/details` })
    const [{ loading: loadingDecryptedDetails }, instanceDecryptedDetails] = useAuthAxios<DeploymentInstance>({ url: `/instances/${id}/decrypted-details` }, { manual: true })
    const toggleEncryption = useCallback(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let response: AxiosResponse<DeploymentInstance, any>
        if (isDecrypted) {
            response = await instanceDetails()
        } else {
            response = await instanceDecryptedDetails()
        }

        if (response.status === 400) {
            // TODO: Notification... Only owner, group admin or admin can decrypt
            console.log(400)
        }

        if (response.status === 200) {
            setInstance(response.data)
            setIsDecrypted(!isDecrypted)
        }
    }, [instanceDecryptedDetails, instanceDetails, isDecrypted])

    useEffect(() => {
        setInstance(data)
    }, [data])

    if (loadingDetails || loadingDecryptedDetails || !instance) {
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
                    <InstanceSummary instance={instance} toggleEncryption={toggleEncryption} isDecrypted={isDecrypted} />
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
                <DataTableBody loading={loadingDetails || loadingDecryptedDetails}>
                    {Object.keys(instance.parameters).map((name) => (
                        <DataTableRow key={name}>
                            <DataTableCell staticStyle>{name}</DataTableCell>
                            <DataTableCell staticStyle>{instance.parameters[name].value}</DataTableCell>
                        </DataTableRow>
                    ))}
                </DataTableBody>
            </DataTable>
        </>
    )
}
