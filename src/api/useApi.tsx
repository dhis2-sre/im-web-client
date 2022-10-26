import { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { useAuthHeader } from 'react-auth-kit'

export function useApi<T = any, R = any>(
    operation: (
        header: string | undefined,
        payload?: any
    ) => Promise<AxiosResponse<T>>,
    payload?: R
) {
    const [isLoading, setLoading] = useState<boolean>(true)
    const [result, setResult] = useState<T>()
    const getAuthHeader = useAuthHeader()

    const token = getAuthHeader()

    useEffect(() => {
        const performOperation = async () => {
            const apiResult = await operation(token, payload)
            setResult(apiResult.data)
            setLoading(false)
        }
        setLoading(true)
        performOperation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        isLoading,
        result,
    }
}
