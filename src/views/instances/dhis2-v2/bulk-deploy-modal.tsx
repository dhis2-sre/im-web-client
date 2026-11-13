import { Button, ButtonStrip, InputField, Modal, ModalActions, ModalContent, ModalTitle, NoticeBox } from '@dhis2/ui'
import type { AnyObject } from 'final-form'
import type { FC } from 'react'
import { useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useAuthAxios, useDatabaseLabel } from '../../../hooks/index.ts'
import type { BulkDeployError } from '../../../hooks/use-stack-deployment-creation.ts'
import type { ClusterResources } from '../../../types/index.ts'
import { CopyNotice } from '../../presets/copy-notice.tsx'
import { validateEmailFormat } from '../fields/text-parameter-input.tsx'
import { TTL_PRESETS } from '../fields/ttl-presets.ts'
import styles from '../styles.module.css'
import { formatGi, isBusy, perInstanceResources } from './bulk-summary.ts'

export const MAX_BULK_DEPLOYMENTS = 50

type BulkNameAvailability = { names: string[]; taken: string[]; reason?: string }

const parseCount = (count: string) => {
    const parsed = Number(count)
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_BULK_DEPLOYMENTS ? parsed : undefined
}

export type BulkAskFor = { stackName: string; parameterName: string; displayName: string; type?: 'text' | 'password' | 'email' }

const DAY_SECONDS = 86400

const lifetimeLabel = (ttl: unknown) => {
    const seconds = Number(ttl)
    if (!seconds) {
        return undefined
    }
    return TTL_PRESETS.find((preset) => preset.seconds === seconds)?.label ?? `${Math.round(seconds / DAY_SECONDS)} days`
}

/* The names are checked as they are typed so a taken one shows before anything is sent, but the bulk deploy checks them again when it creates the deployments and creates none if one was taken in between. */
export const BulkDeployModal: FC<{
    group: string
    values: AnyObject
    initialPrefix: string
    /* The name of the preset the values were copied from, which can't carry passwords and keys. */
    copiedFrom?: string
    /* Required values the copy couldn't carry, asked for here and merged into the values. */
    askFor?: BulkAskFor[]
    onCancel: () => void
    onDeploy: (prefix: string, count: number, extra: AnyObject) => Promise<BulkDeployError | undefined>
}> = ({ group, values, initialPrefix, copiedFrom, askFor = [], onCancel, onDeploy }) => {
    const [prefix, setPrefix] = useState(initialPrefix)
    const [countInput, setCountInput] = useState('2')
    const [deploying, setDeploying] = useState(false)
    const [deployError, setDeployError] = useState<BulkDeployError>()
    const [asked, setAsked] = useState<Record<string, string>>({})
    const count = parseCount(countInput)
    const askedKey = (field: BulkAskFor) => `${field.stackName}.${field.parameterName}`
    const askedError = (field: BulkAskFor) => (field.type === 'email' && asked[askedKey(field)] ? validateEmailFormat(asked[askedKey(field)]) : undefined)
    const askedComplete = askFor.every((field) => !!asked[askedKey(field)] && !askedError(field))
    const main: AnyObject = values['dhis2-v2'] ?? {}
    const { label: database } = useDatabaseLabel(main.DATABASE_ID)
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
    const taken = new Set(current ? current.taken : [])
    const canDeploy = !!current && !current.reason && taken.size === 0 && askedComplete && !deploying

    const deploy = async () => {
        if (!count) {
            return
        }
        setDeploying(true)
        const extra = askFor.reduce<AnyObject>(
            (merged, field) => ({ ...merged, [field.stackName]: { ...merged[field.stackName], [field.parameterName]: asked[askedKey(field)] } }),
            {}
        )
        setDeployError(await onDeploy(prefix, count, extra))
        setDeploying(false)
    }

    return (
        <Modal onClose={deploying ? undefined : onCancel}>
            <ModalTitle>Create several instances</ModalTitle>
            <ModalContent>
                <p className={styles.bulkIntro}>
                    Creates instances with these settings in <strong>{group}</strong>, numbered from the prefix. They deploy a few at a time and show their progress in the instance
                    list.
                </p>
                <p className={styles.bulkSummary}>
                    Each instance:{' '}
                    {[main.IMAGE_TAG && `DHIS2 ${main.IMAGE_TAG}`, database, main.STORAGE_TYPE, lifetimeLabel(values.ttl) && `${lifetimeLabel(values.ttl)} lifetime`]
                        .filter(Boolean)
                        .join(' · ')}
                </p>
                {copiedFrom && <CopyNotice className={styles.bulkNotice} source={copiedFrom} target="instances" onForm={askFor.length > 0} />}
                {askFor.length > 0 && (
                    <div className={styles.bulkFields}>
                        {askFor.map((field) => (
                            <InputField
                                key={askedKey(field)}
                                label={field.displayName}
                                type={field.type ?? 'text'}
                                value={asked[askedKey(field)] ?? ''}
                                error={!!askedError(field)}
                                validationText={askedError(field)}
                                onChange={({ value }) => setAsked((current) => ({ ...current, [askedKey(field)]: value ?? '' }))}
                                required
                                className={styles.bulkPrefix}
                            />
                        ))}
                    </div>
                )}
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
                {count && (each.disk > 0 || each.memory > 0) && (
                    <p className={styles.bulkTotals}>
                        In total: <strong>{formatGi(each.disk * count)}</strong> of disk and <strong>{formatGi(each.memory * count)}</strong> of requested memory (
                        {formatGi(each.disk)} and {formatGi(each.memory)} each).
                    </p>
                )}
                {count && isBusy(resources) && (
                    <NoticeBox warning title={`${group} is already busy`}>
                        It&apos;s using {resources?.CPU} of its CPU and {resources?.Memory} of its memory. {count} more {count === 1 ? 'instance' : 'instances'} may not fit.
                    </NoticeBox>
                )}
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
                                {[...taken].join(', ')} {taken.size === 1 ? 'already exists' : 'already exist'} in {group}. Choose another prefix.
                            </NoticeBox>
                        )}
                    </>
                )}
                {error && !loading && <NoticeBox error>Couldn&apos;t check the names: {error.message}</NoticeBox>}
                {deployError && (
                    <NoticeBox error title={deployError.refused ? 'Nothing was created' : 'Some instances may have been created'}>
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
