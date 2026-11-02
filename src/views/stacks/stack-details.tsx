import { DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconLink16, IconList16 } from '@dhis2/ui'
import { useMemo } from 'react'
import type { FC, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiddenValue, ItemPanel, ItemPanelList, MetaFact, MetaLine, Page, Panel } from '../../components/index.ts'
import type { PageError } from '../../components/index.ts'
import { useStack } from '../../hooks/index.ts'
import { StackParameterWithGroup, StackWithParameterGroups } from '../../types/index.ts'
import { groupStackParameters } from '../../utils/stack-parameter-groups.ts'

/* How much it asks for and which stacks it cannot run without. */
const stackFacts = (stack: StackWithParameterGroups): Record<string, ReactNode> => ({
    parameters: (
        <MetaFact icon={<IconList16 />}>
            {stack.parameters?.length ?? 0} {stack.parameters?.length === 1 ? 'parameter' : 'parameters'}
        </MetaFact>
    ),
    requires: stack.requires?.length && (
        <MetaFact icon={<IconLink16 />}>
            Needs{' '}
            {[...stack.requires]
                .sort((a, b) => (a.name < b.name ? -1 : 1))
                .map((required, i) => (
                    <span key={required.name}>
                        {i > 0 && ', '}
                        <Link to={`/stacks/${required.name}`}>{required.name}</Link>
                    </span>
                ))}
        </MetaFact>
    ),
})

const ParametersTable: FC<{ parameters: StackParameterWithGroup[] }> = ({ parameters }) => (
    <DataTable>
        <DataTableHead>
            <DataTableRow>
                <DataTableColumnHeader>Name</DataTableColumnHeader>
                <DataTableColumnHeader>Default value</DataTableColumnHeader>
                <DataTableColumnHeader>Sensitive</DataTableColumnHeader>
                <DataTableColumnHeader>Consumed</DataTableColumnHeader>
            </DataTableRow>
        </DataTableHead>
        <DataTableBody>
            {parameters.map((parameter) => (
                <DataTableRow key={parameter.parameterName}>
                    <DataTableCell>{parameter.displayName}</DataTableCell>
                    <DataTableCell>
                        {/* A sensitive default is often a password, so it stays hidden here as on an instance's page. */}
                        {parameter.sensitive ? <HiddenValue /> : parameter.defaultValue}
                    </DataTableCell>
                    <DataTableCell>{parameter.sensitive ? 'Yes' : 'No'}</DataTableCell>
                    <DataTableCell>{parameter.consumed ? 'Yes' : 'No'}</DataTableCell>
                </DataTableRow>
            ))}
        </DataTableBody>
    </DataTable>
)

export const StackDetails = () => {
    const { name } = useParams()
    const { stack, loading, error } = useStack(name ?? '')
    const sections = useMemo(() => groupStackParameters(stack as StackWithParameterGroups | undefined), [stack])

    let pageError: PageError | undefined
    if (error) {
        pageError = { title: 'Could not fetch stack details', description: error.message }
    } else if (!stack) {
        pageError = { title: 'Stack not found', description: `No stack named "${name}" exists.` }
    }

    return (
        <Page
            key={name}
            parent={{ label: 'Stacks', to: '/stacks' }}
            title={stack?.name ?? name}
            band
            loading={loading}
            error={pageError}
            summary={stack && <MetaLine items={stackFacts(stack as StackWithParameterGroups)} />}
        >
            {/* A stack that declares no groups has one flat list of parameters, which needs no section
             * of its own. */}
            {sections.length === 1 && !sections[0].group ? (
                <Panel title="Parameters" flush>
                    <ParametersTable parameters={sections[0].parameters} />
                </Panel>
            ) : (
                sections.length > 0 && (
                    <ItemPanelList title="Parameters">
                        {sections.map((section) => (
                            <ItemPanel
                                key={section.group?.name ?? 'ungrouped'}
                                title={section.group?.title ?? 'Other'}
                                meta={{ when: section.group?.when && `In effect when ${section.group.when.parameter} is ${section.group.when.equals}` }}
                            >
                                <ParametersTable parameters={section.parameters} />
                            </ItemPanel>
                        ))}
                    </ItemPanelList>
                )
            )}
        </Page>
    )
}
