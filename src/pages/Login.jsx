import { useAuth } from "./contexts/AuthContext";

export function Login() {
  const { login, signup } = useAuth();

  return <div>Login</div>;
}
