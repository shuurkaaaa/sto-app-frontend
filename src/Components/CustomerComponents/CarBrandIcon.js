import React from 'react';
import { customerStyles } from './CustomerStyles';

export const CarBrandIcon = ({ brandName }) => {
  const getBrandText = (name) => {
    const brand = name.toLowerCase();
    if (brand.includes('bmw')) return 'BMW';
    if (brand.includes('mercedes')) return 'MB';
    if (brand.includes('audi')) return 'AU';
    if (brand.includes('toyota')) return 'TY';
    if (brand.includes('skoda')) return 'SK';
    if (brand.includes('volkswagen') || brand.includes('vw')) return 'VW';
    return 'CR';
  };

  return (
    <div style={customerStyles.brandIcon}>
      {getBrandText(brandName)}
    </div>
  );
};