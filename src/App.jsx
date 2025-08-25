/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Atualize o <code>src/App.jsx</code> e salve para testar hot reloading
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <br></br>
      <p className="text-3xl font-bold underline">
        Silêncio, Rodrigo está no processo CRIATIVO, observe a MÁGIA!
  </p>
    </>
  )
}

export default App
*/

import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, addDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import {
  User,
  Package,
  Home,
  LogOut,
  Plus,
  Building,
  Box,
  Key,
  Trash,
  Check,
  X,
  UserPlus
} from 'lucide-react';

// Use as variáveis globais do Firebase fornecidas pelo ambiente
/*const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyB6asR4j3emEGaNJgaWsYjydLA6LBNQpLs",
  authDomain: "appcorrespondenciabd.firebaseapp.com",
  projectId: "appcorrespondenciabd",
  storageBucket: "appcorrespondenciabd.firebasestorage.app",
  messagingSenderId: "456234240689",
  appId: "1:456234240689:web:9fee39e22b6fe40f13f090"
};
*/
const firebaseConfig = {
  apiKey: "AIzaSyB6asR4j3emEGaNJgaWsYjydLA6LBNQpLs",
  authDomain: "appcorrespondenciabd.firebaseapp.com",
  projectId: "appcorrespondenciabd",
  storageBucket: "appcorrespondenciabd.firebasestorage.app",
  messagingSenderId: "456234240689",
  appId: "1:456234240689:web:9fee39e22b6fe40f13f090"
};

// Initialize Firebase
//const appId = initializeApp(firebaseConfig);

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Contexto para gerenciamento do usuário e autenticação
const AuthContext = createContext(null);

// Componente para a barra de navegação superior
const Navbar = ({ title, setView }) => {
  const { user, handleLogout } = useContext(AuthContext);
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center fixed top-0 left-0 w-full z-10">
      <div className="flex items-center">
        <Home className="text-blue-500 mr-2" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {user?.profile?.role === 'resident' && (
          <button onClick={() => setView('resident-dashboard')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <User />
          </button>
        )}
        {(user?.profile?.role === 'admin' || user?.profile?.role === 'staff') && (
          <button onClick={() => setView('admin-dashboard')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Key />
          </button>
        )}
        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-700 transition">
          <LogOut />
        </button>
      </div>
    </nav>
  );
};

// Componente para formulários
const Card = ({ children, title }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
    <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
    {children}
  </div>
);

// Componente para campos de formulário
const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
    />
  </div>
);

// Componente para o layout da tela
const ScreenLayout = ({ children }) => (
  <div className="flex-1 flex flex-col justify-center items-center py-20 px-4">
    {children}
  </div>
);

// Tela de Login
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

  return (
    <ScreenLayout>
      <Card title="Login">
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
            className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
          >
            Entrar
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setView('resident-registration')}
            className="text-sm text-blue-500 hover:underline"
          >
            Não tem uma conta? Cadastre-se
          </button>
        </div>
      </Card>
    </ScreenLayout>
  );
};

// Formulário de Cadastro de Morador
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

// Painel do Administrador/Colaborador
const AdminDashboard = ({ setView, user, residents }) => {
  return (
    <>
      <Navbar title="Área do Admin" setView={setView} />
      <ScreenLayout>
        <div className="w-full max-w-4xl p-6 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Bem-vindo, {user?.profile?.name || 'Admin'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => setView('admin-package-registration')}
              className="flex flex-col items-center justify-center p-6 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
            >
              <Box className="w-12 h-12 mb-2" />
              <span className="font-semibold text-lg">Registrar Encomenda</span>
            </button>
            <button
              onClick={() => setView('admin-resident-registration')}
              className="flex flex-col items-center justify-center p-6 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition transform hover:scale-105"
            >
              <UserPlus className="w-12 h-12 mb-2" />
              <span className="font-semibold text-lg">Cadastrar Morador</span>
            </button>
            <button
              onClick={() => setView('admin-staff-registration')}
              className="flex flex-col items-center justify-center p-6 bg-purple-500 text-white rounded-lg shadow-lg hover:bg-purple-600 transition transform hover:scale-105"
            >
              <User className="w-12 h-12 mb-2" />
              <span className="font-semibold text-lg">Cadastrar Funcionário</span>
            </button>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Lista de Moradores</h3>
            <div className="overflow-x-auto bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Torre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Apt.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">UID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {residents.length > 0 ? (
                    residents.map((resident) => (
                      <tr key={resident.id} className="hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                        <td className="px-6 py-4 whitespace-nowrap">{resident.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Torre {resident.tower}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Apt. {resident.apartment}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono break-all">{resident.id}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Nenhum morador cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ScreenLayout>
    </>
  );
};

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

// Formulário de Cadastro de Encomenda (para o Admin)
const AdminPackageRegistrationForm = ({ setView, db, appId, residents }) => {
  const [residentId, setResidentId] = useState('');
  const [itemType, setItemType] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!residentId || !itemType) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const packagesCollectionRef = collection(db, `artifacts/${appId}/packages`);
      await addDoc(packagesCollectionRef, {
        residentId,
        itemType,
        date: new Date().toISOString(),
        imageUrl: imagePreview || null,
        status: 'received',
      });
      setMessage('Encomenda registrada com sucesso! Notificação enviada ao morador.');
      
      setResidentId('');
      setItemType('');
      setImage(null);
      setImagePreview(null);
    } catch (e) {
      console.error("Erro ao registrar encomenda:", e);
      setError('Erro ao registrar encomenda. Tente novamente.');
    }
  };

  return (
    <>
      <Navbar title="Registrar Encomenda" setView={setView} />
      <ScreenLayout>
        <Card title="Registrar Encomenda">
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Morador</label>
              <select
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione o Morador</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - Apt. {r.apartment}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              label="Tipo de Item"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              placeholder="Ex: Carta, Caixa pequena, etc."
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagem do Item</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <div className="mt-2 text-center">
                  <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-md shadow-md" />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pré-visualização da imagem</p>
                </div>
              )}
            </div>
            
            {message && <p className="text-green-500 text-center mb-4">{message}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
            >
              Registrar
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

// Painel do Morador
const ResidentDashboard = ({ setView, user, db, appId }) => {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (db && user?.profile?.role === 'resident') {
      const packagesCollectionRef = collection(db, `artifacts/${appId}/packages`);
      const q = query(packagesCollectionRef, where("residentId", "==", user.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const packagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
        setPackages(packagesList);
        
        const newPackages = packagesList.filter(p => p.status === 'received' && (new Date() - new Date(p.date)) < 10000);
        if (newPackages.length > 0) {
          setModalMessage(`Você tem ${newPackages.length} nova(s) encomenda(s) para retirar!`);
          setShowModal(true);
        }
      }, (error) => {
        console.error("Erro ao buscar encomendas:", error);
      });
      
      return () => unsubscribe();
    }
  }, [db, user, appId]);
  
  useEffect(() => {
    const reminderInterval = setInterval(() => {
      const pendingPackages = packages.filter(p => p.status === 'received' && (new Date() - new Date(p.date)) > 10000);
      if (pendingPackages.length > 0) {
        setModalMessage(`Lembrete: Você tem ${pendingPackages.length} encomenda(s) para retirar!`);
        setShowModal(true);
      }
    }, 1800000);
    
    return () => clearInterval(reminderInterval);
  }, [packages]);
  
  const handlePackagePickup = async (packageId) => {
    try {
      const packageDocRef = doc(db, `artifacts/${appId}/packages`, packageId);
      await updateDoc(packageDocRef, {
        status: 'picked_up',
        pickupDate: new Date().toISOString()
      });
    } catch (e) {
      console.error("Erro ao dar baixa na encomenda:", e);
    }
  };

  const statusColors = {
    received: 'text-yellow-500 dark:text-yellow-400',
    picked_up: 'text-green-500 dark:text-green-400',
  };

  const statusTexts = {
    received: 'Recebido - Pendente de Retirada',
    picked_up: 'Retirado',
  };

  return (
    <>
      <Navbar title="Minhas Encomendas" setView={setView} />
      <ScreenLayout>
        <div className="w-full max-w-4xl p-6 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Olá, {user?.profile?.name || 'Morador'}!</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Confira as encomendas e correspondências recebidas para você.
          </p>
          
          <div className="space-y-4">
            {packages.length > 0 ? (
              packages.map(pkg => (
                <div key={pkg.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    {pkg.imageUrl ? (
                      <img src={pkg.imageUrl} alt="Imagem da Encomenda" className="w-16 h-16 object-cover rounded-md" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                        <Box className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold">{pkg.itemType}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chegada: {new Date(pkg.date).toLocaleDateString()}
                      </p>
                      <span className={`text-sm font-medium ${statusColors[pkg.status]}`}>
                        <Check className="inline w-4 h-4 mr-1" />
                        {statusTexts[pkg.status]}
                      </span>
                    </div>
                  </div>
                  {pkg.status === 'received' && (
                    <button
                      onClick={() => handlePackagePickup(pkg.id)}
                      className="w-full sm:w-auto bg-green-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-600 transition"
                    >
                      Dar Baixa na Retirada
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Você não tem nenhuma encomenda pendente.
              </p>
            )}
          </div>
        </div>
      </ScreenLayout>
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2">Notificação!</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Componente principal que gerencia o estado da aplicação e as visualizações
const App = () => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);

  // useEffect para inicializar o Firebase e autenticar
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);

        // Autenticar com o token personalizado ou anonimamente
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
        
        onAuthStateChanged(authInstance, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            // Simular o carregamento do perfil do usuário
            fetchUserProfile(currentUser.uid, dbInstance);
          } else {
            setUser(null);
            setLoading(false);
          }
        });

      } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  // Função para buscar o perfil do usuário (morador ou admin)
  const fetchUserProfile = async (uid, dbInstance) => {
    const userDocRef = doc(dbInstance, 'artifacts', appId, 'users', uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data().profile;
        setUser(prevUser => ({
          ...prevUser,
          profile
        }));
        if (profile.role === 'resident') {
          setView('resident-dashboard');
        } else if (profile.role === 'admin' || profile.role === 'staff') {
          setView('admin-dashboard');
        }
      } else {
        if (view !== 'login' && view !== 'resident-registration') {
          setView('login');
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar perfil do usuário:", error);
      setLoading(false);
    });
    return unsubscribe;
  };

  // Função para buscar a lista de moradores (para admins)
  useEffect(() => {
    if (db && user && (user.profile?.role === 'admin' || user.profile?.role === 'staff')) {
      const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
      const q = query(usersCollectionRef, where("profile.role", "==", "resident"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const residentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data().profile
        }));
        setResidents(residentsList);
      }, (error) => {
        console.error("Erro ao buscar moradores:", error);
      });
      return () => unsubscribe();
    }
  }, [db, user]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      setUser(null);
      setView('login');
    }
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700 dark:text-gray-300">Carregando...</p>
          </div>
        </div>
      );
    }
    
    switch (view) {
      case 'login':
        return <Login setView={setView} setUser={setUser} db={db} appId={appId} />;
      case 'resident-registration':
        return <ResidentRegistrationForm setView={setView} db={db} appId={appId} auth={auth} />;
      case 'admin-dashboard':
        return <AdminDashboard setView={setView} user={user} residents={residents} />;
      case 'admin-resident-registration':
        return <AdminResidentRegistrationForm setView={setView} db={db} appId={appId} />;
      case 'admin-staff-registration':
        return <AdminStaffRegistrationForm setView={setView} db={db} appId={appId} />;
      case 'admin-package-registration':
        return <AdminPackageRegistrationForm setView={setView} db={db} appId={appId} residents={residents} />;
      case 'resident-dashboard':
        return <ResidentDashboard setView={setView} user={user} db={db} appId={appId} />;
      default:
        return <Login setView={setView} setUser={setUser} db={db} appId={appId} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, handleLogout, view, setView }}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
        {renderView()}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
