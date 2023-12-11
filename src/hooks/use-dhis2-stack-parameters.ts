import { useMemo } from 'react'
import { Stack, StackParameter } from '../types'
import { useAuthAxios } from './use-auth-axios'

type SecondaryAndPrimaryParameters = {
    primaryParameters: StackParameter[]
    secondaryParameters: StackParameter[]
}
type InitialValues = { [key: string]: string }

const PRIMARY_PARAMETERS = new Set(['IMAGE_TAG', 'IMAGE_REPOSITORY', 'DATABASE_ID'])
const isPrimary = (parameterName: string): boolean => PRIMARY_PARAMETERS.has(parameterName)

export const useDhis2StackParameters = (stackName: string) => {
    const [{ data: stack, loading, error }] = useAuthAxios<Stack>(`/stacks/${stackName}`)
    const { primaryParameters, secondaryParameters } = useMemo(
        () =>
            (stack?.parameters ?? [])
                .filter((parameter) => !parameter.consumed)
                .sort((a, b) => (a.priority < b.priority ? -1 : 1))
                .reduce<SecondaryAndPrimaryParameters>(
                    (parameterGroups, parameter) => {
                        if (isPrimary(parameter.parameterName)) {
                            parameterGroups.primaryParameters.push(parameter)
                        } else {
                            parameterGroups.secondaryParameters.push(parameter)
                        }
                        return parameterGroups
                    },
                    { primaryParameters: [], secondaryParameters: [] }
                ),
        [stack]
    )
    const initialParameterValues: InitialValues = useMemo(
        () =>
            (stack?.parameters ?? []).reduce<InitialValues>((valuesAccumulator, parameter) => {
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
