import { useCallback } from 'react'
import { SaveInstanceRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

export const useDhis2InstanceUpdate = (deploymentId: number) => {
    const [, executePut] = useAuthAxios(
        {
            method: 'PUT',
        },
        { manual: true }
    )

    const updateInstance = useCallback(
        async ({ instanceId, stackName, parameters, publicValue }: { instanceId?: number; stackName: string; parameters: Record<string, string>; publicValue?: boolean }) => {
            try {
                if (!instanceId) {
                    throw new Error(`Missing instance id for stack "${stackName}"`)
                }
                const payload: SaveInstanceRequest = {
                    stackName,
                    parameters: Object.entries(parameters).reduce(
                        (acc, [key, value]) => {
                            if (value) {
                                acc[key] = { value }
                            }
                            return acc
                        },
                        {} as Record<string, { value: string }>
                    ),
                    ...(stackName === 'dhis2-core' && { public: publicValue }),
                }
                await executePut({ url: `/deployments/${deploymentId}/instance/${instanceId}`, data: payload })
            } catch (error) {
                console.error(error)
                throw new Error(`Could not update "${stackName}" instance`)
            }
        },
        [executePut, deploymentId]
    )

    return updateInstance
}
