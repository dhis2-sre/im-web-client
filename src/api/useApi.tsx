import { AxiosResponse } from 'axios'
import { useEffect, useState, useCallback } from 'react'
import { useAuthHeader } from 'react-auth-kit'
import { useNavigate } from 'react-router'

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
    const navigate = useNavigate()

    const token = getAuthHeader()

    const performOperation = useCallback(() => {
        const localPerformOperation = async () => {
            setLoading(true)
            try {
                const apiResult = await operation(token, payload)
                setResult(apiResult.data)
            } catch (err) {
                console.warn(err)
                // fixme: we're getting a CORS error when the token expires rather than a 401 so this is a temporary way (that is not very correct) to detect it
                const isCorsError = err?.code === 'ERR_NETWORK'
                const status = err?.response?.status
                const isAuthError = status > 400 && status < 500
                if (isCorsError || isAuthError) {
                    navigate('/login')
                }
            } finally {
                setLoading(false)
            }
        }
        localPerformOperation()
    }, [navigate, operation, payload, token])

    useEffect(() => {
        setLoading(true)
        performOperation()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        isLoading,
        result,
        refetch: performOperation,
    }
}
