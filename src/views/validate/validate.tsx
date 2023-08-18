import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'
import { baseURL } from '../../hooks/use-auth-axios'

export const Validate = () => {
    const { token } = useParams()
    //    const [{ response, loading, error }] = useAuthAxios<AxiosResponse<any, any>>(`/users/validate/${token}`, { manual: true })
    const axiosInstance = axios.create({ baseURL })
    axiosInstance.get(`/users/validate/${token}`).then((r) => setValidated(r.status === 200))
    const [validated, setValidated] = useState<boolean>(false)
    /*
    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Could not validate">
                {error.message}
            </NoticeBox>
        )
    }
*/

    return (
        <div>
            <h3>hello</h3>
            <h3>hello {validated}</h3>
        </div>
    )
}
