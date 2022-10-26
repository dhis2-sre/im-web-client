import { Card } from '@dhis2/ui'
import { Link } from 'react-router-dom'
import { getStacks } from '../api/stacks'
import { Stacks } from '../types/stack'
import { useApi } from '../api/useApi'
import styles from './Stacks.module.css'

const StackList = () => {
    const { result: stacks, isLoading } = useApi<Stacks>(getStacks)

    if (isLoading) {
        return null
    }

    return (
        <div>
            <h1>List of stacks</h1>
            {stacks.map((stack) => {
                return (
                    <Card className={styles.card} key={stack.name}>
                        <Link to={`/stacks/${stack.name}`}>{stack.name}</Link>
                    </Card>
                )
            })}
        </div>
    )
}

export default StackList
