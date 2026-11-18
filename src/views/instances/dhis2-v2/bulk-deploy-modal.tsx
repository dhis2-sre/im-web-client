import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAuthAxios } from '../../../hooks/index.ts'
import type { BulkDeployError } from '../../../hooks/use-stack-deployment-creation.ts'
import type { ClusterResources } from '../../../types/index.ts'
import styles from '../styles.module.css'
import { formatGi, isBusy, listNames, perInstanceResources } from './bulk-summary.ts'

export const MAX_BULK_DEPLOYMENTS = 50

type BulkNameAvailability = { names: string[]; taken: string[]; reason?: string }

const parseCount = (count: string) => {
    const parsed = Number(count)
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_BULK_DEPLOYMENTS ? parsed : undefined
}

/* The names are checked as they are typed so a taken one shows before anything is sent, but the bulk deploy checks them again when it creates the deployments and creates none if one was taken in between. */
export const BulkDeployModal: FC<{
    group: string
    values: AnyObject
    initialPrefix: string
    onCancel: () => void
    onDeploy: (prefix: string, count: number) => Promise<BulkDeployError | undefined>
}> = ({ group, values, initialPrefix, onCancel, onDeploy }) => {
    const [prefix, setPrefix] = useState(initialPrefix)
    const [countInput, setCountInput] = useState('2')
    const [deploying, setDeploying] = useState(false)
    const [deployError, setDeployError] = useState<BulkDeployError>()
    const count = parseCount(countInput)
    const [{ data: resources }] = useAuthAxios<ClusterResources>(`/groups/${encodeURIComponent(group)}/resources`, { useCache: false })
    const each = perInstanceResources(values)
    const [checkedPrefix] = useDebounce(prefix, 300)
    const [checkedCount] = useDebounce(count, 300)
    const ready = !!checkedPrefix && !!checkedCount
    const [{ data: availability, loading, error }] = useAuthAxios<BulkNameAvailability>(
        { url: '/deployments/bulk/availability', params: { group, prefix: checkedPrefix, count: checkedCount } },
        { manual: !ready, useCache: false }
    )
    const current =
        ready && checkedPrefix === prefix && checkedCount === count && !loading && !error && availability?.names.length === count && availability.names[0] === `${prefix}-1`
            ? availability
            : undefined
    const taken = current?.taken ?? []
    const canDeploy = !!current && !current.reason && taken.length === 0 && !deploying

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
            <ModalTitle>Create several instances</ModalTitle>
            <ModalContent>
                <div className={styles.bulkFields}>
                    <InputField label="Name prefix" value={prefix} onChange={({ value }) => setPrefix(value ?? '')} required className={styles.bulkPrefix} />
                    <InputField
                        label="How many"
                        type="number"
                        min="1"
                        max={String(MAX_BULK_DEPLOYMENTS)}
                        value={countInput}
                        onChange={({ value }) => setCountInput(value ?? '')}
                        error={!count}
                        validationText={count ? undefined : `Enter a number from 1 to ${MAX_BULK_DEPLOYMENTS}`}
                        required
                        inputWidth="100px"
                    />
                </div>
                {/* What will be created, in one line: the run of names and what they add up to. */}
                {prefix && count && (
                    <p className={styles.bulkPreview}>
                        <strong>{count === 1 ? `${prefix}-1` : `${prefix}-1 to ${prefix}-${count}`}</strong> in {group}
                        {(each.disk > 0 || each.memory > 0) && (
                            <span className={styles.bulkTotals}>
                                {' '}
                                · {formatGi(each.disk * count)} disk, {formatGi(each.memory * count)} memory in total
                            </span>
                        )}
                    </p>
                )}
                <div className={styles.bulkNotices}>
                    {count && isBusy(resources) && (
                        <NoticeBox dense warning title={`${group} is already busy`}>
                            It&apos;s using {resources?.CPU} of its CPU and {resources?.Memory} of its memory. {count} more {count === 1 ? 'instance' : 'instances'} may not fit.
                        </NoticeBox>
                    )}
                    {current && current.reason && (
                        <NoticeBox dense error>
                            {current.reason}
                        </NoticeBox>
                    )}
                    {taken.length > 0 && (
                        <NoticeBox dense warning title={`${listNames(taken)} already ${taken.length === 1 ? 'exists' : 'exist'} in ${group}`}>
                            Choose another prefix.
                        </NoticeBox>
                    )}
                </div>
                {error && !loading && (
                    <NoticeBox dense error>
                        Couldn&apos;t check the names: {error.message}
                    </NoticeBox>
                )}
                {deployError && (
                    <NoticeBox dense error title={deployError.refused ? 'Nothing was created' : 'Some instances may have been created'}>
                        {deployError.refused ? deployError.message : `${deployError.message} Check the instance list before you try again.`}
                    </NoticeBox>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary disabled={deploying} onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button primary disabled={!canDeploy} loading={deploying || (ready && loading)} onClick={() => void deploy()}>
                        {count ? `Create ${count} ${count === 1 ? 'instance' : 'instances'}` : 'Create'}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
