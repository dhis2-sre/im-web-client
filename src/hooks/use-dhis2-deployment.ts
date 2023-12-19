import { AnyObject } from 'react-final-form'
import { Dhis2StackId } from '../views/instances/new-dhis2/parameter-fieldset'
import { useAuthAxios } from './use-auth-axios'
import { useCallback } from 'react'
import { SaveDeploymentRequest, SaveInstanceRequest } from '../types'
import { FORM_ERROR } from 'final-form'

const STACK_NAMES: Record<string, Dhis2StackId> = {
    DB: 'dhis2-db',
    CORE: 'dhis2-core',
    PG_ADMIN: 'pgadmin',
}

const convertParameterFieldsToPayload = (values: AnyObject) =>
    Object.entries(values).reduce((parameterPayload, [parameterName, value]) => {
        if (value) {
            parameterPayload[parameterName] = { value }
        }
        return parameterPayload
    }, {})

export const useDhis2DeploymentCreation = ({ onComplete }) => {
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
                    public: values.public,
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
                await addStackToDeployment(deploymentId, STACK_NAMES.CORE, values)

                if (values[`include_${STACK_NAMES.PG_ADMIN}`]) {
                    await addStackToDeployment(deploymentId, STACK_NAMES.PG_ADMIN, values)
                }

                await deployDeployment(deploymentId)
                onComplete()
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
        [onComplete, saveDeployment, addStackToDeployment, deployDeployment]
    )

    return createDeployment
}
