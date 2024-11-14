import { ForgotPassword } from '@/features/auth/ForgetPassword/ForgotPassword.tsx';
import { Login } from '@/features/auth/Login/Login.tsx';
import { Signup } from '@/features/auth/Signup/Signup.tsx';
import { useAuthStore } from '@/stores/authStore.ts';

function AuthPage() {
  const { currentView } = useAuthStore();

  return (
    <>
      {currentView === 'login' && <Login />}
      {currentView === 'signup' && <Signup />}
      {currentView === 'forgotpassword' && <ForgotPassword />}
    </>
  );
}

export default AuthPage;
