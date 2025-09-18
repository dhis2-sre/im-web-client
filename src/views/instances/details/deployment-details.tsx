import { Button, Center, CircularLoader, Card, NoticeBox } from '@dhis2/ui'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../../../components/index.ts'
import { useDeploymentDetails } from '../../../hooks/index.ts'
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
                    {deployment?.instances?.length > 0 && <DeploymentInstancesList deployment={deployment} refetch={refetch} loading={loading} />}
                </>
            )}
        </div>
    )
}
