import { useAlert } from '@dhis2/app-service-alerts'
import { useCallback } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'

export const useAddGroups = () => {
    const [{ loading: addGroupLoading }, addGroup] = useAuthAxios({ method: 'POST' }, { manual: true })

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const addGroups = useCallback(
        async (groups: string[], userId: number) => {
            try {
                const requests = groups.map((group) => addGroup({ url: `/groups/${group}/users/${userId}` }))
                await Promise.all(requests)
                showAlert({
                    message: 'User added successfully',
                    isCritical: false,
                })
            } catch (error) {
                showAlert({
                    message: 'There was a problem adding groups to the user',
                    isCritical: true,
                })
                console.error(error)
            }
        },
        [addGroup, showAlert]
    )

    return { addGroups, addGroupLoading }
}
