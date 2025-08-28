import React, { useState, useContext } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import Card from '../shared/Card';
import InputField from '../shared/InputField';
import ScreenLayout from '../shared/ScreenLayout';

const ResidentRegistrationForm = ({ setView, db, appId, auth }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tower, setTower] = useState('');
  const [apartment, setApartment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const towers = Array.from({ length: 2 }, (_, i) => i + 1);
  const apartments = Array.from({ length: 22 * 8 }, (_, i) => i + 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!auth || !auth.currentUser) {
      setError("Autenticação de usuário não disponível. Tente novamente.");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(db, 'artifacts', appId, 'users', uid);
      await setDoc(userDocRef, {
        profile: {
          name,
          email,
          password,
          role: 'resident',
          tower,
          apartment
        }
      });

      setMessage('Cadastro realizado com sucesso! Aguarde a aprovação da administração.');
      setTimeout(() => setView('login'), 3000);
    } catch (e) {
      console.error("Erro ao registrar morador:", e);
      setError('Erro ao registrar. Tente novamente.');
    }
  };

  return (
    <ScreenLayout>
      <Card title="Cadastro de Morador">
        <form onSubmit={handleRegister}>
          <InputField label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} required />
          <InputField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <InputField label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Torre</label>
            <select
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
            >
              <option value="">Selecione a Torre</option>
              {towers.map(t => <option key={t} value={t}>Torre {t}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Apartamento</label>
            <select
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
            >
              <option value="">Selecione o Apartamento</option>
              {apartments.map(a => <option key={a} value={a}>Apt. {a}</option>)}
            </select>
          </div>
          {message && <p className="text-green-500 text-center mb-4">{message}</p>}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
          >
            Cadastrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => setView('login')} className="text-sm text-blue-500 hover:underline">
            Já tem uma conta? Voltar ao Login
          </button>
        </div>
      </Card>
    </ScreenLayout>
  );
};

export default ResidentRegistrationForm;