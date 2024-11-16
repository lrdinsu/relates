import axios from 'axios';
import { LoginType } from 'validation';

import { SignupType } from '@/types/types.ts';

axios.defaults.withCredentials = true;

export type ApiResponse = {
  message: string;
};

export async function signupUser(data: SignupType) {
  const response = await axios.post('/api/signup', data);
  return response.data as ApiResponse;
}

export async function loginUser(data: LoginType) {
  const response = await axios.post('/api/login', data);
  return response.data as ApiResponse;
}
