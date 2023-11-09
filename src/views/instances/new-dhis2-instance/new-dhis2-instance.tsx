import { Card } from '@dhis2/ui'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Form } from 'react-final-form'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { Instance } from '../../../types'
import { NewDhis2InstanceForm } from './new-dhis2-instance-form'
import { DHIS2_STACK_ID } from './constants'
import { convertValuesToPayload } from './helpers'

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
            <Card>
                <Form onSubmit={onSubmit} keepDirtyOnReinitialize>
                    {({ handleSubmit, submitting, pristine, invalid }) => (
                        <NewDhis2InstanceForm handleCancel={navigateToInstanceList} handleSubmit={handleSubmit} submitting={submitting} pristine={pristine} invalid={invalid} />
                    )}
                </Form>
            </Card>
        </>
    )
}
