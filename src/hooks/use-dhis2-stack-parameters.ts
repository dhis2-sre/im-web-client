import { useMemo } from 'react'
import { Stack, StackParameter } from '../types'
import { useAuthAxios } from './use-auth-axios'

type SecondaryAndPrimaryParameters = {
    primaryParameters: StackParameter[]
    secondaryParameters: StackParameter[]
}
type InitialValues = { [key: string]: string }

const PRIMARY_PARAMETERS = new Set(['IMAGE_TAG', 'IMAGE_REPOSITORY', 'DATABASE_ID'])
const isPrimary = (name) => PRIMARY_PARAMETERS.has(name)

export const useDhis2StackParameters = (stackName: string) => {
    const [{ data: stack, loading, error }] = useAuthAxios<Stack>(`/stacks/${stackName}`)
    const { primaryParameters, secondaryParameters } = useMemo(
        () =>
            (stack?.parameters ?? [])
                .filter((parameter) => !parameter.consumed)
                .sort((a, b) => (a.priority < b.priority ? -1 : 1))
                .reduce<SecondaryAndPrimaryParameters>(
                    (acc, parameter) => {
                        if (isPrimary(parameter.name)) {
                            acc.primaryParameters.push(parameter)
                        } else {
                            acc.secondaryParameters.push(parameter)
                        }
                        return acc
                    },
                    { primaryParameters: [], secondaryParameters: [] }
                ),
        [stack]
    )
    const initialParameterValues: InitialValues = useMemo(
        () =>
            (stack?.parameters ?? []).reduce<InitialValues>((acc, parameter) => {
                acc[parameter.name] = parameter.defaultValue
                return acc
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
