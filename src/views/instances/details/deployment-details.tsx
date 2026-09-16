import { Button, Center, CircularLoader, Card, NoticeBox } from '@dhis2/ui'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails, useLiveComponents } from '../../../hooks/index.ts'
import { Deployment } from '../../../types/index.ts'
import { DeploymentComponents } from './deployment-components.tsx'
import styles from './deployment-details.module.css'
import { DeploymentInstancesList } from './deployment-instances-list.tsx'
import { DeploymentSummary } from './deployment-summary.tsx'

export const DeploymentDetails: FC = () => {
    const navigate = useNavigate()
    const [{ data: deployment, error, loading }, refetch] = useDeploymentDetails()
    const title = 'Instance details'

    return (
        <div className={styles.wrapper}>
            <Heading title={title}>
                <Button onClick={() => navigate('/instances')}>Back to list</Button>
            </Heading>

            {error && !deployment && (
                <NoticeBox error title="Could not retrieve instance details">
                    {error.message}
                </NoticeBox>
            )}

            {loading && (
                <Center className={styles.loaderWrap}>
                    <CircularLoader />
                </Center>
            )}

            {deployment && (
                <>
                    <div className={styles.cardWrap}>
                        <Card className={styles.card}>
                            <DeploymentSummary deployment={deployment} />
                        </Card>
                    </div>
                    {!deployment?.instances?.length && (
                        <NoticeBox title="No stacks connected to this instance">Currently you can only add components to an instance when creating one.</NoticeBox>
                    )}
                    {deployment?.instances?.length > 0 && <DeploymentStacksAndComponents deployment={deployment} loading={loading} refetch={() => void refetch()} />}
                </>
            )}
        </div>
    )
}

/* Mounted only once the deployment has loaded, so the components query has an id to ask about. The
 * stack list and the components section share the one query: it asks the cluster about every
 * component of every instance, and the stack list needs it to know whether anything can be backed
 * up. */
const DeploymentStacksAndComponents: FC<{ deployment: Deployment; loading: boolean; refetch: () => void }> = ({ deployment, loading, refetch }) => {
    const components = useLiveComponents(deployment.id)

    return (
        <>
            <DeploymentInstancesList deployment={deployment} loading={loading} components={components.instances} refetch={refetch} />
            <DeploymentComponents deployment={deployment} components={components} />
        </>
    )
}
