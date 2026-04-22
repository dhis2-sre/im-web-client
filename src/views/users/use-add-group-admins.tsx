import { useAlert } from '@dhis2/app-service-alerts'
import { useCallback } from 'react'
import { useAuthAxios } from '../../hooks/index.ts'

export const useAddGroupAdmins = () => {
    const [{ loading: addGroupAdminLoading }, addGroupAdmin] = useAuthAxios({ method: 'POST' }, { manual: true })

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )

    const addGroupAdmins = useCallback(
        async (groups: string[], userId: number) => {
            try {
                const requests = groups.map((group) => addGroupAdmin({ url: `/groups/${group}/admins/${userId}` }))
                await Promise.all(requests)
                showAlert({
                    message: 'User added as group admin successfully',
                    isCritical: false,
                })
            } catch (error) {
                showAlert({
                    message: 'There was a problem adding the user as group admin',
                    isCritical: true,
                })
                console.error(error)
            }
        },
        [addGroupAdmin, showAlert]
    )

    return { addGroupAdmins, addGroupAdminLoading }
}
