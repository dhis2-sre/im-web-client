import { Button, IconMore24, Menu, Popover } from '@dhis2/ui'
import type { RefetchFunction } from 'axios-hooks'
import { useCallback, useRef, useState } from 'react'
import { Deployment } from '../../../types/index.ts'
import { Dhis2StackName } from '../new-dhis2/parameter-fieldset.tsx'
import { DeleteMenuItem } from './delete-menu-item.tsx'
import { LogMenuItem } from './log-menu-item.tsx'
import { ResetMenuItem } from './reset-menu-item.tsx'
import { RestartMenuItem } from './restart-menu-item.tsx'
import { SaveAsMenuItem } from './save-as-menu-item.tsx'
import { SaveFsMenuItem } from './save-fs-menu-item.tsx'

type ActionsDropdownMenuProps = {
    deploymentId: number
    instanceId: number
    stackName: Dhis2StackName
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetch: RefetchFunction<any, Deployment>
}
type OnActionCompletFn = (shouldRefetch?: boolean) => void
export type AsyncActionProps = {
    deploymentId?: number
    instanceId: number
    stackName: string
    onStart: () => void
    onComplete: OnActionCompletFn
}

export const ActionsDropdownMenu = ({ deploymentId, instanceId, stackName, refetch }: ActionsDropdownMenuProps) => {
    const anchor = useRef()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const onStart = useCallback(() => {
        setOpen(false)
        setLoading(true)
    }, [])
    const onComplete: OnActionCompletFn = useCallback(
        (shouldRefetch) => {
            setLoading(false)
            if (shouldRefetch) {
                refetch()
            }
        },
        [refetch]
    )
    const togglePopover = useCallback(() => {
        setOpen((currentOpen) => !currentOpen)
    }, [])

    return (
        <>
            <span ref={anchor}>
                <Button onClick={togglePopover} dataTest="instances-list-menu-button" small secondary loading={loading} icon={<IconMore24 />} />
            </span>
            {open && (
                <Popover onClickOutside={togglePopover} reference={anchor} placement="bottom-start">
                    <Menu>
                        <LogMenuItem instanceId={instanceId} stackName={stackName} />
                        {stackName === 'dhis2-db' && <SaveAsMenuItem instanceId={instanceId} stackName={stackName} onComplete={onComplete} onStart={onStart} />}
                        {stackName === 'dhis2-core' && <SaveFsMenuItem instanceId={instanceId} stackName="" onComplete={onComplete} onStart={onStart} />}
                        <RestartMenuItem instanceId={instanceId} stackName={stackName} onComplete={onComplete} onStart={onStart} />
                        <ResetMenuItem instanceId={instanceId} stackName={stackName} onComplete={onComplete} onStart={onStart} />
                        <DeleteMenuItem deploymentId={deploymentId} instanceId={instanceId} stackName={stackName} onComplete={onComplete} onStart={onStart} />
                    </Menu>
                </Popover>
            )}
        </>
    )
}
