import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Car,
  Users,
  Calendar,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { VideoModal, useVideoModal } from '../components/common/VideoModal';

// Composant pour les éléments flottants subtils
const FloatingElement: React.FC<{ delay: number; children: React.ReactNode; className?: string }> = ({ delay, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Composant pour les statistiques animées
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ end, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Modal vidéo pour la démo
  const videoModal = useVideoModal();
  const DEMO_VIDEO_ID = 'y3Db1rqZBG0'; // ID de votre vidéo YouTube

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section Élégante et Moderne */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 lg:pt-24">

        {/* Éléments décoratifs subtils avec animations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Cercles décoratifs animés */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-40 -right-40 w-80 h-80 border border-blue-200/30 dark:border-blue-800/30 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.9, 1]
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 border border-indigo-200/20 dark:border-indigo-800/20 rounded-full"
          />

          {/* Particules flottantes subtiles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-300/20 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Grille subtile avec effet de vague */}
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)]"
            animate={{
              backgroundPosition: ['0px 0px', '50px 50px', '0px 0px']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Contenu principal */}
        <motion.div
          className="relative z-10 flex items-center min-h-screen"
          style={{ y: y1, opacity }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Colonne de gauche - Contenu */}
              <div className="space-y-8">

                {/* Badge */}
                <FloatingElement delay={0.2}>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('landing.badge')}
                  </div>
                </FloatingElement>

                {/* Titre principal avec animations */}
                <div className="overflow-hidden">
                  <motion.h1
                    className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <motion.span
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                      className="block"
                    >
                      {t('landing.hero.title')}
                    </motion.span>
                    <motion.span
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                      className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
                    >
                      <motion.span
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          backgroundSize: '200% 200%'
                        }}
                        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent"
                      >
                        {t('landing.hero.subtitle')}
                      </motion.span>
                    </motion.span>
                  </motion.h1>
                </div>

                {/* Description */}
                <FloatingElement delay={0.6}>
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                    {t('landing.hero.description')}
                  </p>
                </FloatingElement>

                {/* Statistiques avec animations */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="grid grid-cols-3 gap-6 py-6"
                >
                  {[
                    { value: 500, suffix: '+', label: t('landing.hero.stats.schools'), color: 'blue' },
                    { value: 50, suffix: 'k+', label: t('landing.hero.stats.students'), color: 'indigo' },
                    { value: 98, suffix: '%', label: t('landing.hero.stats.satisfaction'), color: 'green' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="text-center group cursor-pointer"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 1.0 + index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{
                        scale: 1.05,
                        y: -5
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className={`text-2xl font-bold ${
                          stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          stat.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
                          'text-green-600 dark:text-green-400'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                      >
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2 + index * 0.3} />
                      </motion.div>
                      <motion.div
                        className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                      >
                        {stat.label}
                      </motion.div>

                      {/* Ligne de progression animée */}
                      <motion.div
                        className={`mt-2 h-1 rounded-full ${
                          stat.color === 'blue' ? 'bg-blue-200 dark:bg-blue-800' :
                          stat.color === 'indigo' ? 'bg-indigo-200 dark:bg-indigo-800' :
                          'bg-green-200 dark:bg-green-800'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 1.6 + index * 0.1 }}
                      >
                        <motion.div
                          className={`h-full rounded-full ${
                            stat.color === 'blue' ? 'bg-blue-500' :
                            stat.color === 'indigo' ? 'bg-indigo-500' :
                            'bg-green-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(stat.value, 100)}%` }}
                          transition={{ duration: 1.5, delay: 1.8 + index * 0.1, ease: "easeOut" }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Boutons d'action avec animations avancées */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  {/* Bouton principal */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <Link to="/register">
                      <motion.button
                        className="relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg flex items-center"
                        whileHover={{
                          boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)"
                        }}
                      >
                        {/* Effet de brillance au hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />

                        {/* Contenu du bouton */}
                        <motion.div
                          className="relative z-10 flex items-center"
                          whileHover={{ x: 2 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Zap className="w-5 h-5 mr-2" />
                          </motion.div>
                          {t('landing.hero.cta.primary')}
                          <motion.div
                            className="ml-2"
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </motion.div>
                        </motion.div>
                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Bouton secondaire */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <motion.button
                      onClick={videoModal.openModal}
                      className="relative px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-200 flex items-center overflow-hidden"
                      whileHover={{
                        borderColor: "rgb(59 130 246)",
                        color: "rgb(59 130 246)",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                      }}
                    >
                        {/* Background hover effect */}
                        <motion.div
                          className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Contenu du bouton */}
                        <div className="relative z-10 flex items-center">
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{
                              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity }
                            }}
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                          </motion.div>
                          {t('landing.hero.cta.secondary')}
                        </div>
                      </motion.button>
                  </motion.div>
                </motion.div>

                {/* Badge de confiance */}
                <FloatingElement delay={1.2}>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      {t('landing.hero.trust.secured')}
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {t('landing.hero.trust.certified')}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {t('landing.hero.trust.support')}
                    </div>
                  </div>
                </FloatingElement>

              </div>

              {/* Colonne de droite - Visuel animé */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1.4 }}
                className="relative"
              >
                {/* Mockup Dashboard avec animations */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {/* Header du mockup avec animation */}
                    <motion.div
                      className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      <div className="flex items-center space-x-2">
                        {['red', 'yellow', 'green'].map((color, index) => (
                          <motion.div
                            key={color}
                            className={`w-3 h-3 bg-${color}-400 rounded-full`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 1.7 + index * 0.1,
                              type: "spring",
                              stiffness: 500
                            }}
                            whileHover={{ scale: 1.2 }}
                          />
                        ))}
                        <motion.div
                          className="ml-4 text-sm text-gray-500 dark:text-gray-400"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.0 }}
                        >
                          {t('landing.mockup.dashboard')}
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Contenu du mockup avec animations séquentielles */}
                    <div className="p-6 space-y-4">
                      {/* Header section */}
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.1 }}
                      >
                        <motion.div
                          className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-32"
                          animate={{
                            backgroundColor: ['rgb(229 231 235)', 'rgb(209 213 219)', 'rgb(229 231 235)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="h-8 bg-blue-100 dark:bg-blue-900 rounded w-24"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        />
                      </motion.div>

                      {/* Cards grid */}
                      <motion.div
                        className="grid grid-cols-3 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.3 }}
                      >
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 2.4 + i * 0.1,
                              type: "spring",
                              stiffness: 200
                            }}
                            whileHover={{ y: -2, scale: 1.02 }}
                          >
                            <motion.div
                              className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-2"
                              animate={{ width: ['4rem', '3rem', '4rem'] }}
                              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                            />
                            <motion.div
                              className={`h-6 rounded w-12 ${
                                i === 1 ? 'bg-blue-200 dark:bg-blue-800' :
                                i === 2 ? 'bg-green-200 dark:bg-green-800' :
                                'bg-purple-200 dark:bg-purple-800'
                              }`}
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            />
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* List items */}
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.7 }}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2.8 + i * 0.1 }}
                            whileHover={{ x: 4 }}
                          >
                            <motion.div
                              className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full"
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5
                              }}
                            />
                            <div className="flex-1">
                              <motion.div
                                className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-1"
                                style={{ width: `${60 + i * 5}%` }}
                                animate={{ opacity: [0.6, 1, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                              />
                              <motion.div
                                className="h-2 bg-gray-100 dark:bg-gray-700 rounded"
                                style={{ width: `${40 + i * 3}%` }}
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  {/* Éléments flottants animés autour du mockup */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <CheckCircle className="w-6 h-6" />
                  </motion.div>

                  <motion.div
                    animate={{
                      y: [0, 15, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      delay: 1,
                      ease: "easeInOut"
                    }}
                    className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                  >
                    <TrendingUp className="w-6 h-6" />
                  </motion.div>

                  {/* Particule de notification */}
                  <motion.div
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 2
                    }}
                    className="absolute top-1/4 -right-8 bg-red-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>

            </div>
          </div>
        </motion.div>

      </section>


      {/* Features Section Élégante */}
      <section className="relative py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-200 overflow-hidden">
        {/* Éléments décoratifs de fond */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-10 right-10 w-64 h-64 border border-blue-100/30 dark:border-blue-800/30 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.9, 1]
            }}
            transition={{
              rotate: { duration: 45, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }
            }}
            className="absolute bottom-10 left-10 w-48 h-48 border border-indigo-100/20 dark:border-indigo-800/20 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de section avec animations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4 mr-2" />
              {t('landing.features.badge')}
            </motion.div>

            <motion.h2
              className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block">{t('landing.features.title.part1')}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {t('landing.features.title.part2')}
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t('landing.features.subtitle')}
            </motion.p>
          </motion.div>

          {/* Grille de fonctionnalités avec animations sophistiquées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: t('landing.features.student.title'),
                description: t('landing.features.student.description'),
                color: 'blue',
                gradient: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                borderColor: 'border-blue-200 dark:border-blue-700',
                textColor: 'text-blue-600 dark:text-blue-400',
                detailLink: '/features/student-management'
              },
              {
                icon: Calendar,
                title: t('landing.features.planning.title'),
                description: t('landing.features.planning.description'),
                color: 'green',
                gradient: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                borderColor: 'border-green-200 dark:border-green-700',
                textColor: 'text-green-600 dark:text-green-400',
                detailLink: '/features/smart-scheduling'
              },
              {
                icon: Car,
                title: t('landing.features.vehicles.title'),
                description: t('landing.features.vehicles.description'),
                color: 'orange',
                gradient: 'from-orange-500 to-orange-600',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                borderColor: 'border-orange-200 dark:border-orange-700',
                textColor: 'text-orange-600 dark:text-orange-400',
                detailLink: '/features/fleet-management'
              },
              {
                icon: CheckCircle,
                title: t('landing.features.exams.title'),
                description: t('landing.features.exams.description'),
                color: 'purple',
                gradient: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                borderColor: 'border-purple-200 dark:border-purple-700',
                textColor: 'text-purple-600 dark:text-purple-400',
                detailLink: '/features/exams-evaluations'
              },
              {
                icon: Phone,
                title: t('landing.features.communication.title'),
                description: t('landing.features.communication.description'),
                color: 'pink',
                gradient: 'from-pink-500 to-pink-600',
                bgColor: 'bg-pink-50 dark:bg-pink-900/20',
                borderColor: 'border-pink-200 dark:border-pink-700',
                textColor: 'text-pink-600 dark:text-pink-400',
                detailLink: '/features/communication'
              },
              {
                icon: TrendingUp,
                title: t('landing.features.reports.title'),
                description: t('landing.features.reports.description'),
                color: 'indigo',
                gradient: 'from-indigo-500 to-indigo-600',
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                borderColor: 'border-indigo-200 dark:border-indigo-700',
                textColor: 'text-indigo-600 dark:text-indigo-400',
                detailLink: '/features/reports-analytics'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group cursor-pointer"
              >
                <div className={`relative h-full p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 ${feature.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>

                  {/* Effet de fond au hover */}
                  <motion.div
                    className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    initial={false}
                  />

                  {/* Particule décorative */}
                  <motion.div
                    className={`absolute top-4 right-4 w-2 h-2 ${feature.textColor.replace('text-', 'bg-')} rounded-full`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icône avec animation */}
                    <motion.div
                      className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg`}
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        animate={{
                          rotate: feature.color === 'blue' ? [0, 5, 0] :
                                 feature.color === 'green' ? [0, -5, 0] :
                                 feature.color === 'orange' ? [0, 10, 0] :
                                 feature.color === 'purple' ? [0, -10, 0] :
                                 feature.color === 'pink' ? [0, 8, 0] :
                                 [0, -8, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      >
                        <feature.icon className="w-8 h-8" />
                      </motion.div>
                    </motion.div>

                    {/* Titre avec animation */}
                    <motion.h3
                      className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>

                    {/* Description avec animation */}
                    <motion.p
                      className="text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      {feature.description}
                    </motion.p>

                    {/* Lien En savoir plus clickable */}
                    <Link to={feature.detailLink}>
                      <motion.div
                        className={`mt-6 flex items-center ${feature.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer`}
                        initial={{ x: -10 }}
                        whileHover={{ x: 0 }}
                      >
                        <span className="text-sm font-medium mr-2">{t('landing.features.learn.more')}</span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </Link>
                  </div>

                  {/* Effet de bordure animée */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 ${feature.textColor.replace('text-', 'border-')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    initial={false}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section Moderne */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Éléments décoratifs animés */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-20 -right-20 w-96 h-96 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.8, 1]
            }}
            transition={{
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }
            }}
            className="absolute -bottom-20 -left-20 w-80 h-80 border border-white/5 rounded-full"
          />

          {/* Particules flottantes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header avec animations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6"
            >
              <Award className="w-4 h-4 mr-2" />
              {t('landing.stats.badge')}
            </motion.div>

            <motion.h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block">{t('landing.stats.title.part1')}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                {t('landing.stats.title.part2')}
              </span>
            </motion.h2>

            <motion.p
              className="text-xl text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t('landing.testimonials.subtitle')}
            </motion.p>
          </motion.div>

          {/* Statistiques avec animations avancées */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: 500, suffix: '+', label: t('landing.stats.schools'), icon: Users, color: 'from-blue-400 to-blue-300' },
              { number: 50, suffix: 'k+', label: t('landing.stats.active_students'), icon: Star, color: 'from-green-400 to-green-300' },
              { number: 1200, suffix: '+', label: t('landing.stats.instructors'), icon: Award, color: 'from-yellow-400 to-yellow-300' },
              { number: 98, suffix: '%', label: t('landing.stats.satisfaction'), icon: TrendingUp, color: 'from-pink-400 to-pink-300' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: 0.7 + index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  y: -10,
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="text-center group cursor-pointer"
              >
                <div className="relative">
                  {/* Cercle de fond animé */}
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />

                  {/* Icône avec gradient */}
                  <motion.div
                    className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.8
                      }}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Nombre avec compteur animé */}
                  <motion.div
                    className="text-4xl font-bold mb-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1 }}
                  >
                    <AnimatedCounter
                      end={stat.number}
                      suffix={stat.suffix}
                      duration={2 + index * 0.3}
                    />
                  </motion.div>

                  {/* Label avec animation */}
                  <motion.p
                    className="text-blue-100 font-medium group-hover:text-white transition-colors"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    {stat.label}
                  </motion.p>

                  {/* Ligne de progression */}
                  <motion.div
                    className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ duration: 1, delay: 1.4 + index * 0.1 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(stat.number, 100)}%` }}
                      transition={{ duration: 1.5, delay: 1.6 + index * 0.1, ease: "easeOut" }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Spectaculaire */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white overflow-hidden">
        {/* Éléments décoratifs animés */}
        <div className="absolute inset-0">
          {/* Cercles animés */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-10 left-10 w-72 h-72 border-2 border-white/20 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.7, 1],
              opacity: [0.05, 0.2, 0.05]
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 },
              opacity: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
            className="absolute bottom-10 right-10 w-96 h-96 border border-white/10 rounded-full"
          />

          {/* Particules magiques */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              style={{
                left: `${5 + i * 8}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [0, -60, 0],
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Effet de vague */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge animé */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 border border-white/20"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
            </motion.div>
            {t('landing.cta.badge')}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2"
            >
              🎉
            </motion.div>
          </motion.div>

          {/* Titre principal avec animations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <motion.h2
              className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block">{t('landing.cta.title.part1')}</span>
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                {t('landing.cta.title.part2')}
              </motion.span>
              <span className="block">{t('landing.cta.title.part3')}</span>
            </motion.h2>

            <motion.p
              className="text-xl lg:text-2xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t('landing.cta.description')}
              <span className="text-yellow-300 font-semibold"> {t('landing.cta.no_credit_card')}</span>
            </motion.p>
          </motion.div>

          {/* Boutons d'action avec animations spectaculaires */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            {/* Bouton principal */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <Link to="/register">
                <motion.button
                  className="relative overflow-hidden px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-full shadow-2xl flex items-center"
                  whileHover={{
                    boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.4)"
                  }}
                >
                  {/* Effet de brillance */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Contenu du bouton */}
                  <div className="relative z-10 flex items-center">
                    <motion.div
                      animate={{
                        rotate: [0, 15, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-6 h-6 mr-3" />
                    </motion.div>
                    {t('landing.cta.start_free')}
                    <motion.div
                      className="ml-3"
                      whileHover={{ x: 6 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.button>
              </Link>
            </motion.div>

            {/* Bouton secondaire */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <Link to="/contact">
                <motion.button
                  className="relative px-10 py-5 border-2 border-white/50 text-white font-semibold text-lg rounded-full backdrop-blur-sm transition-all duration-300 flex items-center overflow-hidden"
                  whileHover={{
                    borderColor: "rgba(255, 255, 255, 1)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}
                >
                  {/* Background hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="relative z-10 flex items-center">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Phone className="w-6 h-6 mr-3" />
                    </motion.div>
                    {t('landing.cta.contact_us')}
                  </div>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Garanties et badges de confiance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-wrap justify-center items-center gap-8 text-sm text-green-100"
          >
            {[
              { icon: Shield, text: t('landing.trust.ssl_secured') },
              { icon: CheckCircle, text: t('landing.trust.no_commitment') },
              { icon: Clock, text: t('landing.trust.support_24_7') },
              { icon: Award, text: t('landing.trust.satisfaction_guarantee') }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Footer Élégant */}
      <footer className="relative bg-gray-900 dark:bg-gray-950 text-white py-16 transition-colors duration-200 overflow-hidden">
        {/* Éléments décoratifs subtils */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 12, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-20 -right-20 w-64 h-64 border border-gray-700/30 rounded-full"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 0.9, 1]
            }}
            transition={{
              rotate: { duration: 80, repeat: Infinity, ease: "linear" },
              scale: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }
            }}
            className="absolute -bottom-20 -left-20 w-48 h-48 border border-gray-700/20 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Logo et description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:col-span-1"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Logo size="md" variant="light" />
              </motion.div>
              <motion.p
                className="mt-4 text-gray-400 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {t('footer.description')}
              </motion.p>

              {/* Réseaux sociaux avec vraies icônes */}
              <motion.div
                className="mt-6 flex space-x-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  {
                    name: 'Facebook',
                    icon: FaFacebookF,
                    href: 'https://facebook.com/permini.tn',
                    color: 'hover:bg-blue-600',
                    bgColor: 'bg-blue-600/10 hover:bg-blue-600'
                  },
                  {
                    name: 'Instagram',
                    icon: FaInstagram,
                    href: 'https://instagram.com/permini.tn',
                    color: 'hover:bg-pink-600',
                    bgColor: 'bg-pink-600/10 hover:bg-pink-600'
                  },
                  {
                    name: 'LinkedIn',
                    icon: FaLinkedinIn,
                    href: 'https://linkedin.com/company/permini',
                    color: 'hover:bg-blue-700',
                    bgColor: 'bg-blue-700/10 hover:bg-blue-700'
                  },
                  {
                    name: 'YouTube',
                    icon: FaYoutube,
                    href: 'https://youtube.com/@permini',
                    color: 'hover:bg-red-600',
                    bgColor: 'bg-red-600/10 hover:bg-red-600'
                  },
                  {
                    name: 'TikTok',
                    icon: FaTiktok,
                    href: 'https://tiktok.com/@permini.tn',
                    color: 'hover:bg-gray-900',
                    bgColor: 'bg-gray-900/10 hover:bg-gray-900'
                  }
                ].map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-11 h-11 ${social.bgColor} rounded-full flex items-center justify-center transition-all duration-300 group`}
                    whileHover={{
                      scale: 1.15,
                      y: -3,
                      rotate: [0, -5, 5, 0]
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.6 + index * 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.8
                      }}
                    >
                      <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Colonnes de liens */}
            {[
              {
                title: t('footer.product'),
                links: [
                  { name: t('footer.features'), href: '/features' },
                  { name: t('footer.pricing'), href: '/pricing' },
                  { name: t('footer.demo'), href: '/demo' },
                  { name: t('footer.support'), href: '/support' }
                ]
              },
              {
                title: t('footer.company'),
                links: [
                  { name: t('footer.about'), href: '/about' },
                  { name: t('footer.blog'), href: '/blog' },
                  { name: t('footer.careers'), href: '/careers' },
                  { name: t('footer.contact'), href: '/contact' }
                ]
              },
              {
                title: t('footer.contact'),
                links: [
                  { name: '+216 70 123 456', href: 'tel:+21670123456', icon: Phone },
                  { name: 'contact@permini.tn', href: 'mailto:contact@permini.tn', icon: Mail },
                  { name: 'Tunis, Tunisie', href: '#', icon: MapPin }
                ]
              }
            ].map((column, columnIndex) => (
              <motion.div
                key={column.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + columnIndex * 0.1 }}
              >
                <motion.h3
                  className="text-lg font-semibold mb-6 text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 + columnIndex * 0.1 }}
                >
                  {column.title}
                </motion.h3>

                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + columnIndex * 0.1 + linkIndex * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 group"
                      >
                        {link.icon && (
                          <motion.div
                            className="mr-3"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <link.icon className="h-4 w-4" />
                          </motion.div>
                        )}
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Ligne de séparation animée */}
          <motion.div
            className="mt-12 pt-8 border-t border-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
          </motion.div>

          {/* Copyright et liens légaux */}
          <motion.div
            className="mt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <motion.p
              whileHover={{ scale: 1.02 }}
              className="mb-4 md:mb-0"
            >
              {t('footer.copyright')}
            </motion.p>

            <motion.div
              className="flex space-x-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              {[t('footer.privacy'), t('footer.terms'), t('footer.cookies')].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 + index * 0.1 }}
                >
                  {item}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </footer>

      {/* Modal Vidéo Demo */}
      <VideoModal
        isOpen={videoModal.isOpen}
        onClose={videoModal.closeModal}
        videoId={DEMO_VIDEO_ID}
        title="Démonstration Permini - Plateforme Auto-École"
      />

    </div>
  );
};