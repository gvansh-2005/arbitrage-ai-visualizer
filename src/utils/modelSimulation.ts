
import {
  ArbitrageDataPoint,
  AgentAction,
  AgentCommunication,
  PerformanceMetrics,
  generateSampleData,
  identifyArbitrageOpportunities,
  simulateAgentActions,
  generateAgentCommunications,
  calculatePerformanceMetrics
} from './dataGenerator';
import { multiAgentSystem, AgentAction as TransformerAgentAction } from './transformerAgents';

export interface ModelState {
  isTraining: boolean;
  isModelReady: boolean;
  trainProgress: number;
  epochsCompleted: number;
  totalEpochs: number;
  currentReward: number;
  cumulativeReward: number;
  learningRate: number;
  timestamp: number;
}

export interface SimulationState {
  dataLoaded: boolean;
  isProcessing: boolean;
  rawData: ArbitrageDataPoint[];
  actions: AgentAction[];
  communications: AgentCommunication[];
  metrics: PerformanceMetrics | null;
  modelState: ModelState;
}

// Initialize simulation state
export const initSimulationState = (): SimulationState => ({
  dataLoaded: false,
  isProcessing: false,
  rawData: [],
  actions: [],
  communications: [],
  metrics: null,
  modelState: {
    isTraining: false,
    isModelReady: false,
    trainProgress: 0,
    epochsCompleted: 0,
    totalEpochs: 100,
    currentReward: 0,
    cumulativeReward: 0,
    learningRate: 0.001,
    timestamp: Date.now()
  }
});

// Process uploaded data or generate sample data
export const processData = async (
  data?: ArbitrageDataPoint[]
): Promise<SimulationState> => {
  // If no data provided, generate sample data
  const rawData = data || generateSampleData(3, 100);
  
  // Process the data through our pipeline
  const opportunities = identifyArbitrageOpportunities(rawData);
  const actions = simulateAgentActions(opportunities);
  const communications = generateAgentCommunications(actions);
  const metrics = calculatePerformanceMetrics(actions);
  
  // Return processed state
  return {
    dataLoaded: true,
    isProcessing: false,
    rawData,
    actions,
    communications,
    metrics,
    modelState: {
      isTraining: false,
      isModelReady: true,
      trainProgress: 100,
      epochsCompleted: 100,
      totalEpochs: 100,
      currentReward: metrics.netProfit / 100,
      cumulativeReward: metrics.netProfit,
      learningRate: 0.0001,
      timestamp: Date.now()
    }
  };
};

// Convert transformer agent actions to dataGenerator-compatible format
const convertTransformerActionsToDataFormat = (
  actions: TransformerAgentAction[],
  exchangeMapping: Record<string, string>
): AgentAction[] => {
  return actions.map((action, index) => {
    const exchange = action.exchangeId || Object.values(exchangeMapping)[index % Object.values(exchangeMapping).length];
    const agentId = `Agent_${exchange}`;
    
    // Calculate profit based on action type and confidence
    const baseProfit = action.type === 'buy' ? 0 : action.price * action.volume * action.confidence;
    const impact = action.type === 'hold' ? 0 : 0.01 * action.volume;
    
    return {
      timestamp: action.timestamp,
      agent: agentId,
      exchange: exchange,
      action: action.type,
      volume: action.volume,
      price: action.price,
      profit: baseProfit,
      impact: impact,
      netProfit: baseProfit - (impact * action.volume)
    };
  });
};

export const trainModel = async (
  rawData: ArbitrageDataPoint[],
  epochs: number = 100,
  progressCallback?: (progress: number) => void
): Promise<SimulationState> => {
  // Initialize model state
  const modelState: ModelState = {
    isTraining: true,
    isModelReady: false,
    trainProgress: 0,
    epochsCompleted: 0,
    totalEpochs: epochs,
    currentReward: 0,
    cumulativeReward: 0,
    learningRate: 0.001,
    timestamp: Date.now()
  };

  // Convert raw data to agent observations
  const observations = rawData.map(data => ({
    timestamp: data.timestamp,
    price: data.price,
    volume: data.volume,
    liquidity: data.liquidity_level, // Use liquidity_level property which exists on ArbitrageDataPoint
    spread: Math.abs(data.ask - data.bid),
    exchangeId: data.exchange_id
  }));

  // Map exchanges to their IDs for conversion later
  const exchangeMapping: Record<string, string> = {};
  rawData.forEach(data => {
    exchangeMapping[data.exchange_id] = data.exchange_id;
  });

  // Process data through transformer agents
  const transformerActions = await multiAgentSystem.processMarketData(observations);
  
  // Convert transformer actions to dataGenerator compatible format
  const compatibleActions = convertTransformerActionsToDataFormat(transformerActions, exchangeMapping);
  
  // Generate communications and calculate metrics
  const communications = generateAgentCommunications(compatibleActions);
  const metrics = calculatePerformanceMetrics(compatibleActions);

  // Return final state
  return {
    dataLoaded: true,
    isProcessing: false,
    rawData,
    actions: compatibleActions,
    communications,
    metrics,
    modelState: {
      ...modelState,
      isTraining: false,
      isModelReady: true,
      trainProgress: 100,
      epochsCompleted: epochs,
      currentReward: metrics.netProfit / epochs,
      cumulativeReward: metrics.netProfit
    }
  };
};

// Simulates the training of a multi-agent transformer model
// export const trainModel = async (
//   rawData: ArbitrageDataPoint[],
//   epochs: number = 100,
//   progressCallback?: (progress: number) => void
// ): Promise<SimulationState> => {
//   // Initialize model state
//   const modelState: ModelState = {
//     isTraining: true,
//     isModelReady: false,
//     trainProgress: 0,
//     epochsCompleted: 0,
//     totalEpochs: epochs,
//     currentReward: 0,
//     cumulativeReward: 0,
//     learningRate: 0.001,
//     timestamp: Date.now()
//   };
  
//   // Process data to get base metrics
//   const opportunities = identifyArbitrageOpportunities(rawData);
//   const initialActions = simulateAgentActions(opportunities);
//   const initialMetrics = calculatePerformanceMetrics(initialActions);
  
//   // Simulate training progress
//   let currentActions = initialActions;
//   let currentMetrics = initialMetrics;
//   let communications: AgentCommunication[] = [];
  
//   // Create a promise that resolves when training is complete
//   return new Promise((resolve) => {
//     let epoch = 0;
    
//     const runEpoch = () => {
//       epoch++;
      
//       // Update progress
//       modelState.epochsCompleted = epoch;
//       modelState.trainProgress = (epoch / epochs) * 100;
      
//       // Simulate improving metrics over time with some randomness
//       const improvementFactor = 1 + (Math.log(epoch) / Math.log(epochs)) * 0.3 * (1 + (Math.random() * 0.1 - 0.05));
      
//       // Apply improvement to actions (simulate learning)
//       currentActions = currentActions.map(action => {
//         if (action.action === 'sell') {
//           // Improve profit and reduce impact as training progresses
//           const newImpact = action.impact * (1 - (epoch / epochs) * 0.3);
//           const newProfit = action.profit * improvementFactor;
//           return {
//             ...action,
//             impact: newImpact,
//             profit: newProfit,
//             netProfit: newProfit - (newImpact * action.volume)
//           };
//         }
//         return action;
//       });
      
//       // Recalculate metrics
//       currentMetrics = calculatePerformanceMetrics(currentActions);
      
//       // Generate updated communications
//       if (epoch === epochs) {
//         communications = generateAgentCommunications(currentActions, 200);
//       }
      
//       // Update model state
//       modelState.currentReward = currentMetrics.netProfit / epochs;
//       modelState.cumulativeReward = currentMetrics.netProfit;
//       modelState.learningRate = 0.001 * Math.pow(0.95, epoch / 10);
      
//       // Call progress callback if provided
//       if (progressCallback) {
//         progressCallback(modelState.trainProgress);
//       }
      
//       // Continue or finish
//       if (epoch < epochs) {
//         setTimeout(runEpoch, 10); // Delay for UI responsiveness
//       } else {
//         // Training complete
//         modelState.isTraining = false;
//         modelState.isModelReady = true;
        
//         // Resolve with final state
//         resolve({
//           dataLoaded: true,
//           isProcessing: false,
//           rawData,
//           actions: currentActions,
//           communications,
//           metrics: currentMetrics,
//           modelState
//         });
//       }
//     };
    
//     // Start the first epoch
//     setTimeout(runEpoch, 100);
//   });
// };
