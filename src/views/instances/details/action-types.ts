export type OnActionCompletFn = (shouldRefetch?: boolean) => void

export type AsyncActionProps = {
    deploymentId?: number
    instanceId: number
    stackName: string
    onStart: () => void
    onComplete: OnActionCompletFn
}
