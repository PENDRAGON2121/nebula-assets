import { LoginForm } from '@/components/forms/LoginForm';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkHasUsers } from '../actions';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const hasUsers = await checkHasUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasUsers ? "Login" : "Configuración Inicial"}</CardTitle>
        <CardDescription>
          {hasUsers 
            ? "Enter your credentials to access the dashboard." 
            : "Bienvenido. Crea el primer usuario Administrador para comenzar."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasUsers ? <LoginForm /> : <RegisterForm />}
      </CardContent>
    </Card>
  );
}
