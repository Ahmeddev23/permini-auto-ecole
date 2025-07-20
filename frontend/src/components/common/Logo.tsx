import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LogoImage from '../../images/permini.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'auto',
  showText = true 
}) => {
  const { isDark } = useTheme();
  const { t, currentLanguage } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const getColorClasses = () => {
    if (variant === 'light') return 'text-white';
    if (variant === 'dark') return 'text-blue-600';
    return isDark ? 'text-white' : 'text-blue-600';
  };

  const colorClasses = getColorClasses();

  return (
    <div className={`flex items-center ${
      currentLanguage.code === 'ar'
        ? 'space-x-reverse space-x-3'
        : 'space-x-3'
    }`}>
      <img
        src={LogoImage}
        alt={t('logo.alt')}
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${colorClasses} bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent`}>
          {t('brand.name')}
        </span>
      )}
    </div>
  );
};