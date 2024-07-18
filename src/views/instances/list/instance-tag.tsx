import { Tag } from '@dhis2/ui'
import { useAuthAxios } from '../../../hooks'
import styles from './instances-list.module.css'
import { getTagProps } from '../../../utils/tag'

const InstanceTag = ({ instanceId, stackName }) => {
    const [{ data: status }] = useAuthAxios(`/instances/${instanceId}/status`, {
        useCache: false,
    })

    return (
        <Tag className={styles.stackNameTag} {...getTagProps(status)}>
            {stackName}
        </Tag>
    )
}

export default InstanceTag
