import { AxiosResponse } from 'axios'
import { useEffect, useReducer, useCallback, useRef } from 'react'
import { useAuthHeader } from 'react-auth-kit'
import { useLocation, useNavigate } from 'react-router-dom'
import { clearAuthItemsFromLocalStorage } from '../modules'

function reducer(
    state: {
        /* Will only toggle to true on first request,
         * when no data is available yet */
        isLoading: boolean
        /* Will toggle to true on every request,
         * whenever a request is pending */
        isFetching: boolean
        data: any
        error: Error
    },
    action: {
        type: 'REQUEST_INIT' | 'REQUEST_SUCCESS' | 'REQUEST_ERROR'
        payload?: any
    }
) {
    switch (action.type) {
        case 'REQUEST_INIT':
            return {
                ...state,
                isLoading: !state.data,
                isFetching: true,
            }
        case 'REQUEST_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isFetching: false,
                data: action.payload,
                error: undefined,
            }
        case 'REQUEST_ERROR':
            return {
                ...state,
                isLoading: false,
                isFetching: false,
                error: action.payload,
            }
        default:
            return state
    }
}

export function useApi<T = any, R = any>(
    operation: (header: string | undefined, payload?: any) => Promise<AxiosResponse<T>>,
    payload?: R,
    options?: {
        lazy?: boolean
    }
) {
    const isCalledRef = useRef(false)
    const [state, dispatch] = useReducer(reducer, {
        isLoading: !options?.lazy,
        isFetching: false,
        error: undefined,
        data: undefined,
    })

    const getAuthHeader = useAuthHeader()
    const navigate = useNavigate()
    const location = useLocation()

    const performOperation = useCallback(async () => {
        dispatch({ type: 'REQUEST_INIT' })

        try {
            const apiResult = await operation(getAuthHeader(), payload)
            dispatch({ type: 'REQUEST_SUCCESS', payload: apiResult.data })
        } catch (error) {
            if (error?.response?.status === 401) {
                clearAuthItemsFromLocalStorage()
                navigate('/login', {
                    state: { redirectPath: location.pathname },
                })
            } else {
                dispatch({ type: 'REQUEST_ERROR', payload: error })
            }
        }
    }, [navigate, operation, payload, getAuthHeader, location.pathname])

    useEffect(() => {
        if (!isCalledRef.current && !options?.lazy) {
            // Ugly hack to prevent multiple requests during mount
            isCalledRef.current = true
            performOperation()
        }
    }, [performOperation, options?.lazy])

    return {
        ...state,
        refetch: performOperation,
        isCalled: isCalledRef.current,
    }
}
