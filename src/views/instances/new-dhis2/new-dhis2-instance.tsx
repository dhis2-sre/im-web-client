import { Card } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { AnyObject, Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { DeployInstanceRequest, Instance } from '../../../types'
import { DHIS2_STACK_ID } from './constants'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form'
import styles from './styles.module.css'

const convertValuesToPayload = (values: AnyObject) =>
    Object.entries(values).reduce<DeployInstanceRequest>(
        (payload, [name, value]) => {
            if (payload.hasOwnProperty(name)) {
                payload[name] = value
            } else {
                payload.parameters.push({ name, value })
            }
            return payload
        },
        {
            description: undefined,
            groupName: undefined,
            name: undefined,
            public: undefined,
            stackName: undefined,
            ttl: undefined,
            parameters: [],
        }
    )

export const NewDhis2Instance: FC = () => {
    const navigate = useNavigate()
    const navigateToInstanceList = useCallback(() => {
        navigate('/instances')
    }, [navigate])
    const [, postNewInstance] = useAuthAxios<Instance>(
        {
            url: '/instances',
            method: 'POST',
        },
        { manual: true }
    )
    const onSubmit = useCallback(
        async (values) => {
            const data = convertValuesToPayload({
                stackName: DHIS2_STACK_ID,
                ...values,
            })
            await postNewInstance({ data })
            navigateToInstanceList()
        },
        [postNewInstance, navigateToInstanceList]
    )

    return (
        <>
            <h1>Create a new DHIS2 Core Instance</h1>
            <Card className={styles.container}>
                <Form onSubmit={onSubmit} keepDirtyOnReinitialize>
                    {({ handleSubmit, submitting, pristine, invalid }) => (
                        <NewDhis2InstanceForm handleCancel={navigateToInstanceList} handleSubmit={handleSubmit} submitting={submitting} pristine={pristine} invalid={invalid} />
                    )}
                </Form>
            </Card>
        </>
    )
}
