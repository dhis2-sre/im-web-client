import { Tag } from '@dhis2/ui'
import { useAuthAxios } from '../../../hooks/index.ts'
import { getTagProps } from '../../../utils/tag.tsx'
import styles from './instances-list.module.css'

const InstanceTag = ({ instanceId, stackName }: { instanceId: number; stackName: string }) => {
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
