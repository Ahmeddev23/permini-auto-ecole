import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon,
  TruckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UsersIcon,
  DocumentTextIcon,
  BanknotesIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { toast } from 'react-hot-toast';



interface SubscriptionData {
  current_plan: string;
  plan_start_date: string;
  plan_end_date: string;
  days_remaining: number;
  max_accounts: number;
  current_accounts: number;
  can_add_accounts: boolean;
  is_plan_expired: boolean;
  can_renew: boolean;
  renewal_count: number;
}

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 49,
    period: 'DT/mois',
    description: 'Parfait pour les auto-écoles en développement',
    features: [
      { name: '200 candidats (+50 par renouvellement)', included: true, description: 'Gestion complète des candidats avec progression automatique' },
      { name: 'Gestion des moniteurs', included: true, description: 'Ajout, modification et suivi des moniteurs' },
      { name: 'Planning et séances', included: true, description: 'Planification des cours théoriques et pratiques' },
      { name: 'Gestion des examens', included: true, description: 'Suivi des examens théoriques et pratiques' },
      { name: 'Gestion des véhicules', included: true, description: 'Suivi des véhicules et de leur état' },
      { name: 'Gestion des paiements', included: true, description: 'Suivi des paiements des candidats' },
      { name: 'Statistiques de base', included: true, description: 'Tableaux de bord avec statistiques essentielles' },
      { name: 'Notifications en temps réel', included: true, description: 'Alertes pour les événements importants' },
      { name: 'Comptabilité avancée', included: false, description: 'Gestion financière complète avec rapports' },
      { name: 'Messagerie intégrée', included: false, description: 'Communication en temps réel entre tous les utilisateurs' },
      { name: 'Dépenses véhicules', included: false, description: 'Suivi détaillé des coûts par véhicule' },
      { name: 'Support prioritaire', included: false, description: 'Assistance technique prioritaire' },
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    period: 'DT/mois',
    description: 'Solution complète pour les auto-écoles professionnelles',
    popular: true,
    features: [
      { name: 'Candidats illimités', included: true, description: 'Aucune limite sur le nombre de candidats' },
      { name: 'Gestion des moniteurs', included: true, description: 'Ajout, modification et suivi des moniteurs' },
      { name: 'Planning et séances', included: true, description: 'Planification avancée avec intelligence artificielle' },
      { name: 'Gestion des examens', included: true, description: 'Suivi complet avec rappels automatiques' },
      { name: 'Gestion des véhicules', included: true, description: 'Suivi avancé avec alertes d\'expiration' },
      { name: 'Gestion des paiements', included: true, description: 'Suivi complet avec rappels automatiques' },
      { name: 'Statistiques avancées', included: true, description: 'Analyses détaillées et rapports personnalisés' },
      { name: 'Notifications en temps réel', included: true, description: 'Système de notifications complet avec WebSocket' },
      { name: 'Comptabilité avancée', included: true, description: 'Gestion financière complète avec rapports détaillés' },
      { name: 'Messagerie intégrée', included: true, description: 'Communication en temps réel entre tous les utilisateurs' },
      { name: 'Dépenses véhicules', included: true, description: 'Suivi détaillé des coûts et maintenance par véhicule' },
      { name: 'Support prioritaire 24/7', included: true, description: 'Assistance technique prioritaire disponible 24h/24' },
    ]
  }
];

// Fonction pour obtenir l'icône selon la fonctionnalité
const getFeatureIcon = (featureName: string) => {
  if (featureName.includes('candidats') || featureName.includes('Candidats')) {
    return AcademicCapIcon;
  } else if (featureName.includes('moniteurs')) {
    return UsersIcon;
  } else if (featureName.includes('Planning') || featureName.includes('séances')) {
    return CalendarIcon;
  } else if (featureName.includes('examens')) {
    return DocumentTextIcon;
  } else if (featureName.includes('véhicules')) {
    return TruckIcon;
  } else if (featureName.includes('paiements')) {
    return BanknotesIcon;
  } else if (featureName.includes('Statistiques')) {
    return ChartBarIcon;
  } else if (featureName.includes('Notifications')) {
    return BellIcon;
  } else if (featureName.includes('Comptabilité')) {
    return CurrencyDollarIcon;
  } else if (featureName.includes('Messagerie')) {
    return ChatBubbleLeftRightIcon;
  } else if (featureName.includes('Dépenses')) {
    return WrenchScrewdriverIcon;
  } else if (featureName.includes('Support')) {
    return LifebuoyIcon;
  } else {
    return CheckIcon;
  }
};



const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [upgradeRequests, setUpgradeRequests] = useState<any[]>([]);



  useEffect(() => {
    fetchSubscriptionData();
    fetchUpgradeRequests();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getSubscriptionInfo();
      setSubscriptionData(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'abonnement:', error);
      toast.error('Erreur lors du chargement des informations d\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpgradeRequests = async () => {
    try {
      const requests = await dashboardService.getUpgradeRequests();
      setUpgradeRequests(requests);
    } catch (error: any) {
      console.error('Erreur lors du chargement des demandes:', error);
    }
  };

  const handleUpgrade = (planId: string, isRenewal: boolean = false) => {
    // Vérifier les restrictions de rétrogradation
    if (subscriptionData && !isRenewal) {
      const currentPlan = subscriptionData.current_plan;
      const currentAccounts = subscriptionData.current_accounts;

      // Empêcher la rétrogradation de Premium vers Standard si plus de 200 comptes
      if (currentPlan === 'premium' && planId === 'standard' && currentAccounts > 200) {
        toast.error(
          `Impossible de rétrograder vers Standard. Vous avez ${currentAccounts} comptes actifs (limite Standard: 200). Veuillez d'abord réduire le nombre de comptes.`
        );
        return;
      }

      // Plus de plan gratuit - tous les plans sont payants après la période d'essai
    }

    // Rediriger vers la page de paiement
    const paymentUrl = isRenewal
      ? `/dashboard/payment/${planId}?renewal=true`
      : `/dashboard/payment/${planId}`;
    navigate(paymentUrl);
  };

  const canDowngradeToPlan = (planId: string): boolean => {
    if (!subscriptionData) return true;

    const currentPlan = subscriptionData.current_plan;
    const currentAccounts = subscriptionData.current_accounts;

    // Plus de plan gratuit disponible

    // Vérifier la limite de comptes pour Standard
    if (currentPlan === 'premium' && planId === 'standard' && currentAccounts > 200) {
      return false;
    }

    return true;
  };

  const getAccountLimitForPlan = (planId: string, renewalCount: number = 0): string => {
    switch (planId) {
      case 'free':
        return '50 candidats';
      case 'standard':
        const standardLimit = 200 + (renewalCount * 50);
        return `${standardLimit} candidats`;
      case 'premium':
        return 'Candidats illimités';
      default:
        return '';
    }
  };

  const getRenewalBenefits = (planId: string): string => {
    switch (planId) {
      case 'standard':
        return '+30 jours + 50 comptes supplémentaires';
      case 'premium':
        return '+30 jours (comptes illimités)';
      default:
        return '+30 jours';
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <UserGroupIcon className="h-8 w-8" />;
      case 'standard':
        return <TruckIcon className="h-8 w-8" />;
      case 'premium':
        return <StarIcon className="h-8 w-8" />;
      default:
        return <CreditCardIcon className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'text-gray-600';
      case 'standard':
        return 'text-blue-600';
      case 'premium':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Marquer le plan actuel
  const plansWithCurrent = PLANS.map(plan => ({
    ...plan,
    current: plan.id === subscriptionData?.current_plan
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion des Abonnements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gérez votre abonnement et découvrez nos plans premium
        </p>
      </div>

      {/* Plan actuel */}
      {subscriptionData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <CreditCardIcon className="h-6 w-6 mr-2" />
                Plan Actuel
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${getPlanColor(subscriptionData.current_plan)}`}>
                    {getPlanIcon(subscriptionData.current_plan)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                      {subscriptionData.current_plan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-green-600">
                    <CalendarIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Jours restants</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {subscriptionData.days_remaining} jours
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-blue-600">
                    <UserGroupIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Comptes utilisés</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {subscriptionData.current_accounts} / {subscriptionData.max_accounts === 999999 ? '∞' : subscriptionData.max_accounts}
                    </p>
                  </div>
                </div>
              </div>

              {subscriptionData.days_remaining <= 7 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                          Votre plan expire dans {subscriptionData.days_remaining} jour(s)
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Renouvelez maintenant pour {getRenewalBenefits(subscriptionData.current_plan)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpgrade(subscriptionData.current_plan, true)}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Renouveler
                    </button>
                  </div>
                </div>
              )}

              {subscriptionData.current_plan === 'free' && subscriptionData.days_remaining <= 7 && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <p className="text-red-800 dark:text-red-200">
                      Votre période d'essai expire dans {subscriptionData.days_remaining} jour(s).
                      Choisissez un plan payant pour continuer à utiliser le service.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Demandes en attente */}
      {upgradeRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-orange-500" />
                Demandes de mise à niveau
              </h2>

              <div className="space-y-4">
                {upgradeRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`border rounded-lg p-4 ${
                      request.status === 'pending'
                        ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                        : request.status === 'approved'
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Mise à niveau vers {request.requested_plan.charAt(0).toUpperCase() + request.requested_plan.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Montant: {request.amount} DT - {request.payment_method === 'bank_transfer' ? 'Virement bancaire' : request.payment_method}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Demandé le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                        }`}>
                          {request.status === 'pending' ? 'En attente' :
                           request.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                        </span>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>En cours de traitement:</strong> Votre demande est en cours de vérification.
                          Vous recevrez une notification une fois le paiement validé (24-48h).
                        </p>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Note:</strong> {request.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Plans disponibles */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choisissez votre plan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sélectionnez le plan qui correspond le mieux aux besoins de votre auto-école
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plansWithCurrent.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </span>
                </div>
              )}

              <Card className={`h-full ${plan.current ? 'ring-2 ring-blue-500' : ''} ${plan.popular ? 'border-purple-200 dark:border-purple-800' : ''}`}>
                <div className="p-6">
                  {/* Header du plan */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${getPlanColor(plan.id)} bg-gray-100 dark:bg-gray-700`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Prix */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-xl text-gray-500 dark:text-gray-400 ml-1">
                        DT
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {plan.period}
                    </p>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => {
                      const FeatureIcon = getFeatureIcon(feature.name);
                      return (
                        <div key={featureIndex} className="flex items-start">
                          <div className="flex items-center mr-3 flex-shrink-0 mt-0.5">
                            <FeatureIcon className={`h-4 w-4 mr-1 ${feature.included ? 'text-blue-500' : 'text-gray-400'}`} />
                            {feature.included ? (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XMarkIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {feature.name}
                            </div>
                            {feature.description && (
                              <div className={`text-xs mt-1 ${feature.included ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                {feature.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bouton d'action */}
                  <div className="text-center">
                    {plan.current ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
                          <ShieldCheckIcon className="h-5 w-5 mr-2" />
                          Plan Actuel
                        </div>
                        {subscriptionData && subscriptionData.days_remaining <= 5 && (
                          <button
                            onClick={() => handleUpgrade(plan.id, true)}
                            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Renouveler ({getRenewalBenefits(plan.id)})
                          </button>
                        )}
                      </div>
                    ) : canDowngradeToPlan(plan.id) ? (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                          plan.popular
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <ArrowUpIcon className="h-4 w-4 mr-2" />
                          Passer à {plan.name}
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          disabled
                          className="w-full px-4 py-2 rounded-lg font-medium bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        >
                          Non disponible
                        </button>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Trop de comptes actifs ({subscriptionData?.current_accounts}) pour ce plan
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Avantages de la mise à niveau */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Pourquoi passer à un plan supérieur ?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 mb-4">
                  <UserGroupIcon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Plus de candidats
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérez plus de candidats simultanément
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 mb-4">
                  <TruckIcon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion des véhicules
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Suivez votre flotte de véhicules
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 mb-4">
                  <ChartBarIcon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Statistiques avancées
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Analyses détaillées de performance
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 mb-4">
                  <CurrencyDollarIcon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion financière
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Suivi complet des revenus et dépenses
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default SubscriptionPage;
