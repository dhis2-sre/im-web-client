import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow } from '@dhis2/ui'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../page/page.tsx'
import type { PageError } from '../page/page.tsx'
import { NonIdealState } from '../states/non-ideal-state.tsx'
import styles from './list-page.module.css'

export type ListColumn<T> = {
    key: string
    label: string
    render: (row: T) => ReactNode
    /* A quieter second line under the cell's content, such as a description under a name. */
    detail?: (row: T) => ReactNode
    /* Makes the column sortable by this value. */
    sortValue?: (row: T) => string | number
    width?: string
    /* Long unbroken values, such as emails and paths, may break anywhere rather than widen the table. */
    breakAnywhere?: boolean
    /* Short values, such as dates and versions, stay on one line. */
    nowrap?: boolean
    /* Figures, such as sizes, line up when right-aligned; a column of icons sits centred. */
    align?: 'left' | 'center' | 'right'
}

export type ListGroup<T> = { key: string; title: string; rows: T[] }

type SortDirection = 'default' | 'asc' | 'desc'
type Sort = { key: string; direction: SortDirection }

type ListPageProps<T> = {
    title: string
    /* The page's primary action, such as a New button. */
    actions?: ReactNode
    /* A bar across the top of the table: filters, toggles and search. */
    filters?: ReactNode
    /* Anything above the table and its filter bar, such as a breadcrumb through a folder tree. */
    above?: ReactNode
    columns: ListColumn<T>[]
    /* Either flat rows, or groups, each under its own header row in the one table. */
    rows?: T[]
    groups?: ListGroup<T>[]
    rowKey: (row: T) => string | number
    /* Where the first column links to, so a row opens through a real link on its name. */
    rowHref?: (row: T) => string
    /* The row's one visible action and its ActionsMenu. */
    renderRowActions?: (row: T) => ReactNode
    /* The column shrinks to fit its buttons unless given a width. */
    rowActionsWidth?: string
    /* Rows that stay on top whatever the sort, such as folders above files. */
    pinned?: (row: T) => boolean
    loading?: boolean
    error?: PageError
    empty: { title: string; description?: ReactNode; action?: ReactNode }
}

const compare = (a: string | number, b: string | number) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)))

const sortRows = <T,>(rows: T[], sort: Sort, { sortValue, pinned }: { sortValue?: (row: T) => string | number; pinned?: (row: T) => boolean }) => {
    if (!sortValue || sort.direction === 'default') {
        return rows
    }
    const sign = sort.direction === 'asc' ? 1 : -1
    const byValue = (a: T, b: T) => sign * compare(sortValue(a), sortValue(b))
    if (!pinned) {
        return [...rows].sort(byValue)
    }
    return [...rows.filter(pinned).sort(byValue), ...rows.filter((row) => !pinned(row)).sort(byValue)]
}

type ListTableProps<T> = Pick<ListPageProps<T>, 'columns' | 'rowKey' | 'rowHref' | 'renderRowActions' | 'rowActionsWidth' | 'pinned'> & {
    /* One section per group, each under a full-width header row, so the column headers show once. */
    groups: ListGroup<T>[]
    sort: Sort
    onSort: (sort: Sort) => void
}

const cellClass = <T,>(column: ListColumn<T>) => [styles.cell, column.breakAnywhere && styles.breakAnywhere, column.nowrap && styles.nowrap].filter(Boolean).join(' ')

const ListTable = <T,>({ columns, groups, rowKey, rowHref, renderRowActions, rowActionsWidth = '1%', pinned, sort, onSort }: ListTableProps<T>) => {
    const sortColumn = columns.find((column) => column.key === sort.key)
    const rowCells = (row: T) => (
        <>
            {columns.map((column, index) => {
                const content = column.render(row)
                const href = index === 0 ? rowHref?.(row) : undefined
                const detail = column.detail?.(row)
                return (
                    /* Static, because only the name link and the actions respond to a click, so the row shouldn't look pressed. The hover is our own, in the CSS module. */
                    <DataTableCell key={column.key} staticStyle align={column.align} className={cellClass(column)}>
                        {href ? (
                            <Link to={href} className={styles.rowLink}>
                                {content}
                            </Link>
                        ) : (
                            content
                        )}
                        {detail && (
                            <div className={styles.detail} title={typeof detail === 'string' ? detail : undefined}>
                                {detail}
                            </div>
                        )}
                    </DataTableCell>
                )
            })}
            {renderRowActions && (
                <DataTableCell staticStyle align="right">
                    <div className={styles.rowActions}>{renderRowActions(row)}</div>
                </DataTableCell>
            )}
        </>
    )
    const sorted = (rows: T[]) => sortRows(rows, sort, { sortValue: sortColumn?.sortValue, pinned })
    const span = columns.length + (renderRowActions ? 1 : 0)

    /* The group headers stick just under the column headers, whose height changes when a label wraps. */
    const frame = useRef<HTMLDivElement>(null)
    useLayoutEffect(() => {
        const head = frame.current?.querySelector('thead')
        if (!head) {
            return
        }
        const update = () => frame.current?.style.setProperty('--list-head-height', `${head.offsetHeight}px`)
        /* Set now as well: a remount's observer doesn't always report the starting size. */
        update()
        const observer = new ResizeObserver(update)
        observer.observe(head)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={frame} className={styles.frame}>
            <DataTable>
                <DataTableHead>
                    <DataTableRow>
                        {columns.map((column) => (
                            <DataTableColumnHeader
                                key={column.key}
                                name={column.key}
                                width={column.width}
                                align={column.align}
                                sortDirection={column.sortValue ? (sort.key === column.key ? sort.direction : 'default') : undefined}
                                onSortIconClick={column.sortValue ? ({ name, direction }) => onSort({ key: name, direction }) : undefined}
                            >
                                {column.label}
                            </DataTableColumnHeader>
                        ))}
                        {renderRowActions && (
                            <DataTableColumnHeader width={rowActionsWidth}>
                                <span className="visually-hidden">Actions</span>
                            </DataTableColumnHeader>
                        )}
                    </DataTableRow>
                </DataTableHead>
                {groups.map((group) => (
                    <DataTableBody key={group.key}>
                        {group.title && (
                            <tr>
                                <th colSpan={span} scope="rowgroup" className={styles.groupHeader}>
                                    {group.title}
                                </th>
                            </tr>
                        )}
                        {sorted(group.rows).map((row) => (
                            <DataTableRow key={rowKey(row)}>{rowCells(row)}</DataTableRow>
                        ))}
                    </DataTableBody>
                ))}
            </DataTable>
        </div>
    )
}

/* The scaffold of a list screen: a header with the title and the primary action, then the table with
 * its filter bar across the top, flat or split into groups by header rows. The body shows loading, error and
 * empty in place of the table while the header and toolbar stay put.
 *
 * Screens describe their columns and rows and never touch the table itself, so the table inside can
 * change, for example to DataGrid, without changing them. */
export const ListPage = <T,>({ title, actions, filters, above, groups, rows, loading, error, empty, ...table }: ListPageProps<T>) => {
    const [sort, setSort] = useState<Sort>({ key: '', direction: 'default' })
    const hasData = groups !== undefined || rows !== undefined
    const total = groups ? groups.reduce((sum, group) => sum + group.rows.length, 0) : (rows?.length ?? 0)

    const body = () => {
        if (loading && !hasData) {
            return (
                <div className={styles.frame}>
                    <NonIdealState variant="loading" title="Loading…" />
                </div>
            )
        }
        if (error && !hasData) {
            return (
                <div className={styles.frame}>
                    <NonIdealState variant="error" title={error.title} description={error.description} />
                </div>
            )
        }
        if (total === 0) {
            return (
                <div className={styles.frame}>
                    <NonIdealState variant="empty" title={empty.title} description={empty.description} action={empty.action} />
                </div>
            )
        }
        return <ListTable {...table} groups={groups ?? [{ key: '', title: '', rows: rows ?? [] }]} sort={sort} onSort={setSort} />
    }

    return (
        <Page title={title} actions={actions}>
            {above}
            <div>
                {filters && <div className={styles.toolbar}>{filters}</div>}
                {body()}
            </div>
        </Page>
    )
}
