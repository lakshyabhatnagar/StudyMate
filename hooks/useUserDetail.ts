import { useContext } from 'react';
import { UserDetailContext, UserDetailContextType } from '@/context/UserDetailContext';

export function useUserDetail(): UserDetailContextType {
  const context = useContext(UserDetailContext);
  
  if (!context) {
    throw new Error('useUserDetail must be used within a UserDetailContext.Provider');
  }
  
  return context;
}