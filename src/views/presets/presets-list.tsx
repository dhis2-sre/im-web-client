import { Button, ButtonStrip, Center, CircularLoader, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import Moment from 'react-moment'
import { Link, useNavigate } from 'react-router-dom'
import { Heading } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'
import { DeletePresetButton } from './delete-preset-button.tsx'
import { presetMainInstance, usePresetSummary } from './preset-summary.ts'
import styles from './presets.module.css'

const PresetRow: FC<{ preset: Deployment; onDeleted: () => void }> = ({ preset, onDeleted }) => {
    const navigate = useNavigate()
    const { version, database, storage, companions } = usePresetSummary(preset)

    return (
        <DataTableRow>
            <DataTableCell>
                <Link to={`/presets/${preset.id}`}>{preset.name}</Link>
                {preset.description && <div className={styles.description}>{preset.description}</div>}
            </DataTableCell>
            <DataTableCell>{preset.groupName}</DataTableCell>
            <DataTableCell>{version}</DataTableCell>
            <DataTableCell>{database}</DataTableCell>
            <DataTableCell>{storage}</DataTableCell>
            <DataTableCell>{companions.join(', ')}</DataTableCell>
            <DataTableCell>{preset.user?.email}</DataTableCell>
            <DataTableCell>
                <Moment date={preset.updatedAt} fromNow />
            </DataTableCell>
            <DataTableCell>
                <ButtonStrip end>
                    <Button small secondary disabled={!presetMainInstance(preset)} onClick={() => navigate(`/instances/new?preset=${preset.id}`)}>
                        Load
                    </Button>
                    <DeletePresetButton small preset={preset} onDeleted={onDeleted} />
                </ButtonStrip>
            </DataTableCell>
        </DataTableRow>
    )
}

export const PresetsList: FC = () => {
    const [{ data: presets, loading, error }, refetch] = useAuthAxios<Deployment[]>('/deployments/presets', { useCache: false })

    return (
        <div className={styles.wrapper}>
            <Heading title="Presets" />
            {loading && !presets && (
                <Center>
                    <CircularLoader />
                </Center>
            )}
            {error && (
                <NoticeBox error title="Could not fetch the presets">
                    {error.message}
                </NoticeBox>
            )}
            {presets && presets.length === 0 && <NoticeBox title="No presets yet">Save a preset from the arrow next to Create instance on the new instance form.</NoticeBox>}
            {presets && presets.length > 0 && (
                <DataTable>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableColumnHeader>Name</DataTableColumnHeader>
                            <DataTableColumnHeader>Group</DataTableColumnHeader>
                            <DataTableColumnHeader>DHIS2 version</DataTableColumnHeader>
                            <DataTableColumnHeader>Database</DataTableColumnHeader>
                            <DataTableColumnHeader>Storage</DataTableColumnHeader>
                            <DataTableColumnHeader>Companions</DataTableColumnHeader>
                            <DataTableColumnHeader>Owner</DataTableColumnHeader>
                            <DataTableColumnHeader>Updated</DataTableColumnHeader>
                            <DataTableColumnHeader />
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {presets.map((preset) => (
                            <PresetRow key={preset.id} preset={preset} onDeleted={() => void refetch()} />
                        ))}
                    </DataTableBody>
                </DataTable>
            )}
        </div>
    )
}
