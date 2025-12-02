import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropertyData, SavingsOpportunity, PrioritizedPlan, SessionData } from '@/types/property';
import { loadSession, saveSession, clearSession } from '@/utils/sessionManager';

interface PropertyContextType {
  propertyData: PropertyData | null;
  opportunities: SavingsOpportunity[];
  prioritizedPlan: PrioritizedPlan | null;
  sessionId: string | null;
  setPropertyData: (data: PropertyData) => void;
  setOpportunities: (opportunities: SavingsOpportunity[]) => void;
  setPrioritizedPlan: (plan: PrioritizedPlan) => void;
  setSessionId: (id: string) => void;
  resetSession: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [propertyData, setPropertyDataState] = useState<PropertyData | null>(null);
  const [opportunities, setOpportunitiesState] = useState<SavingsOpportunity[]>([]);
  const [prioritizedPlan, setPrioritizedPlanState] = useState<PrioritizedPlan | null>(null);
  const [sessionId, setSessionIdState] = useState<string | null>(null);

  // Load session on mount
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setPropertyDataState(session.propertyData);
      setOpportunitiesState(session.opportunities);
      setPrioritizedPlanState(session.prioritizedPlan);
      // Load session ID from localStorage if available
      const storedSessionId = localStorage.getItem('hocs_session_id');
      if (storedSessionId) {
        setSessionIdState(storedSessionId);
      }
    }
  }, []);

  const setSessionId = (id: string) => {
    setSessionIdState(id);
    localStorage.setItem('hocs_session_id', id);
  };

  const setPropertyData = (data: PropertyData) => {
    setPropertyDataState(data);
    const session: SessionData = {
      propertyData: data,
      opportunities,
      prioritizedPlan,
      timestamp: Date.now()
    };
    saveSession(session);
  };

  const setOpportunities = (opps: SavingsOpportunity[]) => {
    setOpportunitiesState(opps);
    const session: SessionData = {
      propertyData,
      opportunities: opps,
      prioritizedPlan,
      timestamp: Date.now()
    };
    saveSession(session);
  };

  const setPrioritizedPlan = (plan: PrioritizedPlan) => {
    setPrioritizedPlanState(plan);
    const session: SessionData = {
      propertyData,
      opportunities,
      prioritizedPlan: plan,
      timestamp: Date.now()
    };
    saveSession(session);
  };

  const resetSession = () => {
    setPropertyDataState(null);
    setOpportunitiesState([]);
    setPrioritizedPlanState(null);
    setSessionIdState(null);
    clearSession();
    localStorage.removeItem('hocs_session_id');
  };

  return (
    <PropertyContext.Provider
      value={{
        propertyData,
        opportunities,
        prioritizedPlan,
        sessionId,
        setPropertyData,
        setOpportunities,
        setPrioritizedPlan,
        setSessionId,
        resetSession
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within PropertyProvider');
  }
  return context;
};