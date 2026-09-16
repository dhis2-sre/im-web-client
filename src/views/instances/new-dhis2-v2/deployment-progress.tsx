import { IconCheckmarkCircle16, IconError16 } from '@dhis2/ui'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import type { DeploymentStep } from '../../../hooks/use-stack-deployment-creation.ts'
import styles from './deployment-progress.module.css'

const DOTS_INTERVAL_MS = 400
const MAX_DOTS = 3

const useGrowingDots = (active: boolean) => {
    const [count, setCount] = useState(1)

    useEffect(() => {
        if (!active) {
            setCount(1)
            return
        }
        const interval = setInterval(() => setCount((current) => (current % MAX_DOTS) + 1), DOTS_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [active])

    return '.'.repeat(count)
}

const StepIcon: FC<{ status: DeploymentStep['status'] }> = ({ status }) => {
    if (status === 'success') {
        return <IconCheckmarkCircle16 color="var(--colors-green700)" />
    }
    if (status === 'error') {
        return <IconError16 color="var(--colors-red700)" />
    }
    return null
}

export const DeploymentProgress: FC<{ name: string; steps: DeploymentStep[] }> = ({ name, steps }) => {
    const dots = useGrowingDots(steps.some((step) => step.status === 'running'))

    if (steps.length === 0) {
        return null
    }

    return (
        <div className={styles.progress}>
            <span className={styles.heading}>Deploying {steps.length === 1 ? 'stack' : 'stacks'}</span>
            <ul className={styles.steps}>
                {steps.map((step) => (
                    <li key={step.stackName} className={styles.step}>
                        <span className={styles.label}>
                            {name} <span className={styles.stackName}>({step.stackName})</span>
                        </span>
                        <span className={styles.dots}>{step.status === 'running' ? dots : ''}</span>
                        <StepIcon status={step.status} />
                    </li>
                ))}
            </ul>
        </div>
    )
}
