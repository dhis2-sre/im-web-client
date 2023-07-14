import jwtDecode, { JwtPayload } from 'jwt-decode'
import { getAccessToken } from 'axios-jwt'
import { User } from '../types'

// TODO: This is not a hook
interface JwtPayloadWithUser extends JwtPayload {
    user: User
}

export const getCurrentUser = (): SuperUser => {
    const token = getAccessToken()
    if (token) {
        const decoded = jwtDecode<JwtPayloadWithUser>(token)
        return new SuperUser(decoded.user)
    }
// TODO: null or {}?
    return null
}

// TODO: Is there a better way to add methods to the User type?
class SuperUser {
    private user : User
    constructor(user : User) {
        this.user = user
    }

    public isAdmin(): boolean {
        return this.user.groups.some(group => group.name === "administrators")
    }
}
