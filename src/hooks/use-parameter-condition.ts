import { getIn } from 'final-form'
import { useEffect, useState } from 'react'
import { useForm } from 'react-final-form'
import { StackParameterCondition } from '../types/index.ts'

/* Whether a declared condition currently holds, watching the parameter it names on the given stack.
 * The stack is a parameter because a companion's condition is declared by the stack offering it,
 * while the companion's own fields live under its own stack. A missing condition always holds. */
export const useParameterCondition = (stackId: string, when?: StackParameterCondition) => {
    const form = useForm()
    const conditionPath = `${stackId}.${when?.parameter}`
    const [value, setValue] = useState(() => getIn(form.getState().values, conditionPath))

    useEffect(() => {
        return form.subscribe(
            ({ values }) => {
                setValue(getIn(values, conditionPath))
            },
            { values: true }
        )
    }, [form, conditionPath])

    if (!when) {
        return true
    }
    return value === when.equals
}
