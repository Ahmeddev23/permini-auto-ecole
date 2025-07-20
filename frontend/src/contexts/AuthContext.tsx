import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userVersion, setUserVersion] = useState(0);

  // Fonction pour mettre à jour l'utilisateur et forcer le re-rendu
  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    setUserVersion(prev => prev + 1);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(updateUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (loginField: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(loginField, password);
      localStorage.setItem('token', response.token);
      updateUser(response.user);
      toast.success('Connexion réussie!');
      return response; // Retourner la réponse complète pour la redirection
    } catch (error) {
      toast.error('Email/CIN ou mot de passe incorrect');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDrivingSchool = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.loginDrivingSchool(email, password);
      localStorage.setItem('token', response.token);

      // Pour les auto-écoles, fusionner les données user et driving_school
      const completeUser = {
        ...response.user,
        driving_school: response.driving_school
      };

      console.log('🏫 Données complètes auto-école:', completeUser);
      updateUser(completeUser);
      toast.success('Connexion réussie!');
      return response;
    } catch (error) {
      toast.error('Email ou mot de passe incorrect');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginInstructor = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.loginInstructor(email, password);
      localStorage.setItem('token', response.token);
      updateUser(response.user);
      toast.success('Connexion réussie!');
      return response;
    } catch (error) {
      toast.error('Email ou mot de passe incorrect');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginStudent = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.loginStudent(email, password);
      localStorage.setItem('token', response.token);
      updateUser(response.user);
      toast.success('Connexion réussie!');
      return response;
    } catch (error) {
      toast.error('Email ou mot de passe incorrect');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    updateUser(null);
    toast.success('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginDrivingSchool,
      loginInstructor,
      loginStudent,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};