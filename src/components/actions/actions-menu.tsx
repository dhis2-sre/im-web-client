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
    /* Common enough to sit ahead of the menu as a button of its own, as on a details page. */
    button?: boolean
    /* Busy for a reason the menu cannot see, such as a modal the item opened. */
    busy?: boolean
}

type ActionsMenuProps = {
    /* The button's accessible name, such as "Actions for my-instance". */
    label: string
    /* Falsy entries are skipped, so an item can be included with a plain condition. */
    items: (ActionItem | false | null | undefined)[]
    dataTest?: string
}

/* One kebab menu for every row and page that has more actions than its one visible button. Items
 * are declared rather than rendered, so confirmation, the busy state and closing the menu behave the
 * same everywhere, including for the items a page lifts out as buttons. */
export const ActionsMenu: FC<ActionsMenuProps> = ({ label, items, dataTest }) => {
    const anchor = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [running, setRunning] = useState<string[]>([])
    const { confirm, modal } = useConfirmedAction()
    const visibleItems = items.filter((item): item is ActionItem => Boolean(item))
    const buttonItems = visibleItems.filter((item) => item.button)
    const menuItems = visibleItems.filter((item) => !item.button)
    const isBusy = (item: ActionItem) => Boolean(item.busy) || running.includes(item.label)

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
        setRunning((labels) => [...labels, item.label])
        try {
            await item.onClick()
        } catch (error) {
            // Items report their own failures; this only keeps a missed one from going unnoticed.
            console.error(error)
        } finally {
            setRunning((labels) => labels.filter((running) => running !== item.label))
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

    return (
        <>
            {buttonItems.map((item, index) => (
                <span key={item.label} title={item.unavailable} className={item.destructive && index > 0 && !buttonItems[index - 1].destructive ? styles.apart : undefined}>
                    <Button
                        small
                        secondary={item.destructive}
                        destructive={item.destructive}
                        disabled={Boolean(item.unavailable)}
                        loading={isBusy(item)}
                        onClick={() => select(item)}
                    >
                        {item.label}
                    </Button>
                </span>
            ))}
            {menuItems.length > 0 && (
                <span ref={anchor} className={styles.anchor}>
                    <Button
                        small
                        secondary
                        icon={<IconMore16 />}
                        aria-label={label}
                        aria-haspopup="menu"
                        aria-expanded={open}
                        title={label}
                        loading={menuItems.some(isBusy)}
                        onClick={() => setOpen((current) => !current)}
                        dataTest={dataTest}
                    />
                </span>
            )}
            {open && (
                <Layer onBackdropClick={() => setOpen(false)}>
                    <Popper reference={anchor} placement="bottom-end">
                        <FlyoutMenu dense closeMenu={close}>
                            {/* A divider sets the destructive actions apart from the ones before them. */}
                            {menuItems.map((item, index) => (
                                <Fragment key={item.label}>
                                    {item.destructive && index > 0 && !menuItems[index - 1].destructive && <MenuDivider dense />}
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
