import { Button, IconAdd24 } from '@dhis2/ui'
import { useNavigate } from 'react-router'
import { getInstances } from '../api'
import { useApi } from '../api/useApi'
import { InstancesGroup } from '../types'
import styles from './Lists.module.css'

const InstancesList = () => {
    const navigate = useNavigate()

    const { result: instancesGroups } = useApi<InstancesGroup>(getInstances)

    return (
        <div>
            <div className={styles.heading}>
                <h1>All instances</h1>
                <Button icon={<IconAdd24 />} onClick={() => navigate('/new')}>
                    New instance
                </Button>
            </div>
            {instancesGroups?.map((group) => {
                return (
                    <div key={group.Name}>
                        <h1>{group.Name}</h1>
                        {group.Instances?.map((instance) => {
                            return (
                                <div key={instance.ID}>
                                    <h2>{instance.Name}</h2>
                                    <p>Created at: {instance.CreatedAt}</p>
                                    <p>Group name: {instance.GroupName}</p>
                                    <p>Stack name: {instance.StackName}</p>
                                </div>
                            )
                        })}
                        {!group.Instances && <p>no instances</p>}
                    </div>
                )
            })}
        </div>
    )
}

export default InstancesList
