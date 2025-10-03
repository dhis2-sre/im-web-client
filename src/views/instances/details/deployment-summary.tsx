import { IconClock16, IconUser16, IconUserGroup16, IconWarning16, IconClockHistory16, IconInfo16 } from '@dhis2/ui'
import { FC } from 'react'
import Moment from 'react-moment'
import { MomentExpiresFromNow } from '../../../components/index.ts'
import { Deployment } from '../../../types/index.ts'
import styles from './deployment-summary.module.css'

export const DeploymentSummary: FC<{ deployment: Deployment }> = ({ deployment }) => {
    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>{deployment.name}</h2>
            <div className={styles.row}>
                <div className={styles.singleDetails}>
                    <IconClock16 />
                    <p>
                        Created <Moment date={deployment.createdAt} fromNow />
                    </p>
                </div>
                <div className={styles.singleDetails}>
                    <IconWarning16 />
                    <p>
                        Stopping <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
                    </p>
                </div>
                <div className={styles.singleDetails}>
                    <IconUser16 />
                    <p>Created by {deployment.user.email}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconUserGroup16 />
                    <p>User group {deployment.groupName}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconClockHistory16 />
                    <p>
                        Updated <Moment date={deployment.updatedAt} fromNow />
                    </p>
                </div>
                <div className={styles.singleDetails}>
                    <IconInfo16 />
                    {deployment.description || 'No instance description'}
                </div>
            </div>
        </div>
    )
}
