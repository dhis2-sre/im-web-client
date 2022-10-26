import { NavLink } from 'react-router-dom'
import { getStacks } from '../api/stacks'
import { Stacks } from '../types/stack'
import { useApi } from '../api/useApi'
import styles from './StackSubNav.module.css'

const StackSubNav = () => {
    const { result: stacks, isLoading } = useApi<Stacks>(getStacks)

    if (isLoading) {
        return null
    }

    return (
        <div className={styles.subnav}>
            {stacks.map((stack) => (
                <NavLink key={stack.name} to={`/stacks/${stack.name}`}>
                    {stack.name}
                </NavLink>
            ))}
        </div>
    )
}

export default StackSubNav
