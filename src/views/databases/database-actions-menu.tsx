import { useState } from 'react'
import type { FC } from 'react'
import { ActionsMenu, useActionAlert } from '../../components/index.ts'
import { useAuthAxios } from '../../hooks/index.ts'
import { baseURL } from '../../hooks/use-auth-axios.ts'
import type { Database, ExternalDownload } from '../../types/index.ts'
import { CopyDatabaseModal } from './copy-database-modal.tsx'
import { RenameDatabaseModal } from './rename-database-modal.tsx'

export const DatabaseActionsMenu: FC<{ database: Database; refetch: () => void }> = ({ database, refetch }) => {
    const [modal, setModal] = useState<'rename' | 'copy' | null>(null)
    const alert = useActionAlert()
    const fullName = `${database.groupName}/${database.name}`
    const [, fetchDownloadLink] = useAuthAxios<ExternalDownload>({ url: `/databases/${database.id}/external`, method: 'post', data: { expiration: 60 } }, { manual: true })
    const [, deleteDatabase] = useAuthAxios({ url: `/databases/${database.id}`, method: 'delete' }, { manual: true })

    const download = async () => {
        try {
            const { data } = await fetchDownloadLink()
            const link = document.createElement('a')
            link.href = `${baseURL}/databases/external/${data.uuid}`
            link.target = '_blank'
            link.click()
            link.remove()
        } catch (error) {
            console.error(error)
            alert.error(`Couldn't start the download of ${fullName}`)
        }
    }

    const remove = async () => {
        try {
            await deleteDatabase()
            alert.success(`Deleted ${fullName}`)
            refetch()
        } catch (error) {
            console.error('Error deleting database:', error)
            alert.error(`Couldn't delete ${fullName}`)
        }
    }

    return (
        <>
            <ActionsMenu
                label={`Actions for ${database.name}`}
                items={[
                    { label: 'Download', onClick: download },
                    { label: 'Rename', onClick: () => setModal('rename') },
                    { label: 'Copy', onClick: () => setModal('copy') },
                    {
                        label: 'Delete',
                        destructive: true,
                        confirm: {
                            title: 'Delete database',
                            message: (
                                <>
                                    Delete <strong>{fullName}</strong>? This cannot be undone.
                                </>
                            ),
                            confirmLabel: 'Delete',
                            destructive: true,
                            typed: { name: database.name },
                        },
                        onClick: remove,
                    },
                ]}
            />
            {modal === 'rename' && (
                <RenameDatabaseModal
                    onClose={() => setModal(null)}
                    onComplete={refetch}
                    databaseId={database.id}
                    currentName={database.name}
                    currentDescription={database.description}
                />
            )}
            {modal === 'copy' && <CopyDatabaseModal onClose={() => setModal(null)} onComplete={refetch} databaseId={database.id} currentName={database.name} />}
        </>
    )
}
