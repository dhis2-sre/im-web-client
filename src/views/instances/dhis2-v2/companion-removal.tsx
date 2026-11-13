import { Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle } from '@dhis2/ui'
import type { AnyObject, FormApi } from 'final-form'
import type { FC, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { COMPANION_LABELS } from '../../../constants.ts'
import type { Deployment, StackCompanion } from '../../../types/index.ts'
import { deploymentHasInstanceOf } from './deployment-instances.ts'
import { STACK_ID } from './dhis2-v2-form.tsx'

/* A read replaces every sensitive value with a run of stars, which is not a value anyone can submit.
 * Those fields start empty instead, and the form tells the user that leaving them so keeps what the
 * instance already holds. */
const isMaskedValue = (value: string) => /^[*•]+$/.test(value)

export const initialValuesFor = (deployment: Deployment) => {
    const perStack: Record<string, Record<string, string>> = {}
    for (const instance of deployment.instances ?? []) {
        if (!instance.stackName || !instance.parameters) {
            continue
        }
        perStack[instance.stackName] = Object.fromEntries(
            Object.entries(instance.parameters).map(([name, parameter]) => {
                const value = parameter.value ?? ''
                return [name, isMaskedValue(value) ? '' : value]
            })
        )
    }

    const mainInstance = deployment.instances?.find((instance) => instance.stackName === STACK_ID)
    return {
        description: deployment.description ?? '',
        ttl: deployment.ttl,
        public: mainInstance?.public ?? false,
        ...perStack,
    }
}

/* The companions the deployment has now that the edit would leave it without. Removing one destroys
 * a running release, which is the one thing in this form worth stopping to confirm. */
export const companionsBeingRemoved = (deployment: Deployment, companions: StackCompanion[], values: AnyObject) => {
    const stackValues: AnyObject = values[STACK_ID] ?? {}
    return companions
        .filter((companion) => deploymentHasInstanceOf(deployment, companion.name))
        .filter((companion) => companion.when && stackValues[companion.when.parameter] !== companion.when.equals)
        .map((companion) => companion.name)
}

/* A preset holds settings, not a running release, so removing a companion from one drops only its saved login. */
type RemovalNoun = 'instance' | 'preset'

export const CompanionRemovalModal: FC<{ names: string[]; deploymentName?: string; noun?: RemovalNoun; onConfirm: () => void; onCancel: () => void }> = ({
    names,
    deploymentName,
    noun = 'instance',
    onConfirm,
    onCancel,
}) => {
    const removing = names.map((name) => COMPANION_LABELS[name] ?? name).join(' and ')
    return (
        <Modal onClose={onCancel}>
            <ModalTitle>Remove {removing}?</ModalTitle>
            <ModalContent>
                {noun === 'preset' ? (
                    <>
                        Saving removes {removing} from the preset <strong>{deploymentName}</strong>, along with {names.length > 1 ? 'their' : 'its'} saved login. This can&apos;t be
                        undone.
                    </>
                ) : (
                    <>
                        Saving removes {removing} from <strong>{deploymentName}</strong> and deletes everything stored in {names.length > 1 ? 'them' : 'it'}. This can&apos;t be
                        undone.
                    </>
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button secondary onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button destructive onClick={onConfirm}>
                        Save and remove
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

type Save = (values: AnyObject, dirtyFields: Record<string, boolean>) => Promise<AnyObject | undefined>

/* eslint-disable max-params -- the noun is an addition to an existing three-argument call */
export const useCompanionRemovalConfirm = (
    deployment: Deployment | undefined,
    companions: StackCompanion[],
    save: Save,
    noun: RemovalNoun = 'instance'
): { submit: (values: AnyObject, form: FormApi) => Promise<AnyObject | undefined>; modal: ReactNode } => {
    /* eslint-enable max-params */
    const [pendingRemoval, setPendingRemoval] = useState<{ names: string[]; confirm: () => void; cancel: () => void } | null>(null)

    const submit = useCallback(
        (values: AnyObject, form: FormApi) => {
            const dirtyFields = form.getState().dirtyFields
            const removing = deployment ? companionsBeingRemoved(deployment, companions, values) : []
            if (removing.length === 0) {
                return save(values, dirtyFields)
            }

            /* The submit stays open across the confirmation so the form knows it is still
             * submitting; backing out resolves it as a submit that did nothing. */
            return new Promise<AnyObject | undefined>((resolve) => {
                setPendingRemoval({
                    names: removing,
                    confirm: () => {
                        setPendingRemoval(null)
                        resolve(save(values, dirtyFields))
                    },
                    cancel: () => {
                        setPendingRemoval(null)
                        resolve(undefined)
                    },
                })
            })
        },
        [deployment, companions, save]
    )

    const modal = pendingRemoval && (
        <CompanionRemovalModal names={pendingRemoval.names} deploymentName={deployment?.name} noun={noun} onConfirm={pendingRemoval.confirm} onCancel={pendingRemoval.cancel} />
    )

    return { submit, modal }
}
