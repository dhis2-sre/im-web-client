import { Card, NoticeBox } from '@dhis2/ui'
import { Link } from 'react-router-dom'
import classes from './validate-success.module.css'

export const ValidateSuccess = () => (
    <div className={classes.container}>
        <Card className={classes.card}>
            <h1 className={classes.headline}>Account verification</h1>

            <NoticeBox valid className={classes.successMessage} title="You've successfully activated your account!">
                You can log in <Link to="/">here</Link>.
            </NoticeBox>
        </Card>
    </div>
)
