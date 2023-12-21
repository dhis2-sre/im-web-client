import { FC } from 'react'
import { Deployment } from '../../../types'
import Moment from 'react-moment'
import { MomentExpiresFromNow } from '../../../components'
import styles from './deployment-summary.module.css'

export const DeploymentSummary: FC<{ deployment: Deployment }> = ({ deployment }) => (
    <dl className={styles.list}>
        <dt>Name</dt>
        <dd>{deployment.name || ' - '}</dd>
        <dt>Description</dt>
        <dd>{deployment.description || ' - '}</dd>
        <dt>Group</dt>
        <dd>{deployment.groupName || ' - '}</dd>
        <dt>Created</dt>
        <dd>{deployment.createdAt ? <Moment date={deployment.createdAt} fromNow /> : ' - '}</dd>
        <dt>Updated</dt>
        <dd>{deployment.updatedAt ? <Moment date={deployment.updatedAt} fromNow /> : ' - '}</dd>
        <dt>Owner</dt>
        <dd>{deployment.user?.email || ' - '}</dd>
        <dt>public</dt>
        <dd>{deployment.public === true ? 'Yes' : 'No'}</dd>
        <dt>Expires</dt>
        <dd>{deployment.ttl ? <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} /> : ' - '}</dd>
    </dl>
)
