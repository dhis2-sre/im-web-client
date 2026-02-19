import { FORM_ERROR } from 'final-form'
import { useCallback } from 'react'
import type { AnyObject } from 'react-final-form'
import { useNavigate } from 'react-router'
import { STACK_NAMES } from '../constants.ts'
import { SaveDeploymentRequest, SaveInstanceRequest } from '../types/index.ts'
import { useAuthAxios } from './use-auth-axios.ts'
import { useAlert } from '@dhis2/app-service-alerts'

const convertParameterFieldsToPayload = (values: AnyObject) =>
    Object.entries(values).reduce((parameterPayload, [parameterName, value]) => {
        if (value) {
            parameterPayload[parameterName] = { value }
        }
        return parameterPayload
    }, {})

export const useDhis2DeploymentCreation = () => {
    const navigate = useNavigate()
    const [, executePost] = useAuthAxios(
        {
            url: '/deployments',
            method: 'POST',
        },
        { manual: true }
    )

    const saveDeployment = useCallback(
        async (values) => {
            try {
                const payload: SaveDeploymentRequest = {
                    name: values.name,
                    group: values.groupName,
                    description: values.description,
                    ttl: values.ttl,
                }
                const { data } = await executePost({ data: payload })
                return data.id
            } catch (error) {
                console.error(error)
                throw new Error('Could not create deployment')
            }
        },
        [executePost]
    )

    const addStackToDeployment = useCallback(
        async (deploymentId, stackName, values) => {
            try {
                const payload: SaveInstanceRequest = {
                    stackName,
                    parameters: convertParameterFieldsToPayload(values[stackName]),
                    ...(stackName === 'dhis2-core' && { public: values.public }),
                }
                await executePost({ url: `/deployments/${deploymentId}/instance`, data: payload })
            } catch (error) {
                console.error(error)
                throw new Error(`Could not add "${stackName}" stack to deployment with id "${deploymentId}"`)
            }
        },
        [executePost]
    )

    const deployDeployment = useCallback(
        async (deploymentId) => {
            try {
                await executePost({ url: `/deployments/${deploymentId}/deploy` })
            } catch (error) {
                console.error(error)
                throw new Error(`Could not deploy deployment with id "${deploymentId}"`)
            }
        },
        [executePost]
    )

    const createDeployment = useCallback(
        async (values) => {
            try {
                const deploymentId = await saveDeployment(values)
                await addStackToDeployment(deploymentId, STACK_NAMES.DB, values)
                if (values[STACK_NAMES.CORE].STORAGE_TYPE === 'minio') {
                    await addStackToDeployment(deploymentId, STACK_NAMES.MINIO, values)
                }
                await addStackToDeployment(deploymentId, STACK_NAMES.CORE, values)

                if (values[`include_${STACK_NAMES.PG_ADMIN}`]) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { PGADMIN_CONFIRM_PASSWORD, ...valuesWithoutConfirmPassword } = values[STACK_NAMES.PG_ADMIN]
                    const newObjectWithoutConfirmPassword = {
                        ...values,
                        [STACK_NAMES.PG_ADMIN]: valuesWithoutConfirmPassword,
                    }
                    await addStackToDeployment(deploymentId, STACK_NAMES.PG_ADMIN, newObjectWithoutConfirmPassword)
                }

                await deployDeployment(deploymentId)
                navigate(`/instances/${deploymentId}/details`)
                return true
            } catch (error) {
                /* Note that all function called in the try block have implemented
                 * a try/catch internally. So this means we know exactly which
                 * errors to expect and we can simply show the `error.message`.
                 * Also note that react-final-form expects us to resolve the form
                 * error and not throw the error */
                return { [FORM_ERROR]: error.message }
            }
        },
        [navigate, saveDeployment, addStackToDeployment, deployDeployment]
    )

    return createDeployment
}

export const useDhis2DeploymentUpdate = () => {
    const navigate = useNavigate()
    const { show: showAlert } = useAlert(
        ({ message }) => message,
        ({ isCritical }) => (isCritical ? { critical: true } : { success: true })
    )
    const [, executePut] = useAuthAxios(
        {
            method: 'PUT',
        },
        { manual: true }
    )

    const updateDeployment = useCallback(
        async (deploymentId: string, values: any) => {
            try {
                const payload = {
                    description: values.description,
                    ttl: values.ttl,
                    group: values.groupName,
                    public: values.public,
                }
                await executePut({ url: `/deployments/${deploymentId}`, data: payload })
                navigate(`/instances/${deploymentId}/details`)
                showAlert({ message: 'Deployment updated successfully' })
                return true
            } catch (error) {
                console.error(error)
                const message = error instanceof Error ? error.message : 'Unknown error'
                showAlert({ message: `Failed to update deployment: ${message}`, isCritical: true })
                return { [FORM_ERROR]: message }
            }
        },
        [navigate, executePut, showAlert]
    )

    return updateDeployment
}
