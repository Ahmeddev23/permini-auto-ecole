import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  HashtagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/common/Card';
import { dashboardService } from '../../services/dashboardService';
import { couponService } from '../../services/couponService';
import { paymentService } from '../../services/paymentService';

interface PaymentPageProps {}

const PLAN_PRICES = {
  standard: 49,
  premium: 99
};

const PLAN_NAMES = {
  standard: 'Standard',
  premium: 'Premium'
};

const PaymentPage: React.FC<PaymentPageProps> = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRenewal = searchParams.get('renewal') === 'true';

  const [selectedMethod, setSelectedMethod] = useState<string>('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  
  // Bank transfer form
  const [transferReference, setTransferReference] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Card payment form
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Flouci form
  const [phoneNumber, setPhoneNumber] = useState('');

  // États pour les coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [originalAmount, setOriginalAmount] = useState(0);
  const [discountedAmount, setDiscountedAmount] = useState(0);

  useEffect(() => {
    fetchCurrentPlan();
    // Initialiser le montant original
    if (planId) {
      const amount = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
      setOriginalAmount(amount);
      setDiscountedAmount(amount);
    }
  }, [planId]);

  const fetchCurrentPlan = async () => {
    try {
      const data = await dashboardService.getSubscriptionInfo();
      setCurrentPlan(data.current_plan);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Erreur lors du chargement du plan actuel:', error);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Veuillez saisir un code de coupon');
      return;
    }

    setCouponLoading(true);
    try {
      const data = await couponService.validateCouponPublic(couponCode.trim());

      if (data.valid) {
        setAppliedCoupon(data);
        const discount = (originalAmount * (data.discount_percentage || 0)) / 100;
        setDiscountedAmount(originalAmount - discount);
        toast.success(data.message || 'Coupon appliqué avec succès');
      } else {
        toast.error(data.errors?.code?.[0] || data.message || 'Code de coupon invalide');
      }
    } catch (error: any) {
      console.error('Erreur lors de la validation du coupon:', error);
      toast.error('Erreur lors de la validation du coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscountedAmount(originalAmount);
    toast.success('Coupon retiré');
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Seuls les fichiers JPG, PNG et PDF sont acceptés');
        return;
      }
      
      setReceiptFile(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!planId) return;

    // Validation selon la méthode de paiement
    if (selectedMethod === 'bank_transfer') {
      if (!transferReference || !transferDate || !receiptFile) {
        toast.error('Veuillez remplir tous les champs et joindre le justificatif');
        return;
      }
    } else if (selectedMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        toast.error('Veuillez remplir tous les champs de la carte');
        return;
      }
    } else if (selectedMethod === 'flouci') {
      if (!phoneNumber) {
        toast.error('Veuillez saisir votre numéro de téléphone');
        return;
      }
    }

    setLoading(true);

    try {
      // Utiliser le montant avec réduction si un coupon est appliqué
      const amount = appliedCoupon ? discountedAmount : PLAN_PRICES[planId as keyof typeof PLAN_PRICES];

      if (selectedMethod === 'card') {
        // Paiement par carte (ClickToPay) - Immédiat
        const result = await paymentService.processCardPayment({
          cardNumber,
          expiryDate,
          cvv,
          cardholderName,
          amount,
          planId,
          isRenewal
        });

        if (result.success) {
          if (result.redirectUrl) {
            // Redirection vers ClickToPay
            window.location.href = result.redirectUrl;
          } else {
            toast.success('Paiement effectué avec succès!');
            navigate('/dashboard/subscription');
          }
        } else {
          toast.error(result.message || 'Erreur lors du paiement');
        }
      } else if (selectedMethod === 'flouci') {
        // Paiement Flouci - Immédiat
        const result = await paymentService.processFlouciPayment({
          phoneNumber,
          amount,
          planId,
          isRenewal
        });

        if (result.success) {
          if (result.paymentUrl) {
            // Redirection vers Flouci
            window.location.href = result.paymentUrl;
          } else {
            toast.success('Paiement effectué avec succès!');
            navigate('/dashboard/subscription');
          }
        } else {
          toast.error(result.message || 'Erreur lors du paiement Flouci');
        }
      } else if (selectedMethod === 'bank_transfer') {
        // Virement bancaire - Nécessite validation admin
        const formData = new FormData();
        formData.append('requested_plan', planId);
        formData.append('payment_method', selectedMethod);
        formData.append('amount', amount.toString());
        formData.append('is_renewal', isRenewal.toString());
        formData.append('transfer_reference', transferReference);
        formData.append('transfer_date', transferDate);

        // Ajouter les informations du coupon si appliqué
        if (appliedCoupon) {
          formData.append('coupon_code', appliedCoupon.code);
          formData.append('discount_percentage', appliedCoupon.discount_percentage.toString());
          formData.append('original_amount', originalAmount.toString());
        }

        if (receiptFile) {
          formData.append('receipt_file', receiptFile);
        }

        await dashboardService.submitUpgradeRequest(formData);
        toast.success('Demande de paiement soumise avec succès! En attente de validation.');
        navigate('/dashboard/subscription');
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast.error(error.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  if (!planId || !PLAN_PRICES[planId as keyof typeof PLAN_PRICES]) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Plan invalide</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Le plan sélectionné n'existe pas.</p>
      </div>
    );
  }

  const planPrice = PLAN_PRICES[planId as keyof typeof PLAN_PRICES];
  const planName = PLAN_NAMES[planId as keyof typeof PLAN_NAMES];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isRenewal ? 'Renouvellement d\'abonnement' : 'Paiement de la mise à niveau'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isRenewal
            ? `Renouvellement du plan ${planName}`
            : `Mise à niveau vers le plan ${planName}`
          }
        </p>

        {/* Affichage du prix avec réduction */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {appliedCoupon ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-lg text-gray-500 line-through">{originalAmount} DT</span>
                <span className="text-2xl font-bold text-green-600">{discountedAmount.toFixed(2)} DT</span>
              </div>
              <p className="text-sm text-green-600">
                Économie de {(originalAmount - discountedAmount).toFixed(2)} DT avec le coupon {appliedCoupon.code}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{planPrice} DT</span>
              <span className="text-gray-500 ml-1">/mois</span>
            </div>
          )}
        </div>
        {isRenewal && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {getRenewalBenefits(planId!)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Méthodes de paiement
              </h2>

              <div className="space-y-4">
                {/* Bank Transfer */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMethod === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod('bank_transfer')}
                >
                  <div className="flex items-center space-x-3">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Virement bancaire
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paiement par virement bancaire avec justificatif
                      </p>
                    </div>
                    {selectedMethod === 'bank_transfer' && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>

                {/* Card Payment - ClickToPay */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod('card')}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Carte bancaire (ClickToPay)
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paiement immédiat par carte bancaire
                      </p>
                    </div>
                    {selectedMethod === 'card' && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                      Instantané
                    </span>
                  </div>
                </div>

                {/* Flouci */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedMethod === 'flouci'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod('flouci')}
                >
                  <div className="flex items-center space-x-3">
                    <DevicePhoneMobileIcon className="h-6 w-6 text-orange-600" />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Flouci
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paiement mobile Flouci instantané
                      </p>
                    </div>
                    {selectedMethod === 'flouci' && (
                      <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                      Instantané
                    </span>
                  </div>
                </div>
              </div>

              {/* Section Coupon de Réduction */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Code de réduction (optionnel)
                </h3>

                {!appliedCoupon ? (
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Entrez votre code de réduction"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {couponLoading ? 'Validation...' : 'Appliquer'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800 dark:text-green-200">
                            Coupon appliqué: {appliedCoupon.code}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Réduction de {appliedCoupon.discount_percentage}% - Économie: {(originalAmount - discountedAmount).toFixed(2)} TND
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Transfer Form */}
              {selectedMethod === 'bank_transfer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Informations du virement
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <HashtagIcon className="h-4 w-4 inline mr-1" />
                        Référence du virement
                      </label>
                      <input
                        type="text"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        placeholder="Ex: VIR123456789"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <CalendarIcon className="h-4 w-4 inline mr-1" />
                        Date du virement
                      </label>
                      <input
                        type="date"
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <DocumentArrowUpIcon className="h-4 w-4 inline mr-1" />
                        Justificatif de paiement
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          id="receipt-upload"
                        />
                        <label
                          htmlFor="receipt-upload"
                          className="cursor-pointer flex flex-col items-center space-y-2"
                        >
                          <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receiptFile ? receiptFile.name : 'Cliquez pour sélectionner un fichier'}
                          </span>
                          <span className="text-xs text-gray-500">
                            JPG, PNG ou PDF (max 5MB)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Card Payment Form */}
              {selectedMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Informations de la carte
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom du titulaire
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Nom complet du titulaire"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date d'expiration
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2'))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="MM/AA"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Flouci Payment Form */}
              {selectedMethod === 'flouci' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Paiement Flouci
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <DevicePhoneMobileIcon className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            Comment ça marche ?
                          </h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            Vous recevrez un SMS avec un lien pour finaliser le paiement via l'application Flouci.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Summary & Bank Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Résumé de la commande
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan actuel:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {currentPlan}
                  </span>
                </div>
                {!isRenewal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nouveau plan:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {planName}
                    </span>
                  </div>
                )}
                {isRenewal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Renouvellement
                    </span>
                  </div>
                )}
                {isRenewal && subscriptionData && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bénéfices:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {getRenewalBenefits(planId!)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {planPrice} DT{isRenewal ? ' (renouvellement)' : '/mois'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bank Details */}
          {selectedMethod === 'bank_transfer' && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Coordonnées bancaires
                </h3>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bénéficiaire:
                    </span>
                    <p className="text-gray-900 dark:text-white">Ahmed Regaieg</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Banque:
                    </span>
                    <p className="text-gray-900 dark:text-white">Banque de Tunisie et des Emirats</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      RIB:
                    </span>
                    <p className="text-gray-900 dark:text-white font-mono">
                      24 031 1756542511101 23
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Montant:
                    </span>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {planPrice} DT
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Important:</strong> Veuillez mentionner votre nom d'auto-école
                    dans la référence du virement pour faciliter l'identification.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitPayment}
            disabled={loading ||
              (selectedMethod === 'bank_transfer' && (!transferReference || !transferDate || !receiptFile)) ||
              (selectedMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !cardholderName)) ||
              (selectedMethod === 'flouci' && !phoneNumber)
            }
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              loading ||
              (selectedMethod === 'bank_transfer' && (!transferReference || !transferDate || !receiptFile)) ||
              (selectedMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !cardholderName)) ||
              (selectedMethod === 'flouci' && !phoneNumber)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Traitement en cours...
              </div>
            ) : selectedMethod === 'bank_transfer' ? (
              'Soumettre la demande'
            ) : (
              'Procéder au paiement'
            )}
          </button>

          {selectedMethod === 'bank_transfer' && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Votre demande sera traitée sous 24-48h après vérification du paiement
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
