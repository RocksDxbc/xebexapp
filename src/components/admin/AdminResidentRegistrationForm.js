import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../common/Navbar';
// Formulário de Cadastro de Morador (para o Admin)
const AdminResidentRegistrationForm = ({ setView, db, appId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

    const newUid = `user-${Math.random().toString(36).substring(2, 15)}`;

    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', newUid);
      await setDoc(userDocRef, {
        profile: {
          name,
          email,
          role: 'resident',
          tower,
          apartment,
          isApproved: true,
          password: 'password_default'
        }
      });
      setMessage('Morador cadastrado com sucesso!');
      setName('');
      setEmail('');
      setTower('');
      setApartment('');
    } catch (e) {
      console.error("Erro ao registrar morador:", e);
      setError('Erro ao registrar morador. Tente novamente.');
    }
  };

  return (
    <>
      <Navbar title="Cadastrar Morador" setView={setView} />
      <ScreenLayout>
        <Card title="Cadastrar Morador">
          <form onSubmit={handleRegister}>
            <InputField label="Nome Completo" value={name} onChange={(e) => setName(e.target.value)} required />
            <InputField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Torre</label>
              <select
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
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
                className="w-full px-3 py-2 border rounded-md"
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

export default AdminResidentRegistrationForm;