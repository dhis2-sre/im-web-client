import styles from './instance-play.module.css'

export const InstancePlay = () => (
    <div className={styles.wrapper}>
        <h1 className={styles.heading}>DHIS2 Demo Instances</h1>
        <p className={styles.description}>
            Explore demo instances for the latest DHIS2 versions! Each link below provides access to DHIS2 with our demo database. For additional demo databases for specific DHIS2
            apps and use cases, visit
            <a href="https://www.dhis2.org/demo" target="_blank" rel="noopener noreferrer">
                {' '}
                DHIS2 Demo
            </a>
            .
        </p>
        <div className={styles.loginInfo}>
            <h2>Log in with:</h2>
            <ul>
                <li>
                    <strong>User:</strong> admin
                </li>
                <li>
                    <strong>Password:</strong> district
                </li>
            </ul>
        </div>
    </div>
)
