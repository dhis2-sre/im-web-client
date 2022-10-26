import { Link } from 'react-router-dom'
import { getStacks } from '../api/stacks'
import { Stacks } from '../types/stack'
import { useApi } from '../api/useApi'

const StackList = () => {
    const { result: stacks } = useApi<Stacks>(getStacks)

    return (
        <div>
            <h1>List of stacks</h1>
            {stacks?.map((stack) => {
                return (
                    <div key={stack.name}>
                        <Link to={`/stacks/${stack.name}`}>{stack.name}</Link>
                    </div>
                )
            })}
        </div>
    )
}

export default StackList
