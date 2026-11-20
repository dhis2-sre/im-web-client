/* What went wrong, for a dialog to show: im-manager answers a refusal with the reason as a plain
 * string body (some endpoints wrap it as { message }), and anything else falls back to the request's
 * own message. */
export const errorMessage = (error: unknown) => {
    const data = (error as { response?: { data?: unknown } } | undefined)?.response?.data
    if (typeof data === 'string' && data.trim() !== '') {
        return data
    }
    const message = (data as { message?: unknown } | undefined)?.message
    if (typeof message === 'string' && message.trim() !== '') {
        return message
    }
    return error instanceof Error ? error.message : String(error)
}
