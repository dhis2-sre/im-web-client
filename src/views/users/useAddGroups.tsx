import { useAuthAxios } from '../../hooks';
import { useAlert } from '@dhis2/app-service-alerts';

export const useAddGroups = () => {
    const [{ loading: addGroupLoading }, addGroup] = useAuthAxios(
        { method: 'POST' },
        { manual: true }
    );

    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    );

    const addGroups = async (groups: string[], userId: number) => {
        try {
            const requests = groups.map(group =>
                addGroup({ url: `/groups/${group}/users/${userId}` })
            );
            await Promise.all(requests);
            showAlert({
                message: 'User added successfully',
                isCritical: false,
            });
        } catch (error) {
            showAlert({
                message: 'There was a problem adding groups to the user',
                isCritical: true,
            });
            console.error(error);
        }
    };

    return { addGroups, addGroupLoading };
};
