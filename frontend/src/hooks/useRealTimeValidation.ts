import { useState, useRef } from 'react';
import dashboardService from '../services/dashboardService';

interface CheckState {
  isChecking: boolean;
  exists: boolean | null;
  message: string;
}

export const useRealTimeValidation = () => {
  const [emailCheck, setEmailCheck] = useState<CheckState>({
    isChecking: false,
    exists: null,
    message: ''
  });

  const [cinCheck, setCinCheck] = useState<CheckState>({
    isChecking: false,
    exists: null,
    message: ''
  });

  const emailTimeout = useRef<NodeJS.Timeout>();
  const cinTimeout = useRef<NodeJS.Timeout>();

  // Vérification email en temps réel
  const checkEmail = (email: string) => {
    // Clear previous timeout
    if (emailTimeout.current) {
      clearTimeout(emailTimeout.current);
    }

    if (!email || email.length < 3) {
      setEmailCheck({ isChecking: false, exists: null, message: '' });
      return;
    }

    setEmailCheck(prev => ({ ...prev, isChecking: true }));

    emailTimeout.current = setTimeout(async () => {
      try {
        const result = await dashboardService.validateEmail(email);
        setEmailCheck({
          isChecking: false,
          exists: !result.valid,
          message: result.valid ? '✓ Email disponible' : '✗ Cet email existe déjà'
        });
      } catch (error: any) {
        setEmailCheck({
          isChecking: false,
          exists: null,
          message: 'Erreur de vérification'
        });
      }
    }, 500);
  };

  // Vérification CIN en temps réel
  const checkCin = (cin: string) => {
    // Clear previous timeout
    if (cinTimeout.current) {
      clearTimeout(cinTimeout.current);
    }

    if (!cin || cin.length < 3) {
      setCinCheck({ isChecking: false, exists: null, message: '' });
      return;
    }

    setCinCheck(prev => ({ ...prev, isChecking: true }));

    cinTimeout.current = setTimeout(async () => {
      try {
        const result = await dashboardService.validateCin(cin);
        setCinCheck({
          isChecking: false,
          exists: !result.valid,
          message: result.valid ? '✓ CIN disponible' : '✗ Ce CIN existe déjà'
        });
      } catch (error: any) {
        setCinCheck({
          isChecking: false,
          exists: null,
          message: 'Erreur de vérification'
        });
      }
    }, 500);
  };

  const resetChecks = () => {
    if (emailTimeout.current) clearTimeout(emailTimeout.current);
    if (cinTimeout.current) clearTimeout(cinTimeout.current);
    setEmailCheck({ isChecking: false, exists: null, message: '' });
    setCinCheck({ isChecking: false, exists: null, message: '' });
  };

  return {
    emailCheck,
    cinCheck,
    checkEmail,
    checkCin,
    resetChecks
  };
};
