export type Group = {
    createdAt: string,
    hostname: string,
    name: string,
    updatedAt: string,
}

export type User = {
    adminGroups: Array<Group>,
    createdAt: string,
    email: string,
    groups: Array<Group>,
    id: number,
    updatedAt: string
}
