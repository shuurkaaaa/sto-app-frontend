import React from 'react';
import { serviceStyles } from './ServiceStyles';

export const ServiceHeader = () => (
  <div style={serviceStyles.header}>
    <h2 style={serviceStyles.title}>Довідник послуг та цін</h2>
    <p style={serviceStyles.subtitle}>Актуальні тарифи сервісу на сьогодні</p>
  </div>
);