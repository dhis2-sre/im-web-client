import { AxiosResponse } from 'axios'
import { useEffect, useReducer, useCallback } from 'react'
import { useAuthHeader } from 'react-auth-kit'
import { useNavigate } from 'react-router'
import { clearAuthItemsFromLocalStorage } from '../modules'

function reducer(
    state: {
        /* Will only toggle to true on first request,
         * when no data is available yet */
        isLoading: boolean
        /* Will toggle to true on every request,
         * whenever a request is pending */
        isFetching: boolean
        isCalled: boolean
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
            console.log('init', state)
            return {
                ...state,
                isCalled: true,
                isLoading: !state.data,
                isFetching: true,
            }
        case 'REQUEST_SUCCESS':
            console.log('succes', state)
            return {
                ...state,
                isLoading: false,
                isFetching: false,
                data: action.payload,
                error: undefined,
            }
        case 'REQUEST_ERROR':
            console.log('error', state)
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
    operation: (
        header: string | undefined,
        payload?: any
    ) => Promise<AxiosResponse<T>>,
    payload?: R,
    options: {
        lazy?: boolean
    } = {}
) {
    const [state, dispatch] = useReducer(reducer, {
        isCalled: false,
        isLoading: !options.lazy,
        isFetching: false,
        error: undefined,
        data: undefined,
    })

    const getAuthHeader = useAuthHeader()
    const navigate = useNavigate()

    const token = getAuthHeader()

    const performOperation = useCallback(() => {
        const localPerformOperation = async () => {
            dispatch({ type: 'REQUEST_INIT' })

            try {
                const apiResult = await operation(token, payload)
                dispatch({ type: 'REQUEST_SUCCESS', payload: apiResult.data })
            } catch (error) {
                const isTokenInvalidError =
                    error?.response?.data === 'token not valid' &&
                    error?.response?.status === 401

                if (isTokenInvalidError) {
                    clearAuthItemsFromLocalStorage()
                    navigate('/login')
                } else {
                    dispatch({ type: 'REQUEST_ERROR', payload: error })
                }
            }
        }
        localPerformOperation()
    }, [navigate, operation, payload, token])

    useEffect(() => {
        if (!state.isCalled && !options.lazy) {
            performOperation()
        }
    }, [state.isCalled, performOperation, options.lazy])

    return {
        ...state,
        refetch: performOperation,
    }
}
