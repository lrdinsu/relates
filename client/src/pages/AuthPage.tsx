import { useLocation, useNavigate } from 'react-router-dom';

import { ForgotPassword } from '@/features/auth/ForgetPassword/ForgotPassword.tsx';
import { Login } from '@/features/auth/Login/Login.tsx';
import { Signup } from '@/features/auth/Signup/Signup.tsx';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Render the appropriate component and pass down the navigate function
  if (pathname === '/login') {
    return (
      <Login
        onSwitchPage={() => navigate('/signup')}
        onForgotPassword={() => navigate('/forgotpassword')}
      />
    );
  }

  if (pathname === '/signup') {
    return <Signup onSwitchPage={() => navigate('/login')} />;
  }

  if (pathname === '/forgotpassword') {
    return <ForgotPassword onBackToLogin={() => navigate('/login')} />;
  }
}

export default AuthPage;
