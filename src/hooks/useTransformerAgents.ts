
import { useState, useEffect } from 'react';
import { multiAgentSystem, AgentAction, AgentObservation } from '../utils/transformerAgents';
import { useToast } from '@/hooks/use-toast';

export const useTransformerAgents = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastActions, setLastActions] = useState<AgentAction[]>([]);
  const { toast } = useToast();

  const processMarketData = async (observations: AgentObservation[]) => {
    setIsProcessing(true);
    try {
      const actions = await multiAgentSystem.processMarketData(observations);
      setLastActions(actions);
      return actions;
    } catch (error) {
      console.error('Error processing market data:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process market data with transformer agents',
        variant: 'destructive'
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  };

  const getAgentStatus = () => multiAgentSystem.getAgentStates();

  return {
    processMarketData,
    getAgentStatus,
    isProcessing,
    lastActions
  };
};
