import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { User, Package, Home, LogOut, Plus, Building, Box, Key, Trash, Check, X, UserPlus } from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import ResidentRegistrationForm from './components/resident/ResidentRegistrationForm';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminResidentRegistrationForm from './components/admin/AdminResidentRegistrationForm';
import AdminStaffRegistrationForm from './components/admin/AdminStaffRegistrationForm';
import AdminPackageRegistrationForm from './components/admin/AdminPackageRegistrationForm';
import ResidentDashboard from './components/resident/ResidentDashboard';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const App = () => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);

  // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6asR4j3emEGaNJgaWsYjydLA6LBNQpLs",
  authDomain: "appcorrespondenciabd.firebaseapp.com",
  projectId: "appcorrespondenciabd",
  storageBucket: "appcorrespondenciabd.firebasestorage.app",
  messagingSenderId: "456234240689",
  appId: "1:456234240689:web:9fee39e22b6fe40f13f090"
};

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);

        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
        
        onAuthStateChanged(authInstance, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
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

  const fetchUserProfile = async (uid, dbInstance) => {
    const userDocRef = doc(dbInstance, 'artifacts', appId, 'users', uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data().profile;
        setUser(prevUser => ({ ...prevUser, profile }));
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