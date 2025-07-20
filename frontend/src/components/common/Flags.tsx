import React from 'react';
import FranceFlagImg from '../../images/Ensign_of_France.png';
import TunisiaFlagImg from '../../images/Flag_of_Tunisia.png';

interface FlagProps {
  className?: string;
}

export const FranceFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
  <img
    src={FranceFlagImg}
    alt="Drapeau France"
    className={`${className} object-cover rounded-sm shadow-sm`}
  />
);

export const TunisiaFlag: React.FC<FlagProps> = ({ className = "w-5 h-4" }) => (
  <img
    src={TunisiaFlagImg}
    alt="Drapeau Tunisie"
    className={`${className} object-cover rounded-sm shadow-sm`}
  />
);

// Composant générique pour sélectionner le bon drapeau
export const Flag: React.FC<{ country: 'fr' | 'tn'; className?: string }> = ({
  country,
  className
}) => {
  switch (country) {
    case 'fr':
      return <FranceFlag className={className} />;
    case 'tn':
      return <TunisiaFlag className={className} />;
    default:
      return null;
  }
};
