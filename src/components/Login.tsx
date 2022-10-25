import { useSignIn } from 'react-auth-kit'
import { InputField, Button } from '@dhis2/ui'
import styles from './LoginPage.module.css'
import { useCallback, useState } from 'react';
import {getToken as getTokeAsync} from '../api'

const LoginPage = () => {
  const signIn = useSignIn()
  const [username, setUsername] = useState('hackathon@dhis2.org')
  const [password, setPassword] = useState('dhis2-hackathon-dhis2')
  const [token, setToken] = useState('')

  const getToken = useCallback(() => {
    const fetchToken = async () => {
      const result = await getTokeAsync(username, password);
      setToken(result.data);
    };
    fetchToken();
  },[username,password])

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <InputField
          name="username"
          label="username"
          value={username}
          onChange={({value}) => {
            setUsername(value)
          }}
        />
        <InputField
          type="password"
          name="password"
          label="password"
          value={password}
          onChange={({value}) => {
            setPassword(value)
          }}
        />
        <br/>
        <Button primary onClick={getToken}>Login</Button>
      </div>
    </div>
  );
};

export default LoginPage;
