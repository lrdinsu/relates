import { SignupType } from '@/types/types.ts';

export async function signupUser(data: SignupType) {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  // Check if the response is successful
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Signup request failed');
  }

  // Return the response data as JSON
  return response.json();
}
