import { FORM_ERROR } from 'final-form'
import { useCallback } from 'react'
import type { AnyObject } from 'react-final-form'
import { useNavigate } from 'react-router'
import { UpdateDeploymentRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'

export const useDhis2DeploymentUpdate = (deploymentId: number) => {
    const navigate = useNavigate()
    const [, executePut] = useAuthAxios(
        {
            url: `/deployments/${deploymentId}`,
            method: 'PUT',
        },
        { manual: true }
    )

    const updateDeployment = useCallback(
        async (values: AnyObject) => {
            try {
                const payload: UpdateDeploymentRequest = {
                    description: values.description,
                    ttl: values.ttl,
                }
                await executePut({ data: payload })
                navigate(`/instances/${deploymentId}/details`)
                return true
            } catch (error) {
                console.error(error)
                return { [FORM_ERROR]: 'Could not update deployment' }
            }
        },
        [executePut, navigate, deploymentId]
    )

    return updateDeployment
}
