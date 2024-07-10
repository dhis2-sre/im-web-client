import { Fragment } from 'react'
import classes from './running-instances.module.css'

const mockedInstances = [
  {
    version: '41.0.0',
    url: 'https://play.dhis2.org/41.0.0',
    description: 'Demo of DHIS 2 version 41 latest stable patch',
    owner: 'instance-manager',
    dockerImage: 'dhis2/core:41.0.0',
    database: 'SL Demo 2.41.0',
    postgresqlVersion: 'PostgreSQL 13',
    group: 'stable',
  },
  {
    version: '41dev',
    url: 'https://play.dhis2.org/41.0.0',
    description: 'Demo of DHIS 2 version 41 latest stable patch',
    owner: 'instance-manager',
    dockerImage: 'dhis2/core:41.0.0',
    database: 'SL Demo 2.41.0',
    postgresqlVersion: 'PostgreSQL 13',
    group: 'dev',
  },
  {
    version: '41nightly',
    url: 'https://play.dhis2.org/41.0.0',
    description: 'Demo of DHIS 2 version 41 latest stable patch',
    owner: 'instance-manager',
    dockerImage: 'dhis2/core:41.0.0',
    database: 'SL Demo 2.41.0',
    postgresqlVersion: 'PostgreSQL 13',
    group: 'nightly',
  },
  {
    version: '40.0.0',
    url: 'https://play.dhis2.org/40.0.0',
    description: 'Demo of DHIS 2 version 40 latest stable patch',
    owner: 'instance-manager',
    dockerImage: 'dhis2/core:40.0.0',
    database: 'SL Demo 2.40.0',
    postgresqlVersion: 'PostgreSQL 13',
    group: 'stable',
  },
  {
    version: '40dev',
    url: 'https://play.dhis2.org/40.0.0',
    description: 'Demo of DHIS 2 version 40 latest stable patch',
    owner: 'instance-manager',
    dockerImage: 'dhis2/core:40.0.0',
    database: 'SL Demo 2.40.0',
    postgresqlVersion: 'PostgreSQL 13',
    group: 'dev',
  },
  {
    version: '40nightly',
    url: 'https://play.dhis2.org/40.0.0',
    description: 'Demo of DHIS 2 version 40 latest stable patch',
    owner: 'instance-manager',
    dockerImage: 'dhis2/core:40.0.0',
    database: 'SL Demo 2.40.0',
    postgresqlVersion: 'PostgreSQL 13',
    group: 'nightly',
  },
]

const groupInstances = (instances) => {
  return instances.reduce(
    (groups, instance) => {
      const { group } = instance
      const groupInstances = groups[group] || []

      return {
        ...groups,
        [group]: [...groupInstances, instance],
      }
    },
    {}
  )
}

export function RunningInstances() {
  const runningInstances = mockedInstances
  const groupedInstances = groupInstances(runningInstances)

  return (
    <>
    	<header className={classes.header}>
        {/* @TODO(DEVOPS-272): Should this be dynamic? If not, choose a proper title */ ''}
        <h1>Running instances</h1>
    	</header>

    	<main>
        <p>
          Here you can find demo instances for the most recent versions of
          DHIS2! Each of the links below has a version of DHIS2 with our demo
          database.
        </p>

        <p>
          Log in with:<br />
          - user: <b>admin</b><br />
          - password: <b>district</b>
        </p>

        <p>
          For links to additional demo databases for specific DHIS2 apps and use
          cases, please visit

          <a
          	// @TOOO(DEVOPS-272): Needs correct url
            href="https://www.dhis2.org/demo"
            target="_blank"
          >
            https://www.dhis2.org/demo
          </a>
        </p>

    		<div>
    			<div>
    				<div>Name</div>
    				<div>Description</div>
    			</div>

    			{Object.entries(groupedInstances).map(([group, instances]) => (
      			<Fragment key={group}>
        			<div>
          			<div>
            			{/*TODO(DEVOPS-272): Do we want to display "Canary" when group is nightly?*/ ''}
            			{group}
          			</div>
        			</div>

      				{(instances as Array<any>).map(({
                version,
                url,
                description,
                owner,
                dockerImage,
                database,
                postgresqlVersion,
      				}) => (
      					<Fragment key={version}>
            			<div>
            				<div>
            					<a href={url} target="_blank">{version}</a>
          					</div>
          					<div>{description}</div>
            			</div>

            			<div>
            				<div>
              				<div>
              					<div>owner</div>
              					<div>{owner}</div>
              				</div>
              				<div>
              					<div>docker image</div>
              					<div>{dockerImage}</div>
              				</div>
              				<div>
              					<div>database</div>
              					<div>
                					{database}<br />
                					<span className="tag">{postgresqlVersion}</span>
              					</div>
              				</div>
            				</div>
            			</div>
      					</Fragment>
      				))}
    				</Fragment>
    			))}
    		</div>
    	</main>
    </>
  )
}
