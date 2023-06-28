import jwtDecode from 'jwt-decode'

type Token = {
    exp: number
    iat: number
    user?: any
}
interface ParsedToken extends Token {
    expiryDurationInMinutes: number
}

export const parseToken = (token: string): ParsedToken => {
    const decodedToken: Token = jwtDecode(token)

    return {
        ...decodedToken,
        expiryDurationInMinutes: Math.floor((decodedToken.exp - decodedToken.iat) / 60),
    }
}
