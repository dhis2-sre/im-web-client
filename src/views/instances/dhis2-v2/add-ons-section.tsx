import { Button, CircularLoader, NoticeBox } from '@dhis2/ui'
import cx from 'classnames'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FC, ReactNode } from 'react'
import { useField, useForm } from 'react-final-form'
import { useGroupedStackParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useParameterCondition } from '../../../hooks/use-parameter-condition.ts'
import { StackCompanion } from '../../../types/index.ts'
import { Dhis2StackName } from '../parameters.ts'
import styles from '../styles.module.css'
import type { AddOn } from './add-ons.ts'
import { ParameterCard } from './parameter-card.tsx'
import type { ParameterCardProps } from './parameter-card.tsx'
import { SectionCard } from './section-card.tsx'

type Shared = Pick<ParameterCardProps, 'sensitiveParameters' | 'immutableReasons' | 'formMode'>

/* A companion stack's own card, shown while the condition the offering stack declared holds. Turning the
 * enabling parameter on is the opt-in, so the choice is stored on the host instance rather than living in form
 * state, and the same declaration decides what the submit sends. */
const CompanionCard: FC<{
    offeringStackId: string
    companion: StackCompanion
    title: string
    formMode: 'create' | 'update'
    showImmutable: boolean
    id: string
    actions: ReactNode
}> = ({ offeringStackId, companion, title, formMode, showImmutable, id, actions }) => {
    const { groups, initialParameterValues, sensitiveParameters, immutableReasons, loading, error } = useGroupedStackParameters(companion.name)
    const form = useForm()
    const applies = useParameterCondition(offeringStackId, companion.when)

    /* Seed the companion's defaults with change rather than initialize. Initializing would fold
     * everything already typed into the form's initial values, leaving it pristine and the submit
     * button disabled until the next edit. */
    useEffect(() => {
        if (!applies) {
            return
        }
        const values = form.getState().values[companion.name] ?? {}
        form.batch(() => {
            for (const [parameterName, value] of Object.entries(initialParameterValues)) {
                if (values[parameterName] === undefined) {
                    form.change(`${companion.name}.${parameterName}`, value)
                }
            }
        })
    }, [applies, form, companion.name, initialParameterValues])

    if (loading || error) {
        return (
            <SectionCard title={title} id={id} actions={actions}>
                {loading ? (
                    <CircularLoader small />
                ) : (
                    <NoticeBox error title={`Couldn't load the ${title} fields`}>
                        {error?.message}
                    </NoticeBox>
                )}
            </SectionCard>
        )
    }

    return (
        <ParameterCard
            stackId={companion.name as Dhis2StackName}
            title={title}
            id={id}
            actions={actions}
            groups={groups.filter(({ group }) => !group.when)}
            insets={groups.filter(({ group }) => group.when)}
            sensitiveParameters={sensitiveParameters}
            immutableReasons={showImmutable ? immutableReasons : undefined}
            formMode={formMode}
        />
    )
}

/* Whose name an add-on's own path hangs off: the instance being edited, the one this form is creating (read
 * from its Name field), or none yet, as for a preset. */
export type InstanceAddress = { name?: string } | 'form' | undefined

const FormName: FC<{ children: (name?: string) => ReactNode }> = ({ children }) => {
    const { input } = useField('name', { subscription: { value: true } })
    return <>{children(input.value || undefined)}</>
}

/* Where an add-on with nothing to set is served, with the instance's name swapped in once there is one. */
const AddressNote: FC<{ pathSuffix: string; address: InstanceAddress }> = ({ pathSuffix, address }) => {
    const note = (name?: string) => (
        <p className={styles.note}>
            Available at <code className={styles.code}>{`/${name ?? 'instance-name'}${pathSuffix}`}</code>
        </p>
    )
    return address === 'form' ? <FormName>{note}</FormName> : note(address?.name)
}

const cardId = (addOn: AddOn) => `add-on-${addOn.parameter.toLowerCase()}`

const Tile: FC<{ stackId: string; addOn: AddOn; locked?: string; onAdd: () => void }> = ({ stackId, addOn, locked, onAdd }) => {
    const { input } = useField(`${stackId}.${addOn.parameter}`, { subscription: { value: true } })
    const added = input.value === 'true'
    return (
        <div className={cx(styles.tile, { [styles.added]: added })}>
            <span className={styles.tileName}>{addOn.name}</span>
            {addOn.description && <p className={styles.tileDescription}>{addOn.description}</p>}
            <div className={styles.tileAction}>
                {added ? (
                    <>
                        <span className={styles.addedLabel}>Added</span>
                        {/* Shown on hover or focus, for someone back at the tiles who changed their mind. */}
                        {!locked && (
                            <Button small secondary className={styles.tileRemove} aria-label={`Remove ${addOn.name}`} onClick={() => input.onChange('false')}>
                                Remove
                            </Button>
                        )}
                    </>
                ) : (
                    <Button
                        small
                        secondary
                        disabled={!!locked}
                        title={locked}
                        aria-label={`Add ${addOn.name}`}
                        onClick={() => {
                            input.onChange('true')
                            onAdd()
                        }}
                    >
                        Add
                    </Button>
                )}
            </div>
        </div>
    )
}

const AddOnCard: FC<{
    stackId: Dhis2StackName
    addOn: AddOn
    shared: Shared
    companionFormMode: 'create' | 'update'
    showImmutable: boolean
    justAdded: boolean
    onScrolled: () => void
    address: InstanceAddress
}> = ({ stackId, addOn, shared, companionFormMode, showImmutable, justAdded, onScrolled, address }) => {
    const { input } = useField(`${stackId}.${addOn.parameter}`, { subscription: { value: true } })
    const ref = useRef<HTMLDivElement>(null)
    const added = input.value === 'true'

    /* Adding from a tile brings the new card into view, since it opens below the tiles. Only that once: a
     * preset that later switches the same add-on on must not move the page. */
    useEffect(() => {
        if (added && justAdded) {
            ref.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
            onScrolled()
        }
    }, [added, justAdded, onScrolled])

    if (!added) {
        return null
    }
    const locked = shared.formMode === 'update' ? shared.immutableReasons?.[addOn.parameter] : undefined
    const actions = (
        <Button small secondary destructive disabled={!!locked} title={locked} onClick={() => input.onChange('false')}>
            Remove
        </Button>
    )
    const id = cardId(addOn)

    let card
    if (addOn.companion) {
        card = (
            <CompanionCard
                offeringStackId={stackId}
                companion={addOn.companion}
                title={addOn.name}
                formMode={companionFormMode}
                showImmutable={showImmutable}
                id={id}
                actions={actions}
            />
        )
    } else if (addOn.groups.length > 0) {
        card = <ParameterCard stackId={stackId} title={addOn.name} id={id} actions={actions} groups={addOn.groups} {...shared} />
    } else {
        card = (
            <SectionCard title={addOn.name} id={id} actions={actions}>
                {addOn.pathSuffix ? <AddressNote pathSuffix={addOn.pathSuffix} address={address} /> : <p className={styles.note}>Nothing to set.</p>}
            </SectionCard>
        )
    }
    return <div ref={ref}>{card}</div>
}

/* The add-ons: a tile for each, then a card for each one added. A tile stays where it is when its add-on is
 * added, so the row doesn't shift under the pointer; the card opens below the tiles. */
export const AddOnsSection: FC<{
    stackId: Dhis2StackName
    addOns: AddOn[]
    shared: Shared
    companionFormMode: (companionName: string) => 'create' | 'update'
    showImmutable: boolean
    address: InstanceAddress
}> = ({ stackId, addOns, shared, companionFormMode, showImmutable, address }) => {
    const [justAdded, setJustAdded] = useState<string>()
    const clearJustAdded = useCallback(() => setJustAdded(undefined), [])
    if (addOns.length === 0) {
        return null
    }
    return (
        <>
            <div className={styles.addOnsHeading}>
                <h2>Add-ons</h2>
                <p>Optional services that run alongside this instance.</p>
            </div>
            <div className={styles.tiles}>
                {addOns.map((addOn) => (
                    <Tile
                        key={addOn.parameter}
                        stackId={stackId}
                        addOn={addOn}
                        locked={shared.formMode === 'update' ? shared.immutableReasons?.[addOn.parameter] : undefined}
                        onAdd={() => setJustAdded(addOn.parameter)}
                    />
                ))}
            </div>
            {addOns.map((addOn) => (
                <AddOnCard
                    key={addOn.parameter}
                    stackId={stackId}
                    addOn={addOn}
                    shared={shared}
                    companionFormMode={addOn.companion ? companionFormMode(addOn.companion.name) : 'create'}
                    showImmutable={showImmutable}
                    justAdded={justAdded === addOn.parameter}
                    onScrolled={clearJustAdded}
                    address={address}
                />
            ))}
        </>
    )
}
