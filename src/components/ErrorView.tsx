import { NoticeBox, Button } from '@dhis2/ui'
import { useNavigate } from 'react-router-dom'
import { useRouteError } from 'react-router-dom'
import styles from './ErrorView.module.css'

type Error = {
    statusText?: string
    message?: string
}

export const ErrorView = () => {
    const navigate = useNavigate()
    const error: Error = useRouteError()
    console.error(error)

    return (
        <div className={styles.container}>
            <NoticeBox className={styles.noticebox} error title="Sorry, an unexpected error has occurred">
                {error.statusText || error.message}
            </NoticeBox>
            <Button onClick={() => navigate('/')}>Go home</Button>
        </div>
    )
}
