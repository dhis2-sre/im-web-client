import axios, { AxiosRequestConfig } from 'axios'
import { Options, UseAxiosResult, makeUseAxios } from 'axios-hooks'
import { IAuthTokens, TokenRefreshRequest, applyAuthTokenInterceptor, clearAuthTokens, getBrowserLocalStorage } from 'axios-jwt'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export const baseURL = process.env.REACT_APP_IM_API

// Create an axios instance and we set the baseURL
const axiosInstance = axios.create({ baseURL })

const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<IAuthTokens | string> =>
    /* We have to use the default axios instance here
     * otherwise we get an infitine loop */
    axios
        .post(`${baseURL}/refresh`, {
            refreshToken,
        })
        .then((response) => ({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
        }))
        .catch((error) => {
            clearAuthTokens()
            return error
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

const PUBLIC_PATHS = new Set(['/login', '/sign-up'])

interface UseAuthAxios {
    <TResponse = any, TBody = any, TError = any>(config: AxiosRequestConfig<TBody> | string, options?: Options): UseAxiosResult<TResponse, TBody, TError>
}

/* Add some redirect logic to the custom hooks so that users
 * are redirected to the login page once the refresh token
 * has expired */
const useAuthAxios: UseAuthAxios = (urlOrConfigObject, options) => {
    const navigate = useNavigate()
    // Just pass all arguments from the main function to this sub function
    const useAxiosResult: UseAxiosResult = useAxiosWithJwt(urlOrConfigObject, options)
    const prevUseAxiosResult = useRef<UseAxiosResult>(useAxiosResult)
    const [{ error }] = useAxiosResult
    const isAuthenticationError = error?.response?.status === 401
    const isAtPublicPath = PUBLIC_PATHS.has(window.location.pathname)

    if (isAuthenticationError && !isAtPublicPath) {
        /* Note: setting the `referrerPath` in the
         * `requestAnimationFrame callback can cause the value
         * value to be `/login`. So we set it here instead. */
        const referrerPath = window.location.pathname
        /* Wait for the component render cycle to finish before
         * navigation, which will trigger a re-render in the
         * route provider. Not waiting for an animation frame
         * will cause React to throw an error about simultanious
         * state updates. */
        window.requestAnimationFrame(() => {
            navigate('/login', { state: { referrerPath } })
        })
        /* Since the request failed, `useAxiosResult` will contain an
         * and error state. But we do not want to handle becomming
         * unauthenticated as error in the component, since a redirect
         * to the login form will cause the component that required the
         * authentication to become unmounted anyway. Returning the
         * previous state prevents components from briefly transitioning
         * into error state before navigation happens. */
        return prevUseAxiosResult.current
    } else {
        prevUseAxiosResult.current = useAxiosResult
        return useAxiosResult
    }
}

export { useAuthAxios }
