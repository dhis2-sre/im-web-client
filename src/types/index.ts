export type Instance = {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    DeletedAt: null
    UserID: number
    Name: string
    GroupName: string
    StackName: string
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
    DeployLog: string
}

export type InstancesGroup = Array<{
    Name: string
    Hostname: string
    Instances: Array<Instance> | null
}>

export type Lock = {
    DatabaseID: number,
    InstanceID: number,
    UserID: number
}

export type Database = {
    ID: number
    CreatedAt: string
    UpdatedAt: string
    Name: string
    GroupName: string
    Lock: Lock
}

export type GroupWithDatabases = Array<{
    Name: string
    Hostname: string
    Databases: Array<Database> | null
}>
