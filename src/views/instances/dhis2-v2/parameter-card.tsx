import { IconChevronRight16 } from '@dhis2/ui'
import { Fragment } from 'react'
import type { FC, ReactNode } from 'react'
import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import { useParameterCondition } from '../../../hooks/use-parameter-condition.ts'
import { StackParameterGroup, StackParameterWithGroup } from '../../../types/index.ts'
import { BOOLEAN_PARAMETERS, ParameterField } from '../fields/parameter-field.tsx'
import { Dhis2StackName } from '../parameters.ts'
import styles from '../styles.module.css'
import { ADVANCED_SECTIONS, OTHER_SETTINGS } from './advanced-sections.ts'
import { SectionCard } from './section-card.tsx'

/* Parameters shown in a card's body; everything else goes under its Advanced settings. */
const PRIMARY_PARAMETERS = new Set([
    'IMAGE_TAG',
    'WORKER_IMAGE_TAG',
    'IMAGE_REPOSITORY',
    'DATABASE_ID',
    'DATABASE_SIZE',
    'MINIO_STORAGE_SIZE',
    'FILESYSTEM_VOLUME_SIZE',
    'S3_BUCKET',
    'S3_REGION',
    'S3_IDENTITY',
    'S3_SECRET',
    'DORIS_FRONTEND_VERSION',
    'DORIS_BACKEND_VERSION',
])

const name = (parameter: StackParameterWithGroup) => parameter.parameterName ?? ''

const ConditionalSection: FC<{ stackId: Dhis2StackName; when?: StackParameterGroup['when']; children: ReactNode }> = ({ stackId, when, children }) =>
    useParameterCondition(stackId, when) ? <>{children}</> : null

export type ParameterCardProps = {
    stackId: Dhis2StackName
    title: string
    /* The card's sections. One section's advanced settings are sorted by the ADVANCED_SECTIONS map; several
     * sections' by section. */
    groups: GroupedParameters[]
    /* Sections that show inside the card while a choice made in it holds, such as the file store's. */
    insets?: GroupedParameters[]
    sensitiveParameters: Record<string, boolean>
    immutableReasons?: Record<string, string>
    formMode?: 'create' | 'update'
    /* Parameters rendered elsewhere, such as the switches the Components tiles stand for. */
    hiddenParameters?: Set<string>
    id?: string
    actions?: ReactNode
}

export const ParameterCard: FC<ParameterCardProps> = ({
    stackId,
    title,
    groups,
    insets = [],
    sensitiveParameters,
    immutableReasons = {},
    formMode = 'create',
    hiddenParameters,
    id,
    actions,
}) => {
    /* The choice an inset depends on is shown above it, whatever kind of parameter it is. */
    const choices = new Set(insets.map(({ group }) => group.when?.parameter))
    /* A required field with no default has to be filled in, so it isn't tucked away where its error can't be seen. */
    const isPrimary = (parameter: StackParameterWithGroup) =>
        PRIMARY_PARAMETERS.has(name(parameter)) || choices.has(name(parameter)) || (parameter.required && parameter.defaultValue === undefined)
    const shown = (parameters: StackParameterWithGroup[]) => parameters.filter((parameter) => !hiddenParameters?.has(name(parameter)))

    const renderField = (parameter: StackParameterWithGroup) => (
        <ParameterField
            key={name(parameter)}
            stackId={stackId}
            parameterName={name(parameter)}
            displayName={parameter.displayName ?? name(parameter)}
            sensitive={sensitiveParameters[name(parameter)]}
            required={parameter.required}
            formMode={formMode}
            immutableReason={formMode === 'update' ? immutableReasons[name(parameter)] : undefined}
        />
    )
    /* Inputs in the grid, then the checkboxes as a list of their own. */
    const fields = (parameters: StackParameterWithGroup[]) => {
        const checks = parameters.filter((parameter) => BOOLEAN_PARAMETERS.has(name(parameter)))
        const inputs = parameters.filter((parameter) => !BOOLEAN_PARAMETERS.has(name(parameter)))
        return (
            <>
                {inputs.length > 0 && <div className={styles.grid}>{inputs.map(renderField)}</div>}
                {checks.length > 0 && <div className={styles.checks}>{checks.map(renderField)}</div>}
            </>
        )
    }
    const subsection = (heading: string | undefined, parameters: StackParameterWithGroup[]) => (
        <div key={heading ?? ''} className={styles.subsection}>
            {heading && <h3 className={styles.subheading}>{heading}</h3>}
            {fields(parameters)}
        </div>
    )

    const several = groups.length > 1
    const primary = groups.map(({ group, parameters }) => ({ group, parameters: shown(parameters).filter(isPrimary) })).filter(({ parameters }) => parameters.length > 0)
    const secondary = groups.flatMap(({ parameters }) => shown(parameters).filter((parameter) => !isPrimary(parameter)))

    const advanced: Array<[string | undefined, StackParameterWithGroup[]]> = (() => {
        if (several) {
            return groups
                .map(({ group, parameters }): [string, StackParameterWithGroup[]] => [group.title, shown(parameters).filter((parameter) => !isPrimary(parameter))])
                .filter(([, parameters]) => parameters.length > 0)
        }
        const map = ADVANCED_SECTIONS[`${stackId}/${groups[0]?.group.name}`]
        if (!map) {
            return secondary.length > 0 ? [[undefined, secondary]] : []
        }
        const placed = new Set(map.flatMap(([, names]) => names))
        const sections = map.map(([heading, names]): [string, StackParameterWithGroup[]] => [heading, secondary.filter((parameter) => names.includes(name(parameter)))])
        return [...sections, [OTHER_SETTINGS, secondary.filter((parameter) => !placed.has(name(parameter)))] as [string, StackParameterWithGroup[]]].filter(
            ([, parameters]) => parameters.length > 0
        )
    })()

    const footer = secondary.length > 0 && (
        <details className={styles.advanced}>
            <summary>
                <span className={styles.advancedChevron}>
                    <IconChevronRight16 />
                </span>
                Advanced
            </summary>
            <div className={styles.advancedBody}>{advanced.map(([heading, parameters]) => subsection(heading, parameters))}</div>
        </details>
    )

    const renderInset = ({ group, parameters }: GroupedParameters) => (
        <ConditionalSection key={`inset-${group.name}`} stackId={stackId} when={group.when}>
            <div className={styles.inset}>
                <h3 className={styles.insetTitle}>{group.title}</h3>
                {fields(shown(parameters))}
            </div>
        </ConditionalSection>
    )
    /* An inset follows the section holding the choice it depends on, so the two read together. */
    const ownsChoice = (parameters: StackParameterWithGroup[], inset: GroupedParameters) => parameters.some((parameter) => name(parameter) === inset.group.when?.parameter)
    const placed = new Set<GroupedParameters>()
    const withInsets = (key: string, content: ReactNode, parameters: StackParameterWithGroup[]) => {
        const own = insets.filter((inset) => !placed.has(inset) && ownsChoice(parameters, inset))
        own.forEach((inset) => placed.add(inset))
        return (
            <Fragment key={key}>
                {content}
                {own.map(renderInset)}
            </Fragment>
        )
    }

    return (
        <SectionCard title={title} id={id} actions={actions} footer={footer}>
            {primary.map(({ group, parameters }) => withInsets(group.name, several ? subsection(group.title, parameters) : fields(parameters), parameters))}
            {insets.filter((inset) => !placed.has(inset)).map(renderInset)}
        </SectionCard>
    )
}
