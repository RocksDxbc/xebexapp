import React, { useState, useContext } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/shared/Card';
import InputField from '../components/shared/InputField';
import ScreenLayout from '../components/shared/ScreenLayout';

const Login = ({ setView, db, appId, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Usuário não autenticado. Tente novamente.');
      return;
    }

    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
    try {
      const userProfileSnap = await getDoc(userDocRef);
      if (!userProfileSnap.exists()) {
        setError("Perfil de usuário não encontrado. Por favor, cadastre-se primeiro.");
        return;
      }
      const userProfile = userProfileSnap.data().profile;

      if (userProfile.email !== email || userProfile.password !== password) {
        setError('E-mail ou senha inválidos.');
        return;
      }

      setUser(prevUser => ({
        ...prevUser,
        profile: userProfile
      }));

      if (userProfile.role === 'resident') {
        setView('resident-dashboard');
      } else if (userProfile.role === 'admin' || userProfile.role === 'staff') {
        setView('admin-dashboard');
      }
    } catch (e) {
      console.error("Erro ao fazer login:", e);
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  todo: 'ADICIONAR A VERIFICAÇÃO DE EMAIL SE O EMAIL ESTIVER CADASTRADO NO FIREBASE AUTHENTICATION';

  if (user && user.profile) {
    if (user.profile.role === 'resident') {
      setView('resident-dashboard');
    } else if (user.profile.role === 'admin' || user.profile.role === 'staff') {
      setView('admin-dashboard');
    }
    return null; // Evita renderizar o formulário de login enquanto redireciona
  } 

  // Se o usuário já estiver autenticado, redireciona para o dashboard apropriado
  return (
    <ScreenLayout>
      <Card title="Acessa ai seu Legumes">
        <form onSubmit={handleLogin}>
          <InputField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
          <InputField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-green-500 transition"
          >
            Entrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setView('resident-registration')}
            className="text-sm text-pink-400 hover:underline"
          >
            Não tem uma conta? Cadastre-se
          </button>
        </div>
      </Card>
    </ScreenLayout>
  );
};

export default Login;
