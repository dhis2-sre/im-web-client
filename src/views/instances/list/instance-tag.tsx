import { Tag } from '@dhis2/ui'
import { useAuthAxios } from '../../../hooks'
import styles from './instances-list.module.css'

const InstanceTag = ({ instanceId, stackName }) => {
    if (!instanceId) return
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [{ data: status }] = useAuthAxios(`/instances/${instanceId}/status`, {
        useCache: false,
    })

    const getTagProps = () => {
        if (!status) return
        if (status.startsWith('Booting') || status === 'Pending') {
            return { neutral: true }
        } else if (status === 'Error') {
            return { negative: true }
        } else if (status === 'Running') {
            return { positive: true }
        } else {
            return {}
        }
    }

    return (
        <Tag className={styles.stackNameTag} {...getTagProps()}>
            {stackName}
        </Tag>
    )
}

export default InstanceTag
