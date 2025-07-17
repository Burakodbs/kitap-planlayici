import { useState, useEffect, useCallback } from 'react';
import { Goals } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_GOALS } from '../constants';

export const useGoals = () => {
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load goals from storage on mount
  useEffect(() => {
    try {
      const savedGoals = storageService.getGoals();
      setGoals(savedGoals);
    } catch (err) {
      setError('Failed to load goals from storage');
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save goals to storage whenever goals change
  useEffect(() => {
    if (!loading) {
      try {
        storageService.saveGoals(goals);
      } catch (err) {
        setError('Failed to save goals to storage');
        console.error('Error saving goals:', err);
      }
    }
  }, [goals, loading]);

  const updateGoals = useCallback((newGoals: Partial<Goals>) => {
    setGoals(prevGoals => {
      const updatedGoals = {
        ...prevGoals,
        ...newGoals,
      };

      // Validate goals
      if (updatedGoals.monthly.books < 0 || updatedGoals.monthly.pages < 0 ||
          updatedGoals.weekly.books < 0 || updatedGoals.weekly.pages < 0) {
        setError('Hedefler negatif olamaz');
        return prevGoals;
      }

      if (updatedGoals.weekly.books > updatedGoals.monthly.books ||
          updatedGoals.weekly.pages > updatedGoals.monthly.pages) {
        setError('Haftalık hedefler aylık hedeflerden büyük olamaz');
        return prevGoals;
      }

      return updatedGoals;
    });
  }, []);

  const updateMonthlyGoals = useCallback((monthlyGoals: Partial<Goals['monthly']>) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      monthly: { ...prevGoals.monthly, ...monthlyGoals },
    }));
  }, []);

  const updateWeeklyGoals = useCallback((weeklyGoals: Partial<Goals['weekly']>) => {
    setGoals(prevGoals => ({
      ...prevGoals,
      weekly: { ...prevGoals.weekly, ...weeklyGoals },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setGoals(DEFAULT_GOALS);
    setError(null);
  }, []);

  const validateGoals = useCallback((goalsToValidate: Goals): string[] => {
    const errors: string[] = [];

    if (goalsToValidate.monthly.books <= 0) {
      errors.push('Aylık kitap hedefi pozitif bir sayı olmalıdır');
    }

    if (goalsToValidate.monthly.pages <= 0) {
      errors.push('Aylık sayfa hedefi pozitif bir sayı olmalıdır');
    }

    if (goalsToValidate.weekly.books <= 0) {
      errors.push('Haftalık kitap hedefi pozitif bir sayı olmalıdır');
    }

    if (goalsToValidate.weekly.pages <= 0) {
      errors.push('Haftalık sayfa hedefi pozitif bir sayı olmalıdır');
    }

    if (goalsToValidate.weekly.books > goalsToValidate.monthly.books) {
      errors.push('Haftalık kitap hedefi aylık hedeften büyük olamaz');
    }

    if (goalsToValidate.weekly.pages > goalsToValidate.monthly.pages) {
      errors.push('Haftalık sayfa hedefi aylık hedeften büyük olamaz');
    }

    // Check if goals are realistic
    if (goalsToValidate.monthly.books > 50) {
      errors.push('Aylık 50 kitaptan fazla hedef gerçekçi görünmüyor');
    }

    if (goalsToValidate.monthly.pages > 10000) {
      errors.push('Aylık 10,000 sayfadan fazla hedef gerçekçi görünmüyor');
    }

    return errors;
  }, []);

  const getDailyTargets = useCallback(() => {
    return {
      pages: Math.ceil(goals.weekly.pages / 7),
      books: goals.weekly.books / 7, // This will be a decimal
    };
  }, [goals]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    goals,
    loading,
    error,
    updateGoals,
    updateMonthlyGoals,
    updateWeeklyGoals,
    resetToDefaults,
    validateGoals,
    getDailyTargets,
    clearError,
  };
};