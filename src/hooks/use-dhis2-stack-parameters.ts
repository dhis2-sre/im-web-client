import { useMemo } from 'react'
import { STACK_NAMES } from '../constants.ts'
import { Stack, StackParameter } from '../types/index.ts'
import { STACK_PRIMARY_PARAMETERS } from '../views/instances/new-dhis2/constants.ts'
import { Dhis2StackName } from '../views/instances/new-dhis2/parameter-fieldset.tsx'
import { useAuthAxios } from './use-auth-axios.ts'

type SecondaryAndPrimaryParameters = {
    primaryParameters: StackParameter[]
    secondaryParameters: StackParameter[]
}
type InitialValues = { [key: string]: string }
type SensitiveParameters = { [parameterName: string]: boolean }

const isPrimary = (stackName: Dhis2StackName, parameterName): boolean => STACK_PRIMARY_PARAMETERS.get(stackName).has(parameterName)

export const useDhis2StackParameters = (stackName: Dhis2StackName) => {
    const [{ data: stack, loading, error }] = useAuthAxios<Stack>(`/stacks/${stackName}`)

    const extendedParameters = useMemo(() => {
        if (stackName === STACK_NAMES.PG_ADMIN && stack?.parameters) {
            return [
                ...stack.parameters,
                {
                    parameterName: 'PGADMIN_CONFIRM_PASSWORD',
                    displayName: 'Confirm Password',
                    defaultValue: '',
                    consumed: false,
                    priority: 2,
                },
            ]
        }
        return stack?.parameters ?? []
    }, [stack, stackName])

    const { primaryParameters, secondaryParameters } = useMemo(
        () =>
            (extendedParameters ?? [])
                .filter((parameter) => !parameter.consumed)
                .sort((a, b) => (a.priority < b.priority ? -1 : 1))
                .reduce<SecondaryAndPrimaryParameters>(
                    (parameterGroups, parameter) => {
                        if (isPrimary(stackName, parameter.parameterName)) {
                            parameterGroups.primaryParameters.push(parameter)
                        } else {
                            parameterGroups.secondaryParameters.push(parameter)
                        }
                        return parameterGroups
                    },
                    { primaryParameters: [], secondaryParameters: [] }
                ),
        [stackName, extendedParameters]
    )

    const initialParameterValues: InitialValues = useMemo(
        () =>
            (extendedParameters ?? [])
                .filter((parameter) => !parameter.consumed)
                .reduce<InitialValues>((valuesAccumulator, parameter) => {
                    valuesAccumulator[parameter.parameterName] = parameter.defaultValue
                    return valuesAccumulator
                }, {}),
        [extendedParameters]
    )

    const sensitiveParameters: SensitiveParameters = useMemo(
        () =>
            (extendedParameters ?? []).reduce<SensitiveParameters>((sensitiveAccumulator, parameter) => {
                sensitiveAccumulator[parameter.parameterName] = parameter.sensitive ?? false
                return sensitiveAccumulator
            }, {}),
        [extendedParameters]
    )

    const consumedParameterNames: string[] = useMemo(() => extendedParameters.filter((p) => p.consumed).map((p) => p.parameterName), [extendedParameters])

    return {
        loading,
        error,
        primaryParameters,
        secondaryParameters,
        initialParameterValues,
        sensitiveParameters,
        consumedParameterNames,
    }
}
