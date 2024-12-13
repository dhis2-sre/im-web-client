import { Button, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { DeploymentInstance } from '../../../types'
import styles from '../list/instances-list.module.css'
import { Heading } from '../../../components'

export const InstanceDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [instance, setInstance] = useState<DeploymentInstance>()
    const [decrypted, setDecrypted] = useState<boolean>()
    const [{ data, loading: loadingDetails }] = useAuthAxios<DeploymentInstance>({ url: `/instances/${id}/details` })
    const [{ loading: loadingDecryptedDetails }, instanceDecryptedDetails] = useAuthAxios<DeploymentInstance>({ url: `/instances/${id}/decrypted-details` }, { manual: true })

    const decryptInstanceDetailsCallback = useCallback(async () => {
        const response = await instanceDecryptedDetails()
        if (response.status === 400) {
            // TODO: Notification... Only owner, group admin or admin can decrypt
            console.log(400)
        }

        if (response.status === 200) {
            setInstance(response.data)
            setDecrypted(true)
        }
    }, [instanceDecryptedDetails])

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

            <Button onClick={decryptInstanceDetailsCallback} disabled={decrypted}>
                Decrypt
            </Button>
            <div>{instance.name}</div>
            <div>{instance.stackName}</div>
            <div>{instance.groupName}</div>
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
