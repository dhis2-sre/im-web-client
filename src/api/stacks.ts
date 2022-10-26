import axios from "axios";
import { Stacks, Stack } from "../types/stack";
import {IM_HOST, getTokenFromLocalStorage} from "./index";

export const getStacks = () => {
  return axios.get<Stacks>("/stacks", {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });
};

export const getStack = (name) => {
  return axios.get<Stack>("/stacks/" + name, {
    baseURL: IM_HOST,
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });
};
