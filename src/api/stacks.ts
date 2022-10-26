import axios from "axios";
import { Stacks, Stack } from "../types/stack";

export const IM_HOST = "https://api.im.prod.test.c.dhis2.org";

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY3NTkxMjcsImlhdCI6MTY2Njc1NjEyNywidXNlciI6eyJJRCI6NCwiQ3JlYXRlZEF0IjoiMjAyMi0wOC0yOFQxMjo0MzozOS4zOTIxNjJaIiwiVXBkYXRlZEF0IjoiMjAyMi0wOC0yOFQxMjo0MzozOS4zOTIxNjJaIiwiRGVsZXRlZEF0IjpudWxsLCJFbWFpbCI6ImFuZHJlYXNAc29tZXRoaW5nLm9yZyIsIkdyb3VwcyI6W3siTmFtZSI6Indob2FtaSIsIkhvc3RuYW1lIjoid2hvYW1pLmltLnByb2QudGVzdC5jLmRoaXMyLm9yZyIsIlVzZXJzIjpudWxsLCJjbHVzdGVyQ29uZmlndXJhdGlvbiI6eyJJRCI6MCwiQ3JlYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJVcGRhdGVkQXQiOiIwMDAxLTAxLTAxVDAwOjAwOjAwWiIsIkRlbGV0ZWRBdCI6bnVsbCwiR3JvdXBOYW1lIjoiIiwiS3ViZXJuZXRlc0NvbmZpZ3VyYXRpb24iOm51bGx9LCJDcmVhdGVkQXQiOiIyMDIyLTA2LTE3VDEzOjQyOjIwLjIyNjE2MVoiLCJVcGRhdGVkQXQiOiIyMDIyLTEwLTIxVDEwOjI2OjI0Ljc4MTc5OVoiLCJEZWxldGVkQXQiOm51bGx9LHsiTmFtZSI6InBsYXkiLCJIb3N0bmFtZSI6InBsYXkuaW0ub3MuYy5kaGlzMi5vcmciLCJVc2VycyI6bnVsbCwiY2x1c3RlckNvbmZpZ3VyYXRpb24iOnsiSUQiOjAsIkNyZWF0ZWRBdCI6IjAwMDEtMDEtMDFUMDA6MDA6MDBaIiwiVXBkYXRlZEF0IjoiMDAwMS0wMS0wMVQwMDowMDowMFoiLCJEZWxldGVkQXQiOm51bGwsIkdyb3VwTmFtZSI6IiIsIkt1YmVybmV0ZXNDb25maWd1cmF0aW9uIjpudWxsfSwiQ3JlYXRlZEF0IjoiMjAyMi0wNi0xN1QxMzo0MjoyMC4yMjk1MjVaIiwiVXBkYXRlZEF0IjoiMjAyMi0wOC0zMFQwODoxOTo0Mi44NDc2MjNaIiwiRGVsZXRlZEF0IjpudWxsfV0sIkFkbWluR3JvdXBzIjpbXX19.Z3ZpyMtvDzXl9K2kz50afkDFKt-6ccH1HWoaR6rqu8sgVlcZbkykrCCUhfZOj4zcPVwhyd-YmxyZhGOrv0FziXm2_h0g9qJnx_GP7hUVeLtylz-Me0CL4N0RYVL_C7xagC5HFl6tT07iNYfhuuO9zd80BNp2m_k6Q548AdL1Y8yZLt50HCsfGJHjOp7s4o9AIAc7UojAXDzQyAB8TZGDqfSnkF9UqrfwU2tG3IgIf34HoFz2x2iEuY1vrHdF1N1jVHK77cbMG1PNb55rCeeQFij4JWEM77NELuyd1SHvbFNJVgUzHSvDno5L6XzQkihmOYvpWThbZjo_RauTVWgVWg";

export const getStacks = () => {
  return axios.get<Stacks>("/stacks", {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
};

export const getStack = (name) => {
  return axios.get<Stack>("/stacks/" + name, {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
};
