import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Box, Check } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../shared/Navbar';
import ScreenLayout from '../shared/ScreenLayout';

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
todo: 'É PRECISO FAZER O MODAL DE ONDE O A ENCOMENDA ESTÁ DEPÓSITO OU PORTARIA, ASSIM QUE A ENCOMENDA FOR ENVIADA PARA O DEPÓSITO É PRECISO ATUALIZAR ESSA FLAG NO SISTEMA/APP'
  return (
    <>
      <Navbar title="Minhas Encomendas" setView={setView} />
      <ScreenLayout>
        <div className="w-full max-w-4xl p-6 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Olá, {user?.profile?.name || 'Morador do apartamwnro'}!</h2>
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
              className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg--600 transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResidentDashboard;