import { Button, FlyoutMenu, IconMore16, Layer, MenuItem, Popper } from '@dhis2/ui'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC, ReactElement } from 'react'
import styles from './actions-menu.module.css'
import { useConfirmedAction } from './use-confirmed-action.tsx'
import type { ConfirmOptions } from './use-confirmed-action.tsx'

export type ActionItem = {
    label: string
    icon?: ReactElement
    /* What the item does. While a returned promise is pending the menu button shows it is busy. */
    onClick: () => void | Promise<unknown>
    /* Ask first. The action runs only once the dialog is accepted. */
    confirm?: ConfirmOptions
    destructive?: boolean
    disabled?: boolean
    /* Shown on hover; for a disabled item, say why it is disabled. */
    title?: string
}

type ActionsMenuProps = {
    /* The button's accessible name, such as "Actions for my-instance". */
    label: string
    /* Falsy entries are skipped, so an item can be included with a plain condition. */
    items: (ActionItem | false | null | undefined)[]
    /* Busy for a reason the menu cannot see, such as a modal one of its items opened. */
    busy?: boolean
    dataTest?: string
}

/* One kebab menu for every row and page that has more actions than its one visible button. Items
 * are declared rather than rendered, so confirmation, the busy state and closing the menu behave the
 * same everywhere. */
export const ActionsMenu: FC<ActionsMenuProps> = ({ label, items, busy, dataTest }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [running, setRunning] = useState(0)
    const { confirm, modal } = useConfirmedAction()
    const visibleItems = items.filter((item): item is ActionItem => Boolean(item))

    const close = useCallback(() => {
        setOpen(false)
        anchor.current?.querySelector('button')?.focus()
    }, [])

    /* The menu closes itself on Escape only while focus is inside it, and opening it leaves focus on
     * the button. */
    useEffect(() => {
        if (!open) {
            return
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close()
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open, close])

    const run = useCallback(async (item: ActionItem) => {
        setRunning((count) => count + 1)
        try {
            await item.onClick()
        } catch (error) {
            // Items report their own failures; this only keeps a missed one from going unnoticed.
            console.error(error)
        } finally {
            setRunning((count) => count - 1)
        }
    }, [])

    const select = (item: ActionItem) => {
        setOpen(false)
        if (item.confirm) {
            confirm(item.confirm, () => void run(item))
            return
        }
        void run(item)
    }

    if (visibleItems.length === 0) {
        return null
    }

    return (
        <>
            <span ref={anchor} className={styles.anchor}>
                <Button
                    small
                    secondary
                    icon={<IconMore16 />}
                    aria-label={label}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    title={label}
                    loading={busy || running > 0}
                    onClick={() => setOpen((current) => !current)}
                    dataTest={dataTest}
                />
            </span>
            {open && (
                <Layer onBackdropClick={() => setOpen(false)}>
                    <Popper reference={anchor} placement="bottom-end">
                        <FlyoutMenu dense closeMenu={close}>
                            {visibleItems.map((item) => (
                                <MenuItem
                                    key={item.label}
                                    dense
                                    icon={item.icon}
                                    label={item.title ? <span title={item.title}>{item.label}</span> : item.label}
                                    destructive={item.destructive}
                                    disabled={item.disabled}
                                    onClick={() => select(item)}
                                />
                            ))}
                        </FlyoutMenu>
                    </Popper>
                </Layer>
            )}
            {modal}
        </>
    )
}
