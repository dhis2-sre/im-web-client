import { Button, IconLock16 } from '@dhis2/ui'
import { FC } from 'react'
import { Lock } from '../../types/index.ts'

export const Locked: FC<{ lock: Lock }> = ({ lock }) => {
    return lock ? (
        <span>
            <Button disabled={true} title={'User: ' + lock.user.email + ' - Instance: ' + lock.instance.name + ' (' + lock.instance.groupName + ')'}>
                <IconLock16 />
            </Button>
        </span>
    ) : (
        <span>&nbsp;</span>
    )
}
