import { FORM_ERROR } from 'final-form'
import type { AnyObject } from 'final-form'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildEditPayload } from './build-edit-payload.ts'
import { useAuthAxios } from './use-auth-axios.ts'

/* Sends whatever the user changed as one PATCH. The deployment is up to date when it returns and the
 * redeploy it implies runs in the background, so this navigates to the details page to watch it. */
export const useDeploymentEdit = (stackName: string, deploymentId: number, getIncludedParameters: (values: AnyObject) => string[]) => {
    const navigate = useNavigate()
    const [, executePatch] = useAuthAxios({ url: `/deployments/${deploymentId}`, method: 'PATCH' }, { manual: true })

    return useCallback(
        async (values: AnyObject, dirtyFields: Record<string, boolean>) => {
            const payload = buildEditPayload({ values, dirtyFields, includedParameters: new Set(getIncludedParameters(values)), stackName })

            try {
                await executePatch({ data: payload })
                navigate(`/instances/${deploymentId}/details`)
                return undefined
            } catch (error) {
                console.error(error)
                return { [FORM_ERROR]: error instanceof Error ? error.message : 'Could not save the changes' }
            }
        },
        [executePatch, navigate, deploymentId, stackName, getIncludedParameters]
    )
}
