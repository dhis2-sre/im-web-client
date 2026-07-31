import { Button, DataTable, DataTableBody, DataTableCell, DataTableColumnHeader, DataTableHead, DataTableRow, IconLock16 } from '@dhis2/ui'
import { useMemo, useState } from 'react'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useStack } from '../../../hooks/index.ts'
import { DeploymentInstance, StackParameter } from '../../../types/index.ts'
import styles from './instance-components.module.css'

export const ParametersSection: FC<{ instance: DeploymentInstance }> = ({ instance }) => {
    const [expanded, setExpanded] = useState(false)
    const { stack } = useStack(instance.stackName ?? '')

    const stackParameters = useMemo(() => {
        if (!stack?.parameters) {
            return null
        }
        return stack.parameters.reduce<Record<string, StackParameter>>((map, parameter) => {
            map[parameter.parameterName] = parameter
            return map
        }, {})
    }, [stack])

    if (!instance.parameters || !stackParameters) {
        return null
    }

    return (
        <div className={styles.instanceComponents}>
            <DataTable dataTest={`parameters-${instance.id}`}>
                <DataTableBody>
                    <DataTableRow
                        expanded={expanded}
                        onExpandToggle={() => setExpanded((current) => !current)}
                        expandableContent={
                            <DataTable>
                                <DataTableHead>
                                    <DataTableRow>
                                        <DataTableColumnHeader>Name</DataTableColumnHeader>
                                        <DataTableColumnHeader>Value</DataTableColumnHeader>
                                    </DataTableRow>
                                </DataTableHead>
                                <DataTableBody>
                                    {Object.keys(instance.parameters).map((name) => (
                                        <DataTableRow key={name}>
                                            <DataTableCell staticStyle>{name}</DataTableCell>
                                            <DataTableCell staticStyle>
                                                {stackParameters[name]?.sensitive && (
                                                    <span>
                                                        <Button disabled={true}>
                                                            <IconLock16 />
                                                        </Button>
                                                    </span>
                                                )}
                                                {!stackParameters[name]?.sensitive && name === 'DATABASE_ID' && (
                                                    <Link to={`/databases/${instance.parameters[name].value}`}>{instance.parameters[name].value}</Link>
                                                )}
                                                {!stackParameters[name]?.sensitive && name !== 'DATABASE_ID' && instance.parameters[name].value}
                                            </DataTableCell>
                                        </DataTableRow>
                                    ))}
                                </DataTableBody>
                            </DataTable>
                        }
                    >
                        <DataTableCell staticStyle>
                            Parameters: {instance.name} ({instance.stackName})
                        </DataTableCell>
                    </DataTableRow>
                </DataTableBody>
            </DataTable>
        </div>
    )
}
