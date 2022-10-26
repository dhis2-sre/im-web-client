import { getStack } from '../../api/stacks'
import { Stack } from '../../types/stack'
import { useApi } from '../../api/useApi'

export const StackConfigurator = ({ name }) => {
    const { result: stack, isLoading } = useApi<Stack>(getStack, { name })

    if (isLoading) {
        return null
    }

    console.log(stack)

    return <h1>Configure {name}</h1>
}
