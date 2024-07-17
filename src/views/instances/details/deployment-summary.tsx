import { FC } from 'react'
import { Deployment } from '../../../types'
import Moment from 'react-moment'
import i18n from '@dhis2/d2-i18n'
import { MomentExpiresFromNow } from '../../../components'
import { IconClock16, IconUser16, IconUserGroup16, IconWarning16, IconClockHistory16, IconWorld16, IconInfo16 } from '@dhis2/ui'
import styles from './deployment-summary.module.css'

export const DeploymentSummary: FC<{ deployment: Deployment }> = ({ deployment }) => {

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>{deployment.name || ' - '}</h2>
            <hr className={styles.hr} />
            <div className={styles.row}>
                <div className={styles.singleDetails}>
                    <IconClock16 />
                    <p>Created {deployment.createdAt ? <Moment date={deployment.createdAt} fromNow /> : ' - '}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconWarning16 />
                    <p>Stopping in {deployment.ttl ? <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} /> : ' - '}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconUser16 />
                    <p>Created by {deployment.user?.email || ' - '}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconUserGroup16 />
                    <p>User group {deployment.groupName || ' - '}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconWorld16 />
                    <p>Public {deployment.public === true ? 'Yes' : 'No'}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconClockHistory16 />
                    <p>Updated {deployment.updatedAt ? <Moment date={deployment.updatedAt} fromNow /> : ' - '}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconInfo16 />
                    {deployment.description || ` ${i18n.t("No instance description")} `}
                </div>
            </div>
        </div>
    )
}
