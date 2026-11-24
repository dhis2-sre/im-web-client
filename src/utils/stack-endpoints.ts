import type { Group, StackEndpoint, StackWithParameterGroups } from '../types/index.ts'

export const ownEndpoint = (stack: StackWithParameterGroups | undefined) => stack?.endpoints?.find((endpoint) => !endpoint.when)

export const endpointUrl = (group: Group, name: string, endpoint?: StackEndpoint) => `https://${group.hostname}/${name}${endpoint?.pathSuffix ?? ''}`
