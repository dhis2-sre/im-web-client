import { Button, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'

export const InstanceDetails = () => {
    const { id } = useParams()
    const [instance, setInstance] = useState<Instance>()
    const [{ data, loading: loadingDetails }] = useAuthAxios<Instance>({ url: `/instances/${id}/details` })
    const [{ loading: loadingDecryptedDetails }, instanceDecryptedDetails] = useAuthAxios<Instance>({ url: `/instances/${id}/decrypted-details` }, { manual: true })

    const decryptInstanceDetailsCallback = useCallback(async () => {
        const response = await instanceDecryptedDetails()
        if (response.status === 400) {
            // TODO: Notification... Only owner, group admin or admin can decrypt
            console.log(400)
        }

        if (response.status === 200) {
            setInstance(response.data)
        }
    }, [instanceDecryptedDetails])

    useEffect(() => {
        setInstance(data)
    }, [data])

    if (!data || !instance) {
        // TODO: Show spinner
        return <>Loading...</>
    }

    return (
        <>
            <Button onClick={decryptInstanceDetailsCallback}>decrypt</Button>
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
                    {Object.keys(instance?.parameters).map((name) => {
                        return (
                            <DataTableRow key={name}>
                                <DataTableCell staticStyle>{name}</DataTableCell>
                                <DataTableCell staticStyle>{instance.parameters[name].value}</DataTableCell>
                            </DataTableRow>
                        )
                    })}
                </DataTableBody>
            </DataTable>
        </>
    )
}
