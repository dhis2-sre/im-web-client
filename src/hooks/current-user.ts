import jwtDecode, {JwtPayload} from 'jwt-decode'
import {getAccessToken} from 'axios-jwt'
import {User} from '../types'
import {createContext} from 'react'

// TODO: This is not a hook
interface JwtPayloadWithUser extends JwtPayload {
    user: User
}

export const getCurrentUser = (): CurrentUser => {
    const token = getAccessToken()
    if (token) {
        const decoded = jwtDecode<JwtPayloadWithUser>(token)
        return new CurrentUser(decoded.user)
    }
    // TODO: null or {}?
    return null
}

class CurrentUser {
    private user: User

    constructor(user: User) {
        this.user = user
    }

    public isAdministrator(): boolean {
        return this.user.groups.some((group) => group.name === 'administrators')
    }
}

interface currentUserContext {
    currentUser: CurrentUser
}

export const CurrentUserContext = createContext<currentUserContext>({
    currentUser: null,
})
