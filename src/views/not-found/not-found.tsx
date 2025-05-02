import { NoticeBox } from '@dhis2/ui'
import style from './not-found.module.css'

export const NotFound = () => {
    return (
        <div className={style.wrapper}>
            <NoticeBox title="404 - Page Not Found">
                Sorry, the page you are looking for could not be found.
                <p>
                    If you&apos;re looking for all public instances, they can be found on the{' '}
                    <a href="https://play.dhis2.org" target="_blank" rel="noopener noreferrer" className={style.link}>
                        DHIS2 Play instances page
                    </a>
                    .
                </p>
                <p>
                    Instances can be configured using{' '}
                    <a href="https://im.dhis2.org" target="_blank" rel="noopener noreferrer" className={style.link}>
                        Instance Manager
                    </a>
                    .
                </p>
            </NoticeBox>
        </div>
    )
}
