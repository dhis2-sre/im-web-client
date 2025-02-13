import { IconClock16, IconClockHistory16, IconDimensionData16, IconWorld16 } from '@dhis2/ui'
import { FC } from 'react'
import Moment from 'react-moment'
import { DeploymentInstance } from '../../../types/index.ts'
import styles from './instance-summary.module.css'

type InstanceSummaryProps = {
    instance: DeploymentInstance
}

export const InstanceSummary: FC<InstanceSummaryProps> = ({ instance }) => {
    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>{instance.name}</h2>
            <div className={styles.row}>
                <div className={styles.singleDetails}>
                    <IconDimensionData16 />
                    <p>Stack {instance.stackName}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconWorld16 />
                    <p>Public {instance.public ? 'Yes' : 'No'}</p>
                </div>
                <div className={styles.singleDetails}>
                    <IconClock16 />
                    <p>
                        Created <Moment date={instance.createdAt} fromNow />
                    </p>
                </div>
                <div className={styles.singleDetails}>
                    <IconClockHistory16 />
                    <p>
                        Updated <Moment date={instance.updatedAt} fromNow />
                    </p>
                </div>
            </div>
        </div>
    )
}
