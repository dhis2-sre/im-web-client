import { DataTable, DataTableBody, DataTableCell, DataTableRow, IconLock16 } from '@dhis2/ui'
import type { FC, ReactNode } from 'react'
import styles from './details-table.module.css'

/* The rest of an entity's record, one labelled value per row, for a details page's Details panel.
 * Rows are named, which keys them, and read in the order given; an empty one (undefined, null, false or an empty string, but not 0) is skipped, so a row can
 * be included with a plain condition. */
export const DetailsTable: FC<{ rows: Record<string, ReactNode> }> = ({ rows }) => (
    <DataTable>
        <DataTableBody>
            {Object.entries(rows)
                .filter(([, value]) => value !== undefined && value !== null && value !== false && value !== '')
                .map(([name, value]) => (
                    <DataTableRow key={name}>
                        <DataTableCell staticStyle className={styles.name}>
                            {name}
                        </DataTableCell>
                        <DataTableCell staticStyle>{value}</DataTableCell>
                    </DataTableRow>
                ))}
        </DataTableBody>
    </DataTable>
)

/* A literal value, such as an id, path or hostname, set in monospace and free to break anywhere. */
export const Mono: FC<{ children: ReactNode }> = ({ children }) => <span className={styles.mono}>{children}</span>

/* Stands in for a sensitive value, which is often a password, so it is never shown. */
export const HiddenValue: FC = () => (
    <span className={styles.hidden}>
        <IconLock16 />
        Hidden
    </span>
)
