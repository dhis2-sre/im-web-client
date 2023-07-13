import axios, { AxiosRequestConfig } from 'axios'
import { Options, UseAxiosResult, makeUseAxios } from 'axios-hooks'
import {
    IAuthTokens,
    TokenRefreshRequest,
    applyAuthTokenInterceptor,
    clearAuthTokens,
    getBrowserLocalStorage,
} from 'axios-jwt'
import { useCallback } from 'react'

export const baseURL = process.env.REACT_APP_API_URL
/* Better make sure this is a unque string because the event
 * is going to be sent via the global window object */
export const UNAUTHORIZED_EVENT = 'UNAUTHORIZED_EVENT_INSTANCE_MANAGER'

if (!baseURL) {
    throw new Error('No baseURL found. Ensure there is an environment variable called `REACT_APP_API_URL` present')
}

// Create an axios instance and we set the baseURL
const axiosInstance = axios.create({ baseURL })

const dispatchUnauthorizedEvent = () => {
    const event = new CustomEvent(UNAUTHORIZED_EVENT, { detail: window.location.pathname })
    window.dispatchEvent(event)
}

type TokenRefreshResponse = {
    data: IAuthTokens
}

const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<IAuthTokens | string> =>
    /* We have to use the default axios instance here
     * otherwise we get an infitine loop */
    axios
        .post(`${baseURL}/refresh`, {
            refreshToken,
        })
        .then(
            (response: TokenRefreshResponse): IAuthTokens => ({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            })
        )
        .catch((error) => {
            if (error.response.status === 401) {
                clearAuthTokens()
                dispatchUnauthorizedEvent()
            }
            return Promise.reject(error)
        })

const getStorage = getBrowserLocalStorage

/* Enhance the created axios instance with JWT interceptors
 * which allow us to do authenticated requests, refresh the
 * token, etc */
applyAuthTokenInterceptor(axiosInstance, {
    requestRefresh,
    getStorage,
})

/* Produce a custom version of the `useAxios` hook
 * which uses the axios instance we've just created */
const useAxiosWithJwt = makeUseAxios({
    axios: axiosInstance,
    defaultOptions: {
        ssr: false,
    },
})

interface UseAuthAxiosOptions extends Options {
    autoCatch?: boolean
}

interface UseAuthAxios {
    <TResponse = any, TBody = any, TError = any>(
        config: AxiosRequestConfig<TBody> | string,
        options?: UseAuthAxiosOptions
    ): UseAxiosResult<TResponse, TBody, TError>
}

const useAuthAxios: UseAuthAxios = (urlOrConfigObject, { autoCatch = true, ...options } = {}) => {
    const useAxiosResult: UseAxiosResult = useAxiosWithJwt(urlOrConfigObject, options)
    const [, execute] = useAxiosResult

    /* The default behaviour for useAxios is to let consumers deal
     * with promise rejection manually, but we prefer it to be handled
     * here. In cases where it is more ergonomic to have a try/catch
     * block in the component itself, this default behaviour can be
     * achieved by passing `autoCatch: false` in the options parameter. */
    const executeWithAutoCatch = useCallback(
        async (...args) => {
            try {
                return await execute(...args)
            } catch (error) {
                /* Only show the error on the browser console, but ensure
                 * the app does not crash. Assume the consumer will use
                 * the returned error object to display an error UI.  */
                console.error(error)
            }
        },
        [execute]
    )

    if (autoCatch) {
        useAxiosResult[1] = executeWithAutoCatch
    }
    return useAxiosResult
}

export { useAuthAxios }
