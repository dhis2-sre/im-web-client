import { useCallback } from 'react'
import { UpdateInstanceRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

type UpdateArgs = {
    instanceId: number
    parameters: Record<string, string>
    publicValue?: boolean
}

export const useDhis2InstanceUpdate = (deploymentId: number) => {
    const [, executePatch] = useAuthAxios({ method: 'PATCH' }, { manual: true })

    return useCallback(
        async ({ instanceId, parameters, publicValue }: UpdateArgs) => {
            const payload: UpdateInstanceRequest = {
                parameters: Object.entries(parameters).reduce<Record<string, { value: string }>>((acc, [name, value]) => {
                    if (value !== '') {
                        acc[name] = { value }
                    }
                    return acc
                }, {}),
                ...(publicValue !== undefined && { public: publicValue }),
            }
            await executePatch({ url: `/deployments/${deploymentId}/instance/${instanceId}`, data: payload })
        },
        [executePatch, deploymentId]
    )
}
