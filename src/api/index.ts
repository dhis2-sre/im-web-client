import axios from "axios";
import { InstancesGroup } from "../types";

const IM_HOST = "http://localhost:8010/proxy";

const TOKEN = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY3MTIzMDEsImlhdCI6MTY2NjcxMjAwMSwidXNlciI6eyJJRCI6OSwiQ3JlYXRlZEF0IjoiMjAyMi0xMC0yNVQxNTozMTo0MC44MDQxNTJaIiwiVXBkYXRlZEF0IjoiMjAyMi0xMC0yNVQxNTozMTo0MC44MDQxNTJaIiwiRGVsZXRlZEF0IjpudWxsLCJFbWFpbCI6ImhhY2thdGhvbkBkaGlzMi5vcmciLCJHcm91cHMiOlt7Ik5hbWUiOiJ3aG9hbWkiLCJIb3N0bmFtZSI6Indob2FtaS5pbS5kZXYudGVzdC5jLmRoaXMyLm9yZyIsIlVzZXJzIjpudWxsLCJjbHVzdGVyQ29uZmlndXJhdGlvbiI6eyJJRCI6MCwiQ3JlYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJVcGRhdGVkQXQiOiIwMDAxLTAxLTAxVDAwOjAwOjAwWiIsIkRlbGV0ZWRBdCI6bnVsbCwiR3JvdXBOYW1lIjoiIiwiS3ViZXJuZXRlc0NvbmZpZ3VyYXRpb24iOm51bGx9LCJDcmVhdGVkQXQiOiIyMDIyLTA3LTE1VDEzOjEyOjE1LjcyMzUxNVoiLCJVcGRhdGVkQXQiOiIyMDIyLTEwLTI1VDE1OjMyOjAwLjc2MDMyNVoiLCJEZWxldGVkQXQiOm51bGx9XSwiQWRtaW5Hcm91cHMiOltdfX0.VYZ3kvwhE9DRZ4vfNT70jUSxyHP7niGitLXYqdJi28ASwIn8zAqD1zqZSmFHN1LMlJALFW58Qyu1nrlWudyEOylN_0bUj_EsDt6zVfKu0g1oJonQnoDgVPzcabAbDxW_USjjPwF0NUcsm5vtv3F3hz8eHxPHe4Au0iVfHKArK2um9z2KEXwJ2Wj5I6C117EqZYeJ-xXnOQYQXyaHaRAUUAzj8sAHJ-PkP7qu9uHmL980_UC0XSswSobie0b-Wzj60HvlpuKQIDGICImhPOZ5fZkjnlp6Mc_4bqmQkM-TwplHIMgxIbA3_veAHrfJYxcZskqbD8TS71TThEPViTxomQ`;

export const getInstances = () => {
  return axios.get<InstancesGroup>("/instances", {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
};

export const getToken = (username, password) => {
  return axios( {
    method: 'post',
    url: `${IM_HOST}/signIn`,
    headers: {
      Authorization: btoa(`${username}:${password}`),
    },
  });
}
