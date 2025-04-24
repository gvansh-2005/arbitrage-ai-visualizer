import { pipeline, env } from '@huggingface/transformers';

// Enable WebGPU and configure environment
env.useBrowserCache = true;
env.backends.onnx.wasm.numThreads = 4;
env.huggingFaceAccessToken = process.env.HUGGING_FACE_ACCESS_TOKEN;

export interface AgentObservation {
  timestamp: number;
  price: number;
  volume: number;
  liquidity: number;
  spread: number;
  exchangeId: string;
}

export interface AgentAction {
  type: 'buy' | 'sell' | 'hold';
  volume: number;
  price: number;
  timestamp: number;
  confidence: number;
  exchangeId: string; // Added exchangeId to track which exchange this action is for
}

export interface TransformerAgent {
  id: string;
  exchange: string;
  model: any;
  history: AgentObservation[];
}

export class MultiAgentArbitrageSystem {
  private agents: Map<string, TransformerAgent> = new Map();
  private featureExtractor: any;
  
  constructor() {
    this.initializeSystem();
  }

  private async initializeSystem() {
    try {
      // Initialize feature extractor with auth token
      this.featureExtractor = await pipeline(
        'feature-extraction',
        'mixedbread-ai/mxbai-embed-xsmall-v1',
        { 
          device: 'webgpu',
          huggingFaceAccessToken: env.huggingFaceAccessToken 
        }
      );

      // Initialize agents for different exchanges
      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Huobi'];
      for (const exchange of exchanges) {
        const agent: TransformerAgent = {
          id: `Agent_${exchange}`,
          exchange,
          model: await this.initializeAgentModel(),
          history: []
        };
        this.agents.set(agent.id, agent);
      }

      console.log('Multi-agent system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize multi-agent system:', error);
    }
  }

  private async initializeAgentModel() {
    // Initialize sequence classification pipeline with auth token
    return await pipeline(
      'text-classification',
      'onnx-community/distilbert-base-uncased-finetuned-sst-2-english',
      { 
        device: 'webgpu',
        huggingFaceAccessToken: env.huggingFaceAccessToken 
      }
    );
  }

  public async processMarketData(observations: AgentObservation[]) {
    const actions: AgentAction[] = [];
    
    for (const observation of observations) {
      const agent = this.agents.get(`Agent_${observation.exchangeId}`);
      if (!agent) continue;

      // Update agent's historical observations
      agent.history.push(observation);
      if (agent.history.length > 100) agent.history.shift();

      // Extract features from market data
      const features = await this.extractFeatures(agent.history);
      
      // Generate agent's action based on features
      const action = await this.generateAction(agent, features, observation);
      actions.push(action);
    }

    return actions;
  }

  private async extractFeatures(history: AgentObservation[]) {
    // Convert market data to text format for feature extraction
    const marketContext = history
      .map(obs => 
        `price:${obs.price},volume:${obs.volume},liquidity:${obs.liquidity},spread:${obs.spread}`
      )
      .join(' | ');

    // Extract features using the transformer
    const features = await this.featureExtractor(marketContext, {
      pooling: 'mean',
      normalize: true
    });

    return features;
  }

  private async generateAction(
    agent: TransformerAgent,
    features: any,
    currentObs: AgentObservation
  ): Promise<AgentAction> {
    // Use the agent's model to classify the action
    const prediction = await agent.model(features.toString());
    const confidence = Math.max(...prediction.map((p: any) => p.score));

    // Generate action based on model prediction
    const action: AgentAction = {
      type: confidence > 0.7 ? (confidence > 0.85 ? 'buy' : 'sell') : 'hold',
      volume: this.calculateOptimalVolume(confidence, currentObs),
      price: currentObs.price,
      timestamp: currentObs.timestamp,
      confidence,
      exchangeId: currentObs.exchangeId  // Set the exchangeId from the observation
    };

    return action;
  }

  private calculateOptimalVolume(confidence: number, obs: AgentObservation): number {
    // Simple volume calculation based on confidence and liquidity
    const baseVolume = obs.liquidity * 0.1; // Use 10% of available liquidity
    const adjustedVolume = baseVolume * confidence;
    return Math.min(adjustedVolume, obs.volume * 0.5); // Cap at 50% of available volume
  }

  public getAgentStates() {
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      exchange: agent.exchange,
      observationCount: agent.history.length
    }));
  }
}

// Create and export a singleton instance
export const multiAgentSystem = new MultiAgentArbitrageSystem();
