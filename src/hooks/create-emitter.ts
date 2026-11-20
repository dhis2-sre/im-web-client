/* Hands every event to its subscribers the moment it arrives. Events kept in React state instead
 * collapse into the last one when several land before the next render. */
export const createEmitter = <T>() => {
    const listeners = new Set<(event: T) => void>()
    return {
        emit: (event: T) => listeners.forEach((listener) => listener(event)),
        // Returns the unsubscribe, so an effect can return it as its cleanup.
        subscribe: (listener: (event: T) => void) => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
    }
}
