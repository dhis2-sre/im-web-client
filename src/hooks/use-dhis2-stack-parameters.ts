import { useMemo } from 'react'
import { Stack, StackParameter } from '../types'
import { useAuthAxios } from './use-auth-axios'
import { STACK_PRIMARY_PARAMETERS } from '../views/instances/new-dhis2/constants'
import { Dhis2StackId } from '../views/instances/new-dhis2/parameter-fieldset'

type SecondaryAndPrimaryParameters = {
    primaryParameters: StackParameter[]
    secondaryParameters: StackParameter[]
}
type InitialValues = { [key: string]: string }

const isPrimary = (stackName: Dhis2StackId, parameterName): boolean => STACK_PRIMARY_PARAMETERS.get(stackName).has(parameterName)

export const useDhis2StackParameters = (stackName: Dhis2StackId) => {
    const [{ data: stack, loading, error }] = useAuthAxios<Stack>(`/stacks/${stackName}`)
    const { primaryParameters, secondaryParameters } = useMemo(
        () =>
            (stack?.parameters ?? [])
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
        [stackName, stack]
    )
    const initialParameterValues: InitialValues = useMemo(
        () =>
            (stack?.parameters ?? []).reduce<InitialValues>((valuesAccumulator, parameter) => {
                console.log(parameter)
                valuesAccumulator[parameter.parameterName] = parameter.defaultValue
                return valuesAccumulator
            }, {}),
        [stack]
    )

    return {
        loading,
        error,
        primaryParameters,
        secondaryParameters,
        initialParameterValues,
    }
}
