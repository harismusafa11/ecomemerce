import { useContext } from 'react';
import { LocaleContext } from '../context/LocaleContext';

export const useTranslations = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LocaleProvider');
  }
  return context;
};
