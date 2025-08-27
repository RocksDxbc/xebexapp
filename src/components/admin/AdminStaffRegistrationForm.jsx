import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../shared/Navbar';
import ScreenLayout from '../shared/ScreenLayout';
import Card from '../shared/Card';
import InputField from '../shared/InputField';

// Formulário de Cadastro de Funcionário (para o Admin)
const AdminStaffRegistrationForm = ({ setView, db, appId }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const roles = ['Porteiro', 'Recepcionista', 'Ronda Diurno', 'Ronda Noturno', 'Zelador', 'Admin'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const newUid = `staff-${Math.random().toString(36).substring(2, 15)}`;

    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', newUid);
      await setDoc(userDocRef, {
        profile: {
          name,
          role: role.toLowerCase(),
          email,
          password,
        }
      });
      setMessage('Funcionário cadastrado com sucesso!');
      setName('');
      setRole('');
      setEmail('');
      setPassword('');
    } catch (e) {
      console.error("Erro ao registrar funcionário:", e);
      setError('Erro ao registrar funcionário. Tente novamente.');
    }
  };

  return (
    <>
      <Navbar title="Cadastrar Funcionário" setView={setView} />
      <ScreenLayout>
        <Card title="Cadastrar Funcionário">
          <form onSubmit={handleRegister}>
            <InputField label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Cargo</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione o Cargo</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <InputField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField label="Senha Temporária" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            
            {message && <p className="text-green-500 text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
            >
              Cadastrar
            </button>
            <button
              onClick={() => setView('admin-dashboard')}
              className="w-full mt-2 bg-gray-500 text-white py-2 rounded-md font-semibold hover:bg-gray-600 transition"
            >
              Voltar
            </button>
          </form>
        </Card>
      </ScreenLayout>
    </>
  );
};

export default AdminStaffRegistrationForm;