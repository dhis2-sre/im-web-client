import { Button, FlyoutMenu, IconMore16, Layer, MenuDivider, MenuItem, Popper } from '@dhis2/ui'
import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import styles from './actions-menu.module.css'
import { useConfirmedAction } from './use-confirmed-action.tsx'
import type { ConfirmOptions } from './use-confirmed-action.tsx'

export type ActionItem = {
    label: string
    /* What the item does. While a returned promise is pending the menu button shows it is busy. */
    onClick: () => void | Promise<unknown>
    /* Ask first. The action runs only once the dialog is accepted. */
    confirm?: ConfirmOptions
    destructive?: boolean
    /* Why the item cannot be used right now, shown under its label. The item is disabled while set. */
    unavailable?: string
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
                            {/* A divider sets the destructive actions apart from the ones before them. */}
                            {visibleItems.map((item, index) => (
                                <Fragment key={item.label}>
                                    {item.destructive && index > 0 && !visibleItems[index - 1].destructive && <MenuDivider dense />}
                                    <MenuItem
                                        dense
                                        label={
                                            item.unavailable ? (
                                                <span className={styles.unavailable}>
                                                    {item.label}
                                                    <span className={styles.reason}>{item.unavailable}</span>
                                                </span>
                                            ) : (
                                                item.label
                                            )
                                        }
                                        destructive={item.destructive}
                                        disabled={Boolean(item.unavailable)}
                                        onClick={() => select(item)}
                                    />
                                </Fragment>
                            ))}
                        </FlyoutMenu>
                    </Popper>
                </Layer>
            )}
            {modal}
        </>
    )
}
