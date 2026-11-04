import { Card, NoticeBox } from '@dhis2/ui'
import { Link } from 'react-router-dom'
import classes from './validate-success.module.css'

export const ValidateSuccess = () => (
    <div className={classes.container}>
        <Card className={classes.card}>
            <h1 className={classes.headline}>Account verification</h1>

            <NoticeBox valid title="Account verified">
                <Link to="/">Log in</Link> to start using Instance Manager.
            </NoticeBox>
        </Card>
    </div>
)
