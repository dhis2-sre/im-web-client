import { Button, NoticeBox } from '@dhis2/ui'
import type { FC } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'
import styles from './error-view.module.css'

type Error = {
    statusText?: string
    message?: string
}

export const ErrorView: FC = () => {
    const navigate = useNavigate()
    const error: Error = useRouteError()
    console.error(error)

    return (
        <div className={styles.container}>
            <NoticeBox className={styles.noticebox} error title="Couldn't show this page">
                {error.statusText || error.message}
            </NoticeBox>
            <Button onClick={() => navigate('/')}>Go to instances</Button>
        </div>
    )
}
