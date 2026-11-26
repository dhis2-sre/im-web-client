import { Button, IconLaunch16 } from '@dhis2/ui'
import type { FC } from 'react'
import type { Group } from '../../../types/index.ts'
import { endpointUrl } from '../../../utils/stack-endpoints.ts'

/* Opens an instance in a new tab at its own address. */
export const OpenButton: FC<{ group: Group; name: string }> = ({ group, name }) => (
    <Button small secondary icon={<IconLaunch16 />} onClick={() => window.open(endpointUrl(group, name), '_blank', 'noopener,noreferrer')}>
        Open
    </Button>
)
