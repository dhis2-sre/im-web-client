export type OptionalParameters = {
    Consumed: boolean
    Name: string
    StackName: string
    DefaultValue: string
}

export type RequiredParameters = {
    Consumed: boolean
    Name: string
    StackName: string
}

export type Stack = {
    CreatedAt: string
    DeletedAt: string
    HostnamePattern: string
    HostnameVariable: string
    UpdatedAt: string
    instances: null
    name: string
    optionalParameters: Array<OptionalParameters> | []
    requiredParameters: Array<RequiredParameters> | []
}

export type Stacks = Array<Stack> | null
