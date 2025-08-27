import React from 'react';
import { User, UserPlus, Box, Key } from 'lucide-react';
import Navbar from '../shared/Navbar';
import ScreenLayout from '../shared/ScreenLayout';


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

export default AdminDashboard;