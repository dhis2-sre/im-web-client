import {
    Button,
    ButtonStrip,
    Center,
    CircularLoader,
    colors,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    IconAdd24,
    IconWorld24,
    NoticeBox,
    Tag,
} from '@dhis2/ui'
import { FC, useEffect } from 'react'
import Moment from 'react-moment'
import { useNavigate } from 'react-router-dom'
import { useAuthAxios } from '../../../hooks'
import { GroupsWithDeployments } from '../../../types'
import { OpenButton } from './open-button'
import styles from './instances-list.module.css'
import { DeleteButton } from './delete-menu-button'
import { Heading, MomentExpiresFromNow } from '../../../components'
import { baseURL } from '../../../hooks/use-auth-axios'
import { getAccessToken } from 'axios-jwt'

export const InstancesList: FC = () => {
    const navigate = useNavigate()
    const [{ data, error, loading }, refetch] = useAuthAxios<GroupsWithDeployments[]>('/deployments', {
        useCache: false,
    })

    useEffect(() => {
        // TODO: Multiple listeners are added... After 5 connections are created no more can be instantiated
        const token = getAccessToken()
        const eventSource = new EventSource(`${baseURL}/subscribe?token=${token}`)
        eventSource.addEventListener('instance-update', (event) => {
            const parse = JSON.parse(event.data)
            console.log(parse)
            refetch()
        })
    }, [])

    return (
        <div className={styles.wrapper}>
            <Heading title="All instances">
                <Button icon={<IconAdd24 />} onClick={() => navigate('/instances/new')}>
                    New instance
                </Button>
            </Heading>

            {error && !data && (
                <NoticeBox error title="Could not retrieve instances">
                    {error.message}
                </NoticeBox>
            )}

            {loading && (
                <Center className={styles.loaderWrap}>
                    <CircularLoader />
                </Center>
            )}

            {data?.length === 0 && <h3>No instances</h3>}

            {data?.length > 0 && (
                <DataTable>
                    {data?.map((group) => (
                        <DataTableBody key={group.name}>
                            <DataTableRow>
                                <DataTableCell staticStyle colSpan="9">
                                    <h2 className={styles.groupName}>{group.name}</h2>
                                </DataTableCell>
                            </DataTableRow>
                            <DataTableRow>
                                <DataTableColumnHeader>Name</DataTableColumnHeader>
                                <DataTableColumnHeader>Description</DataTableColumnHeader>
                                <DataTableColumnHeader>Components</DataTableColumnHeader>
                                <DataTableColumnHeader>Created</DataTableColumnHeader>
                                <DataTableColumnHeader>Updated</DataTableColumnHeader>
                                <DataTableColumnHeader>Owner</DataTableColumnHeader>
                                <DataTableColumnHeader>Expires</DataTableColumnHeader>
                                <DataTableColumnHeader></DataTableColumnHeader>
                            </DataTableRow>

                            {group.deployments?.map((deployment) => (
                                <tr className={styles.clickableRow} key={deployment.id} onClick={() => navigate(`/instances/${deployment.id}/details`, { state: deployment })}>
                                    <DataTableCell>
                                        <span className={styles.verticallyAlignedCellContent}>
                                            {deployment.name} {deployment.public && <IconWorld24 color={colors.grey600} />}
                                        </span>
                                    </DataTableCell>
                                    <DataTableCell>{deployment.description}</DataTableCell>
                                    <DataTableCell>
                                        {deployment.instances?.map(({ stackName, status }) => (
                                            <Tag key={stackName} className={styles.stackNameTag}>
                                                {stackName}({status})
                                            </Tag>
                                        ))}
                                    </DataTableCell>
                                    <DataTableCell>
                                        <Moment date={deployment.createdAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <Moment date={deployment.updatedAt} fromNow />
                                    </DataTableCell>
                                    <DataTableCell>{deployment.user.email}</DataTableCell>
                                    <DataTableCell>
                                        <MomentExpiresFromNow createdAt={deployment.createdAt} ttl={deployment.ttl} />
                                    </DataTableCell>
                                    <DataTableCell>
                                        <ButtonStrip>
                                            <OpenButton hostname={group.hostname} name={deployment.name} />
                                            <DeleteButton id={deployment.id} displayName={deployment.name} onComplete={refetch} />
                                        </ButtonStrip>
                                    </DataTableCell>
                                </tr>
                            ))}
                        </DataTableBody>
                    ))}
                </DataTable>
            )}
        </div>
    )
}
