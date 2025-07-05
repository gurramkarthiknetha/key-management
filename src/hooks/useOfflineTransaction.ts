import { useState } from 'react';
import { OfflineTransaction } from '@/types';
import { useAuthenticatedFetch } from '@/lib/auth-context';
import toast from 'react-hot-toast';

interface TransactionData {
  keyId: string;
  userId?: string;
  location?: string;
  notes?: string;
  duration?: number;
  condition?: string;
}

interface UseOfflineTransactionReturn {
  submitTransaction: (type: 'check_out' | 'check_in', data: TransactionData) => Promise<boolean>;
  isSubmitting: boolean;
  isOffline: boolean;
}

export function useOfflineTransaction(): UseOfflineTransactionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authenticatedFetch = useAuthenticatedFetch();
  const [isOffline, setIsOffline] = useState(false);

  const submitTransaction = async (
    type: 'check_out' | 'check_in',
    data: TransactionData
  ): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Dynamically import sync manager to avoid SSR issues
      const { syncManager } = await import('@/lib/sync-manager');
      const connectionAvailable = syncManager.isConnectionAvailable();
      setIsOffline(!connectionAvailable);

      if (connectionAvailable) {
        // Online - submit directly
        const success = await submitOnlineTransaction(type, data);
        if (success) {
          toast.success(`Key ${type === 'check_out' ? 'checked out' : 'checked in'} successfully`);
          return true;
        }
        return false;
      } else {
        // Offline - queue for later sync
        const success = await submitOfflineTransaction(type, data);
        if (success) {
          toast.success(
            `Transaction saved offline. Will sync when connection is restored.`,
            { duration: 6000 }
          );
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Transaction submission failed:', error);

      // If online submission fails, try to save offline as fallback
      try {
        const { syncManager } = await import('@/lib/sync-manager');
        if (syncManager.isConnectionAvailable()) {
          toast.error('Online submission failed. Saving offline...');
          try {
            const success = await submitOfflineTransaction(type, data);
            if (success) {
              toast.success('Transaction saved offline as fallback');
              return true;
            }
          } catch (offlineError) {
            console.error('Offline fallback also failed:', offlineError);
          }
        }
      } catch (importError) {
        console.error('Failed to import sync manager:', importError);
      }

      toast.error('Failed to submit transaction');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOnlineTransaction = async (
    type: 'check_out' | 'check_in',
    data: TransactionData
  ): Promise<boolean> => {
    try {
      let endpoint = '';
      let body: any = {};

      if (type === 'check_out') {
        endpoint = '/api/keys/checkout';
        body = {
          keyId: data.keyId,
          userId: data.userId,
          location: data.location,
          notes: data.notes,
          duration: data.duration || 24
        };
      } else {
        endpoint = '/api/keys/checkin';
        body = {
          keyId: data.keyId,
          location: data.location,
          notes: data.notes,
          condition: data.condition || 'good'
        };
      }

      const response = await authenticatedFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Online transaction failed:', error);
      throw error;
    }
  };

  const submitOfflineTransaction = async (
    type: 'check_out' | 'check_in',
    data: TransactionData
  ): Promise<boolean> => {
    try {
      const transaction: Omit<OfflineTransaction, 'id' | 'synced'> = {
        type,
        keyId: data.keyId,
        userId: data.userId || '',
        timestamp: new Date(),
        location: data.location,
        notes: data.notes,
        duration: data.duration,
        condition: data.condition
      };

      // Dynamically import sync manager to avoid SSR issues
      const { syncManager } = await import('@/lib/sync-manager');
      const transactionId = await syncManager.queueTransaction(transaction);
      console.log('Offline transaction queued:', transactionId);
      return true;
    } catch (error) {
      console.error('Failed to queue offline transaction:', error);
      throw error;
    }
  };

  return {
    submitTransaction,
    isSubmitting,
    isOffline
  };
}
