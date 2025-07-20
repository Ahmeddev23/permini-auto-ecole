import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Building2,
  MapPin,
  FileText,
  Upload,
  ArrowLeft,
  ArrowRight,
  Shield
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Schémas de validation par étape (version simplifiée pour corriger l'erreur)
const step1Schema = z.object({
  first_name: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  last_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'),

  email: z.string()
    .email('Format d\'email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(254, 'L\'email ne peut pas dépasser 254 caractères'),

  phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Format de téléphone invalide'),

  cin: z.string()
    .min(8, 'Le numéro CIN doit contenir au moins 8 caractères')
    .max(20, 'Le numéro CIN ne peut pas dépasser 20 caractères')
    .regex(/^[0-9A-Z]+$/, 'Le CIN ne peut contenir que des chiffres et lettres majuscules'),
});

const step2Schema = z.object({
  verification_code: z.string()
    .length(6, 'Le code de vérification doit contenir exactement 6 chiffres')
    .regex(/^\d{6}$/, 'Le code de vérification ne peut contenir que des chiffres')
});

const step3Schema = z.object({
  school_name: z.string()
    .min(2, 'Le nom de l\'auto-école doit contenir au moins 2 caractères')
    .max(200, 'Le nom de l\'auto-école ne peut pas dépasser 200 caractères'),

  school_address: z.string()
    .min(10, 'L\'adresse doit contenir au moins 10 caractères')
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères'),

  school_phone: z.string()
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Format de téléphone invalide'),

  school_email: z.string()
    .email('Format d\'email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(254, 'L\'email ne peut pas dépasser 254 caractères'),

  license_number: z.string()
    .min(1, 'Le numéro d\'agrément est requis')
    .max(100, 'Le numéro d\'agrément ne peut pas dépasser 100 caractères'),
});

const step4Schema = z.object({
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),

  password_confirm: z.string()
}).refine((data) => data.password === data.password_confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["password_confirm"],
});

// Schéma complet pour la soumission finale
const completeRegistrationSchema = step1Schema.merge(step3Schema).merge(step4Schema);

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type Step4Data = z.infer<typeof step4Schema>;
type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>;

// Composant pour la validation en temps réel
const ValidationIcon: React.FC<{ isValid: boolean; isValidating: boolean }> = ({ isValid, isValidating }) => {
  if (isValidating) {
    return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
  }
  if (isValid) {
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
  return <XCircle className="h-4 w-4 text-red-500" />;
};

// Hook pour la validation d'email en temps réel
const useEmailValidation = (email: string) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!email || !z.string().email().safeParse(email).success) {
      setIsAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        // Vérifier si l'email existe déjà
        const response = await fetch(`http://localhost:8000/api/auth/check-email/?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          setIsAvailable(!data.exists); // true si disponible (n'existe pas)
        } else {
          setIsAvailable(true); // En cas d'erreur, on assume que c'est disponible
        }
      } catch (error) {
        console.error('Erreur validation email:', error);
        setIsAvailable(true);
      } finally {
        setIsValidating(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [email]);

  return { isValidating, isAvailable };
};

// Hook pour la validation de CIN en temps réel
const useCinValidation = (cin: string) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!cin || cin.length < 8) {
      setIsAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        // Vérifier si le CIN existe déjà
        const response = await fetch(`http://localhost:8000/api/auth/check-cin/?cin=${encodeURIComponent(cin)}`);
        if (response.ok) {
          const data = await response.json();
          setIsAvailable(!data.exists); // true si disponible (n'existe pas)
        } else {
          setIsAvailable(true); // En cas d'erreur, on assume que c'est disponible
        }
      } catch (error) {
        console.error('Erreur validation CIN:', error);
        setIsAvailable(true);
      } finally {
        setIsValidating(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [cin]);

  return { isValidating, isAvailable };
};

export const RegisterPage: React.FC = () => {
  const { t } = useLanguage();

  // États pour la navigation par étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Données collectées à chaque étape
  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({});
  const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({});
  const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({});
  const [step4Data, setStep4Data] = useState<Partial<Step4Data>>({});

  // États spécifiques pour la vérification email
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Forms pour chaque étape
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: step1Data
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: step2Data
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange',
    defaultValues: step3Data
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    mode: 'onChange',
    defaultValues: step4Data
  });



  // Validation en temps réel
  const watchedEmail = step1Form.watch('email');
  const watchedCin = step1Form.watch('cin');
  const watchedPassword = step4Form.watch('password');

  const { isValidating: emailValidating, isAvailable: emailAvailable } = useEmailValidation(watchedEmail);
  const { isValidating: cinValidating, isAvailable: cinAvailable } = useCinValidation(watchedCin);

  // Fonction pour calculer la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return {
      score,
      label: labels[score - 1] || '',
      color: colors[score - 1] || 'bg-gray-300'
    };
  };

  const passwordStrength = getPasswordStrength(watchedPassword);

  // Gestion du countdown pour renvoyer le code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Fonction pour renvoyer le code de vérification
  const resendVerificationCode = async () => {
    if (!step1Data.email) return;

    try {
      setIsLoading(true);
      await authService.sendVerificationCode(step1Data.email);
      toast.success('Code de vérification renvoyé !');
      setCanResend(false);
      setResendCountdown(60); // 60 secondes avant de pouvoir renvoyer
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation entre étapes
  const goToNextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await step1Form.trigger();
      if (isValid && emailAvailable !== false && cinAvailable !== false) {
        // Enregistrer les données et envoyer le code de vérification
        const step1Values = step1Form.getValues();
        setStep1Data(step1Values);

        try {
          setIsLoading(true);
          // Envoyer le code de vérification sans créer l'utilisateur
          await authService.sendVerificationCode(step1Values.email);

          toast.success('Code de vérification envoyé à votre email !');
          setCanResend(false);
          setResendCountdown(60);
          setCurrentStep(2);
        } catch (error: any) {
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        if (emailAvailable === false) {
          step1Form.setError('email', { message: 'Cet email est déjà utilisé' });
        }
        if (cinAvailable === false) {
          step1Form.setError('cin', { message: 'Ce numéro CIN est déjà utilisé' });
        }
      }
    } else if (currentStep === 2) {
      // Vérification du code email
      isValid = await step2Form.trigger();
      if (isValid) {
        const verificationCode = step2Form.getValues().verification_code;
        try {
          setIsVerifying(true);
          await authService.verifyCodeBeforeRegistration(step1Data.email!, verificationCode);
          setStep2Data(step2Form.getValues());
          toast.success('Email vérifié avec succès !');
          setCurrentStep(3);
        } catch (error: any) {
          step2Form.setError('verification_code', { message: error.message });
        } finally {
          setIsVerifying(false);
        }
      }
    } else if (currentStep === 3) {
      isValid = await step3Form.trigger();
      if (isValid) {
        setStep3Data(step3Form.getValues());
        setCurrentStep(4);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      if (currentStep === 2) {
        setStep1Data(step1Form.getValues());
      } else if (currentStep === 3) {
        setStep2Data(step2Form.getValues());
      } else if (currentStep === 4) {
        setStep3Data(step3Form.getValues());
      }
      setCurrentStep(currentStep - 1);
    }
  };

  // Soumission finale de l'inscription
  const onFinalSubmit = async () => {
    const step4Valid = await step4Form.trigger();
    if (!step4Valid) return;

    try {
      setIsLoading(true);

      // Combiner toutes les données des étapes
      const finalStep4Data = step4Form.getValues();
      const completeData = { ...step1Data, ...step3Data, ...finalStep4Data };

      // Créer l'utilisateur avec toutes les données nécessaires
      const registrationData = {
        // Données utilisateur (obligatoires pour UserRegistrationSerializer)
        username: completeData.email, // Utiliser l'email comme username
        email: completeData.email,
        first_name: completeData.first_name,
        last_name: completeData.last_name,
        phone: completeData.phone,
        cin: completeData.cin,
        user_type: 'driving_school',

        // Mot de passe
        password: completeData.password,
        password_confirm: completeData.password_confirm,

        // Données auto-école
        school_name: completeData.school_name,
        school_address: completeData.school_address,
        school_phone: completeData.school_phone,
        school_email: completeData.school_email,
        license_number: completeData.license_number,
      };



      // Créer l'auto-école (l'utilisateur existe déjà et est vérifié)
      const registrationResponse = await authService.registerDrivingSchool(registrationData);

      // Si nous avons reçu un token, l'utiliser pour l'authentification
      if (registrationResponse.token) {
        // Stocker le token pour les requêtes suivantes
        localStorage.setItem('token', registrationResponse.token);

        // Configurer axios pour utiliser le token
        const axios = (await import('axios')).default;
        axios.defaults.headers.common['Authorization'] = `Token ${registrationResponse.token}`;

        // Les documents ne sont plus requis dans cette version simplifiée
      }

      toast.success('Inscription réussie ! Votre demande est en cours de traitement 🎉');

      // Rediriger vers une page de confirmation
      navigate('/registration-success');

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  // Titres et descriptions pour chaque étape
  const stepInfo = {
    1: {
      title: "Informations personnelles",
      description: "Vos informations de base et de contact"
    },
    2: {
      title: "Vérification email",
      description: "Confirmez votre adresse email"
    },
    3: {
      title: "Informations auto-école",
      description: "Les détails de votre établissement et numéro d'agrément"
    },
    4: {
      title: "Sécurité du compte",
      description: "Créez votre mot de passe sécurisé"
    }
  };

  const getStepInfo = (step: number) => {
    const stepInfos = {
      1: {
        title: "Informations personnelles",
        description: "Commençons par vos informations de base"
      },
      2: {
        title: "Vérification email",
        description: "Confirmez votre adresse email pour sécuriser votre compte"
      },
      3: {
        title: "Informations auto-école",
        description: "Les détails de votre établissement et numéro d'agrément"
      },
      4: {
        title: "Sécurité du compte",
        description: "Créez votre mot de passe sécurisé pour finaliser l'inscription"
      }
    };
    return stepInfos[step as keyof typeof stepInfos] || stepInfos[1];
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-start justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-200 overflow-hidden relative">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 50, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-40 -right-40 w-80 h-80 border border-blue-200/30 dark:border-blue-800/30 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 0.9, 1] }}
          transition={{
            rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            scale: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 border border-indigo-200/20 dark:border-indigo-800/20 rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-4xl w-full my-8"
      >
        {/* Header moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Inscription Auto-école
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Créez votre
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              compte auto-école
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Digitalisez votre établissement avec notre plateforme de gestion complète
          </motion.p>
        </motion.div>

        {/* Indicateur de progression moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getStepInfo(currentStep).title}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Étape {currentStep} sur 4
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getStepInfo(currentStep).description}
          </p>

          <div className="flex items-center justify-center space-x-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-lg
                    ${currentStep === step
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-110'
                      : currentStep > step
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}
                  whileHover={{ scale: currentStep >= step ? 1.1 : 1.05 }}
                  animate={{
                    scale: currentStep === step ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    scale: { duration: 2, repeat: currentStep === step ? Infinity : 0 }
                  }}
                >
                  {currentStep > step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </motion.div>
                {step < 4 && (
                  <motion.div
                    className={`
                      w-12 h-1 mx-2 rounded-full transition-all duration-500
                      ${currentStep > step
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStep > step ? 1 : 0.3 }}
                    transition={{ duration: 0.5, delay: step * 0.1 }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>



        {/* Formulaire par étapes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
        >
          <AnimatePresence mode="wait">
            {/* ÉTAPE 1: Informations personnelles */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...step1Form.register('first_name')}
                        type="text"
                        className={`
                          block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                          dark:text-white dark:placeholder-gray-400
                          ${step1Form.formState.errors.first_name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        `}
                        placeholder="Votre prénom"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ValidationIcon
                          isValid={!step1Form.formState.errors.first_name}
                          isValidating={false}
                        />
                      </div>
                    </div>
                    {step1Form.formState.errors.first_name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {step1Form.formState.errors.first_name.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...step1Form.register('last_name')}
                        type="text"
                        className={`
                          block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                          dark:text-white dark:placeholder-gray-400
                          ${step1Form.formState.errors.last_name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        `}
                        placeholder="Votre nom"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ValidationIcon
                          isValid={!step1Form.formState.errors.last_name}
                          isValidating={false}
                        />
                      </div>
                    </div>
                    {step1Form.formState.errors.last_name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {step1Form.formState.errors.last_name.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step1Form.register('email')}
                      type="email"
                      className={`
                        block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400
                        ${step1Form.formState.errors.email || emailAvailable === false ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="votre@email.com"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ValidationIcon
                        isValid={!step1Form.formState.errors.email && emailAvailable !== false}
                        isValidating={emailValidating}
                      />
                    </div>
                  </div>
                  {step1Form.formState.errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step1Form.formState.errors.email.message}
                    </motion.p>
                  )}
                  {emailAvailable === false && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      Cet email est déjà utilisé
                    </motion.p>
                  )}
                  {emailAvailable === true && watchedEmail && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-green-600 dark:text-green-400"
                    >
                      ✓ Email disponible
                    </motion.p>
                  )}
                </div>

                {/* Téléphone et CIN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Téléphone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...step1Form.register('phone')}
                        type="tel"
                        className={`
                          block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                          dark:text-white dark:placeholder-gray-400
                          ${step1Form.formState.errors.phone ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        `}
                        placeholder="+216 XX XXX XXX"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ValidationIcon
                          isValid={!step1Form.formState.errors.phone}
                          isValidating={false}
                        />
                      </div>
                    </div>
                    {step1Form.formState.errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {step1Form.formState.errors.phone.message}
                      </motion.p>
                    )}
                  </div>

                  {/* CIN */}
                  <div>
                    <label htmlFor="cin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Numéro CIN *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...step1Form.register('cin')}
                        type="text"
                        className={`
                          block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                          dark:text-white dark:placeholder-gray-400
                          ${step1Form.formState.errors.cin || cinAvailable === false ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        `}
                        placeholder="12345678"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ValidationIcon
                          isValid={!step1Form.formState.errors.cin && cinAvailable !== false}
                          isValidating={cinValidating}
                        />
                      </div>
                    </div>
                    {step1Form.formState.errors.cin && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {step1Form.formState.errors.cin.message}
                      </motion.p>
                    )}
                    {cinAvailable === false && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        Ce numéro CIN est déjà utilisé
                      </motion.p>
                    )}
                    {cinAvailable === true && watchedCin && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-green-600 dark:text-green-400"
                      >
                        ✓ CIN disponible
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Bouton Suivant */}
                <div className="flex justify-end">
                  <motion.button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!step1Form.formState.isValid || emailValidating || cinValidating || emailAvailable === false || cinAvailable === false}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 2: Vérification email */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Mail className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Vérifiez votre email
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nous avons envoyé un code de vérification à <strong>{step1Data.email}</strong>
                  </p>
                </div>

                {/* Code de vérification */}
                <div>
                  <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code de vérification (6 chiffres) *
                  </label>
                  <div className="relative">
                    <input
                      {...step2Form.register('verification_code')}
                      type="text"
                      maxLength={6}
                      className={`
                        block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 text-center text-2xl font-mono tracking-widest
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400
                        ${step2Form.formState.errors.verification_code ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="000000"
                    />
                  </div>
                  {step2Form.formState.errors.verification_code && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step2Form.formState.errors.verification_code.message}
                    </motion.p>
                  )}
                </div>

                {/* Bouton renvoyer le code */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Vous n'avez pas reçu le code ?
                  </p>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={resendVerificationCode}
                      disabled={isLoading}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors duration-200"
                    >
                      Renvoyer le code
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Renvoyer dans {resendCountdown}s
                    </p>
                  )}
                </div>

                {/* Boutons navigation */}
                <div className="flex justify-between">
                  <motion.button
                    type="button"
                    onClick={goToPreviousStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!step2Form.formState.isValid || isVerifying}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Vérification...
                      </>
                    ) : (
                      <>
                        Vérifier
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3: Informations auto-école */}
            {currentStep === 3 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Nom de l'auto-école */}
                <div>
                  <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'auto-école *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step3Form.register('school_name')}
                      type="text"
                      className={`
                        block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400
                        ${step3Form.formState.errors.school_name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="Auto-école Excellence"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ValidationIcon
                        isValid={!step3Form.formState.errors.school_name}
                        isValidating={false}
                      />
                    </div>
                  </div>
                  {step3Form.formState.errors.school_name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step3Form.formState.errors.school_name.message}
                    </motion.p>
                  )}
                </div>

                {/* Adresse de l'auto-école */}
                <div>
                  <label htmlFor="school_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse complète *
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      {...step3Form.register('school_address')}
                      rows={3}
                      className={`
                        block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400 resize-none
                        ${step3Form.formState.errors.school_address ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="Adresse complète de votre auto-école..."
                    />
                  </div>
                  {step3Form.formState.errors.school_address && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step3Form.formState.errors.school_address.message}
                    </motion.p>
                  )}
                </div>

                {/* Téléphone et Email de l'auto-école */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Téléphone auto-école */}
                  <div>
                    <label htmlFor="school_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone auto-école *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...step3Form.register('school_phone')}
                        type="tel"
                        className={`
                          block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                          dark:text-white dark:placeholder-gray-400
                          ${step3Form.formState.errors.school_phone ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        `}
                        placeholder="+216 XX XXX XXX"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ValidationIcon
                          isValid={!step3Form.formState.errors.school_phone}
                          isValidating={false}
                        />
                      </div>
                    </div>
                    {step3Form.formState.errors.school_phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {step3Form.formState.errors.school_phone.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Email auto-école */}
                  <div>
                    <label htmlFor="school_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email auto-école *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...step3Form.register('school_email')}
                        type="email"
                        className={`
                          block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                          dark:text-white dark:placeholder-gray-400
                          ${step3Form.formState.errors.school_email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        `}
                        placeholder="contact@autoecole.com"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <ValidationIcon
                          isValid={!step3Form.formState.errors.school_email}
                          isValidating={false}
                        />
                      </div>
                    </div>
                    {step3Form.formState.errors.school_email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {step3Form.formState.errors.school_email.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Numéro d'agrément */}
                <div>
                  <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro d'agrément *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step3Form.register('license_number')}
                      type="text"
                      className={`
                        block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400
                        ${step3Form.formState.errors.license_number ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="Exemple: AGR-2024-001 ou tout autre format"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ValidationIcon
                        isValid={!step3Form.formState.errors.license_number}
                        isValidating={false}
                      />
                    </div>
                  </div>
                  {step3Form.formState.errors.license_number && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step3Form.formState.errors.license_number.message}
                    </motion.p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Numéro d'agrément ou de licence de votre auto-école (tout format accepté)
                  </p>
                </div>

                {/* Boutons navigation */}
                <div className="flex justify-between">
                  <motion.button
                    type="button"
                    onClick={goToPreviousStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!step3Form.formState.isValid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 4: Mot de passe */}
            {currentStep === 4 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mot de passe */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step4Form.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className={`
                        block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400
                        ${step4Form.formState.errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="Votre mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {step4Form.formState.errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step4Form.formState.errors.password.message}
                    </motion.p>
                  )}

                  {/* Indicateur de force du mot de passe */}
                  {watchedPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Force du mot de passe:</span>
                        <span className={`font-medium ${
                          passwordStrength.score <= 2 ? 'text-red-500' :
                          passwordStrength.score <= 3 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...step4Form.register('password_confirm')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`
                        block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600
                        dark:text-white dark:placeholder-gray-400
                        ${step4Form.formState.errors.password_confirm ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {step4Form.formState.errors.password_confirm && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {step4Form.formState.errors.password_confirm.message}
                    </motion.p>
                  )}
                </div>

                {/* Boutons navigation et soumission */}
                <div className="flex justify-between">
                  <motion.button
                    type="button"
                    onClick={goToPreviousStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={onFinalSubmit}
                    disabled={!step4Form.formState.isValid || isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Inscription...
                      </>
                    ) : (
                      <>
                        Créer mon compte
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lien vers la connexion */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom spacing */}
      <div className="pb-16"></div>
    </div>
  );
};
