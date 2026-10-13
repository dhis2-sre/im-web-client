import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAuthAxios } from '../../../hooks/index.ts'
import styles from '../styles.module.css'

export const MAX_BULK_DEPLOYMENTS = 50

type BulkNameAvailability = { names: string[]; taken: string[]; reason?: string }

const parseCount = (count: string) => {
    const parsed = Number(count)
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_BULK_DEPLOYMENTS ? parsed : undefined
}

/* The names are checked as they are typed so a taken one shows before anything is sent, but the bulk deploy checks them again when it creates the deployments and creates none if one was taken in between. */
export const BulkDeployModal: FC<{
    group: string
    initialPrefix: string
    onCancel: () => void
    onDeploy: (prefix: string, count: number) => Promise<string | undefined>
}> = ({ group, initialPrefix, onCancel, onDeploy }) => {
    const [prefix, setPrefix] = useState(initialPrefix)
    const [countInput, setCountInput] = useState('2')
    const [deploying, setDeploying] = useState(false)
    const [deployError, setDeployError] = useState<string>()
    const count = parseCount(countInput)
    const [checkedPrefix] = useDebounce(prefix, 300)
    const [checkedCount] = useDebounce(count, 300)
    const ready = !!checkedPrefix && !!checkedCount
    const [{ data: availability, loading, error }] = useAuthAxios<BulkNameAvailability>(
        { url: '/deployments/bulk/availability', params: { group, prefix: checkedPrefix, count: checkedCount } },
        { manual: !ready }
    )
    const current = ready && checkedPrefix === prefix && checkedCount === count && !loading && !error && availability
    const taken = new Set(current ? current.taken : [])
    const canDeploy = !!current && !current.reason && taken.size === 0 && !deploying

    const deploy = async () => {
        if (!count) {
            return
        }
        setDeploying(true)
        setDeployError(await onDeploy(prefix, count))
        setDeploying(false)
    }

    return (
        <Modal onClose={deploying ? undefined : onCancel}>
            <ModalTitle>Bulk deploy</ModalTitle>
            <ModalContent>
                <p className={styles.bulkIntro}>
                    Creates and deploys this configuration under numbered names in <strong>{group}</strong>. They deploy a few at a time, and the instance list shows their
                    progress.
                </p>
                <div className={styles.bulkFields}>
                    <InputField label="Name prefix" value={prefix} onChange={({ value }) => setPrefix(value ?? '')} required className={styles.bulkPrefix} />
                    <InputField
                        label="Instances"
                        type="number"
                        min="1"
                        max={String(MAX_BULK_DEPLOYMENTS)}
                        value={countInput}
                        onChange={({ value }) => setCountInput(value ?? '')}
                        error={!count}
                        validationText={count ? undefined : `Between 1 and ${MAX_BULK_DEPLOYMENTS}`}
                        required
                        inputWidth="100px"
                    />
                </div>
                {current && current.reason && <NoticeBox error>{current.reason}</NoticeBox>}
                {current && !current.reason && (
                    <>
                        <div className={styles.bulkNames}>
                            {current.names.map((name) => (
                                <span key={name} className={taken.has(name) ? styles.bulkNameTaken : styles.bulkName}>
                                    {name}
                                </span>
                            ))}
                        </div>
                        {taken.size > 0 && (
                            <NoticeBox warning title="Some names are taken">
                                {[...taken].join(', ')} already exist in {group}. Choose another prefix.
                            </NoticeBox>
                        )}
                    </>
                )}
                {error && !loading && <NoticeBox error>Could not check the names: {error.message}</NoticeBox>}
                {deployError && (
                    <NoticeBox error title="Nothing was deployed">
                        {deployError}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary disabled={deploying} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button primary disabled={!canDeploy} loading={deploying || (ready && loading)} onClick={() => void deploy()}>
                        {count ? `Deploy ${count} ${count === 1 ? 'instance' : 'instances'}` : 'Deploy'}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
