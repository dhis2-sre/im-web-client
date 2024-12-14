import { Button, IconClock16, IconClockHistory16, IconDimensionData16, IconLock16, IconLockOpen16, IconWorld16 } from '@dhis2/ui'
import { FC, useContext } from 'react'
import Moment from 'react-moment'
import { AuthContext } from '../../../contexts/index.ts'
import { useAuth } from '../../../hooks/index.ts'
import { DeploymentInstance } from '../../../types/index.ts'
import styles from './instance-summary.module.css'

type InstanceSummaryProps = {
    instance: DeploymentInstance
    toggleEncryption: () => void
    isDecrypted: boolean
}

export const InstanceSummary: FC<InstanceSummaryProps> = ({ instance, toggleEncryption, isDecrypted }) => {
    const { currentUser } = useContext(AuthContext)
    const { isAdministrator } = useAuth()
    const canDecrypt = currentUser.id === instance?.deployment?.user.id || currentUser.adminGroups.some((group) => group.name === instance.groupName) || isAdministrator
    // TODO: Remove load and preload deployment and user server side
    console.log(instance)

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>
                {instance.name}&nbsp;
                <Button onClick={toggleEncryption} disabled={isDecrypted && canDecrypt}>
                    {!isDecrypted && <IconLock16 />}
                    {isDecrypted && <IconLockOpen16 />}
                </Button>
            </h2>
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
