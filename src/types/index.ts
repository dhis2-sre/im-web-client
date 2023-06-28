export type Instance = {
    id: number
    createdAt: string
    updatedAt: string
    deletedAt: null
    userId: number
    name: string
    groupName: string
    stackName: string
    ttl: number
    requiredParameters:
        | [
              {
                  name: string
                  value: string
              }
          ]
        | []
    optionalParameters:
        | [
              {
                  name: string
                  value: string
              }
          ]
        | []
    deployLog: string
}

export type InstancesGroup = Array<{
    name: string
    hostname: string
    instances: Array<Instance> | null
}>

export type Lock = {
    databaseId: number
    instanceId: number
    userId: number
}

export type Database = {
    id: number
    createdAt: string
    updatedAt: string
    name: string
    groupName: string
    lock: Lock
}

export type GroupWithDatabases = Array<{
    name: string
    hostname: string
    databases: Array<Database> | null
}>

export type ExternalDownload = {
    databaseId: number
    expiration: number
    uuid: string
}

export type Group = {
    createdAt: string
    hostname: string
    name: string
    updatedAt: string
}
