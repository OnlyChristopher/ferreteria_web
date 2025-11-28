import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Wrench, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Error al iniciar sesión: ' + error.message);
        return;
      }

      if (data.session && data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || 'Usuario',
          role: data.user.user_metadata?.role || 'user',
          accessToken: data.session.access_token,
        };
        
        toast.success(`¡Bienvenido ${user.name}!`);
        onLogin(user);
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2eb8085d/signup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
            role: 'user', // Por defecto todos los nuevos usuarios son "user"
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Cuenta creada exitosamente. Por favor inicia sesión.');
        setIsLogin(true);
        setPassword('');
      } else {
        toast.error(data.error || 'Error al crear la cuenta');
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="bg-black p-4 rounded-full">
              <Wrench className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div>
            <CardTitle className="text-black">Ferretería Total</CardTitle>
            <CardDescription>
              {isLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                'Procesando...'
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrarse
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setName('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
              disabled={loading}
            >
              {isLogin
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-700 mb-2">
              <strong>Cuentas de Prueba:</strong>
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Admin:</strong> admin@ferreteria.com / admin123</p>
              <p><strong>Usuario:</strong> usuario@ferreteria.com / user123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
