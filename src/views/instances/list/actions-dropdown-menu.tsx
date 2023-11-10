import { Button, IconMore24, Menu, Popover } from '@dhis2/ui'
import { RefetchFunction } from 'axios-hooks'
import { useCallback, useRef, useState } from 'react'
import { GroupsWithInstances, Instance } from '../../../types'
import { DeleteMenuItem } from './delete-menu-item'
import { LogMenuItem } from './log-menu-item'
import { ResetMenuItem } from './reset-menu-item'
import { RestartMenuItem } from './restart-menu-item'
import { SaveAsMenuItem } from './save-as-menu-item'

type ActionsDropdownMenuProps = Pick<Instance, 'id' | 'name'> & { refreshList: RefetchFunction<any, GroupsWithInstances[]> }
type OnActionCompletFn = (doListRefresh?: boolean) => void
export type AsyncActionProps = {
    instanceId: number
    instanceName: string
    onStart: () => void
    onComplete: OnActionCompletFn
}

export const ActionsDropdownMenu = ({ id, name, refreshList }: ActionsDropdownMenuProps) => {
    const anchor = useRef()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const onStart = useCallback(() => {
        setOpen(false)
        setLoading(true)
    }, [])
    const onComplete: OnActionCompletFn = useCallback(
        (doListRefresh = true) => {
            setLoading(false)
            if (doListRefresh) {
                refreshList()
            }
        },
        [refreshList]
    )
    const togglePopover = useCallback(() => {
        setOpen((currentOpen) => !currentOpen)
    }, [])

    return (
        <>
            <span ref={anchor}>
                <Button onClick={togglePopover} small secondary loading={loading} icon={<IconMore24 />} />
            </span>
            {open && (
                <Popover onClickOutside={togglePopover} reference={anchor} placement="bottom-start">
                    <Menu>
                        <LogMenuItem instanceId={id} instanceName={name} />
                        <SaveAsMenuItem instanceId={id} instanceName={name} onComplete={onComplete} onStart={onStart} />
                        <RestartMenuItem instanceId={id} instanceName={name} onComplete={onComplete} onStart={onStart} />
                        <ResetMenuItem instanceId={id} instanceName={name} onComplete={onComplete} onStart={onStart} />
                        <DeleteMenuItem instanceId={id} instanceName={name} onComplete={onComplete} onStart={onStart} />
                    </Menu>
                </Popover>
            )}
        </>
    )
}
