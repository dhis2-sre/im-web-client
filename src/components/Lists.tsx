import { Button, IconAdd24 } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useAuthHeader } from 'react-auth-kit'
import { useNavigate } from 'react-router'
import { getInstances } from '../api'
import { InstancesGroup } from '../types'

const InstancesList = () => {
    const navigate = useNavigate()
    const getAuthHeader = useAuthHeader()
    const [instances, setInstances] = useState<InstancesGroup>()

    useEffect(() => {
        const authHeader = getAuthHeader()
        const fetchInstances = async () => {
            const result = await getInstances(authHeader)
            setInstances(result.data)
        }
        if (!instances) {
            fetchInstances()
        }
    }, [getAuthHeader, instances])

    return (
        <div>
            <h1>List of instances</h1>
            <Button icon={<IconAdd24 />} onClick={() => navigate('/new')}>
                New instance
            </Button>
            {JSON.stringify(instances)}
        </div>
    )
}

export default InstancesList
