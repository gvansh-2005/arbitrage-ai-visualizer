
export interface ArbitrageDataPoint {
  timestamp: number;
  exchange_id: string;
  price: number;
  volume: number;
  bid: number;
  ask: number;
  liquidity_level: number;
}

export interface ArbitrageOpportunity {
  timestamp: number;
  exchangeA: string;
  exchangeB: string;
  priceA: number;
  priceB: number;
  spread: number;
  profitPotential: number;
  volumeConstraint: number;
  decayRate: number;
}

export interface AgentAction {
  timestamp: number;
  agent: string;
  exchange: string;
  action: 'buy' | 'sell' | 'hold';
  volume: number;
  price: number;
  profit: number;
  impact: number;
  netProfit: number;
}

export interface AgentCommunication {
  timestamp: number;
  fromAgent: string;
  toAgent: string;
  messageType: string;
  content: string;
  latency: number;
}

export interface PerformanceMetrics {
  totalProfit: number;
  totalVolume: number;
  totalImpactCost: number;
  netProfit: number;
  successRate: number;
  avgExecutionTime: number;
  sharpeRatio: number;
  maxDrawdown: number;
  returnOnCapital: number;
  numOpportunities: number;
}

// Generate sample data for testing
export function generateSampleData(
  numExchanges: number = 3,
  numTimePoints: number = 1000,
  startTimestamp: number = Date.now()
): ArbitrageDataPoint[] {
  const exchanges = Array.from({ length: numExchanges }, (_, i) => `Exchange_${i + 1}`);
  const basePrice = 50000; // Base price for BTC/USD
  const data: ArbitrageDataPoint[] = [];

  // Generate data for each exchange over time
  for (let t = 0; t < numTimePoints; t++) {
    const timestamp = startTimestamp + t * 60000; // 1-minute intervals
    
    exchanges.forEach((exchange, idx) => {
      // Create slightly different prices between exchanges to create arbitrage opportunities
      const priceNoise = (Math.random() - 0.5) * 100 * (idx + 1);
      const price = basePrice + priceNoise + Math.sin(t / 100) * 200;
      
      // Create bid-ask spread
      const spread = price * 0.0005 + Math.random() * price * 0.001;
      const bid = price - spread / 2;
      const ask = price + spread / 2;
      
      // Random volume and liquidity
      const volume = 1 + Math.random() * 10;
      const liquidity_level = 0.1 + Math.random() * 0.9;
      
      data.push({
        timestamp,
        exchange_id: exchange,
        price,
        volume,
        bid,
        ask,
        liquidity_level,
      });
    });
  }

  return data;
}

// Generate arbitrage opportunities from price data
export function identifyArbitrageOpportunities(
  data: ArbitrageDataPoint[]
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const timestamps = [...new Set(data.map(d => d.timestamp))];
  
  timestamps.forEach(timestamp => {
    const pointsAtTime = data.filter(d => d.timestamp === timestamp);
    
    // Compare each pair of exchanges
    for (let i = 0; i < pointsAtTime.length; i++) {
      for (let j = i + 1; j < pointsAtTime.length; j++) {
        const exchangeA = pointsAtTime[i];
        const exchangeB = pointsAtTime[j];
        
        // Check if there's a price difference that could be exploited
        const spread = exchangeB.bid - exchangeA.ask;
        
        if (spread > 0) {
          // There's an opportunity (buy on A, sell on B)
          const volumeConstraint = Math.min(
            exchangeA.liquidity_level * 100,
            exchangeB.liquidity_level * 100
          );
          
          const profitPotential = spread * volumeConstraint;
          const decayRate = 0.02 + Math.random() * 0.05;
          
          opportunities.push({
            timestamp,
            exchangeA: exchangeA.exchange_id,
            exchangeB: exchangeB.exchange_id,
            priceA: exchangeA.ask,
            priceB: exchangeB.bid,
            spread,
            profitPotential,
            volumeConstraint,
            decayRate,
          });
        } else if (exchangeA.bid - exchangeB.ask > 0) {
          // There's an opportunity (buy on B, sell on A)
          const reverseSpread = exchangeA.bid - exchangeB.ask;
          const volumeConstraint = Math.min(
            exchangeB.liquidity_level * 100,
            exchangeA.liquidity_level * 100
          );
          
          const profitPotential = reverseSpread * volumeConstraint;
          const decayRate = 0.02 + Math.random() * 0.05;
          
          opportunities.push({
            timestamp,
            exchangeA: exchangeB.exchange_id,
            exchangeB: exchangeA.exchange_id,
            priceA: exchangeB.ask,
            priceB: exchangeA.bid,
            spread: reverseSpread,
            profitPotential,
            volumeConstraint,
            decayRate,
          });
        }
      }
    }
  });
  
  return opportunities;
}

// Simulate agent actions based on opportunities
export function simulateAgentActions(
  opportunities: ArbitrageOpportunity[]
): AgentAction[] {
  const actions: AgentAction[] = [];
  
  // Process each opportunity
  opportunities.forEach((opp) => {
    // Determine the optimal trade volume based on market impact
    const optimalVolume = calculateOptimalVolume(opp);
    
    // Calculate expected market impact
    const impactA = calculateMarketImpact(opp.exchangeA, optimalVolume);
    const impactB = calculateMarketImpact(opp.exchangeB, optimalVolume);
    
    // Calculate profit
    const rawProfit = opp.spread * optimalVolume;
    const impactCost = (impactA + impactB) * optimalVolume;
    const netProfit = rawProfit - impactCost;
    
    // Create buy action for agent A
    actions.push({
      timestamp: opp.timestamp,
      agent: `Agent_${opp.exchangeA}`,
      exchange: opp.exchangeA,
      action: 'buy',
      volume: optimalVolume,
      price: opp.priceA,
      profit: 0, // No direct profit on buy
      impact: impactA,
      netProfit: 0, // No profit yet
    });
    
    // Create sell action for agent B
    actions.push({
      timestamp: opp.timestamp,
      agent: `Agent_${opp.exchangeB}`,
      exchange: opp.exchangeB,
      action: 'sell',
      volume: optimalVolume,
      price: opp.priceB,
      profit: rawProfit,
      impact: impactB,
      netProfit: netProfit,
    });
    
    // Add some random hold actions to simulate agent behavior
    if (Math.random() > 0.7) {
      actions.push({
        timestamp: opp.timestamp + 30000, // 30s later
        agent: `Agent_${opp.exchangeA}`,
        exchange: opp.exchangeA,
        action: 'hold',
        volume: 0,
        price: opp.priceA,
        profit: 0,
        impact: 0,
        netProfit: 0,
      });
    }
  });
  
  return actions;
}

// Calculate optimal trade volume considering market impact
function calculateOptimalVolume(opp: ArbitrageOpportunity): number {
  // This is a simplified implementation of the optimal trade size formula
  // In a real implementation, we would use the formula from the research paper
  // Π(q) = q * ΔP - (λA + λB) * q^2 / 2
  // where we maximize the profit by solving for q
  
  // For simplicity, we'll use a heuristic based on the spread and volume constraint
  const impactFactor = 0.01;
  const optimalVolume = opp.spread / (2 * impactFactor);
  
  // Constrain by available liquidity
  return Math.min(optimalVolume, opp.volumeConstraint);
}

// Calculate market impact based on exchange and volume
function calculateMarketImpact(exchange: string, volume: number): number {
  // Implement a version of the market impact model from the paper
  // ΔP_i(t, v) = δ_i * v * e^(-ρ_i(t-t_0)) + ∫[t_0, t] κ_i(v, τ) * L_i(τ) dτ
  
  // For simplicity, we'll use a quadratic impact model
  // Impact = α * volume^2
  const exchangeFactors: Record<string, number> = {};
  
  // Generate random impact factors for each exchange if not set
  if (!exchangeFactors[exchange]) {
    exchangeFactors[exchange] = 0.001 + Math.random() * 0.002;
  }
  
  return exchangeFactors[exchange] * Math.pow(volume, 2);
}

// Generate agent communication data
export function generateAgentCommunications(
  actions: AgentAction[],
  numMessages: number = 100
): AgentCommunication[] {
  const communications: AgentCommunication[] = [];
  const agents = [...new Set(actions.map(a => a.agent))];
  
  // Generate inter-agent communications
  for (let i = 0; i < numMessages; i++) {
    // Select random sender and receiver agents
    const fromIdx = Math.floor(Math.random() * agents.length);
    let toIdx = Math.floor(Math.random() * agents.length);
    
    // Make sure sender and receiver are different
    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * agents.length);
    }
    
    const fromAgent = agents[fromIdx];
    const toAgent = agents[toIdx];
    
    // Select a random action timestamp
    const actionIdx = Math.floor(Math.random() * actions.length);
    const timestamp = actions[actionIdx].timestamp;
    
    // Generate message content
    const messageTypes = ['price_update', 'volume_intent', 'execution_report', 'liquidity_info'];
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    let content = '';
    switch (messageType) {
      case 'price_update':
        content = `Price update: ${50000 + Math.random() * 1000}`;
        break;
      case 'volume_intent':
        content = `Intent to trade ${Math.round(Math.random() * 10)} units`;
        break;
      case 'execution_report':
        content = `Executed ${Math.round(Math.random() * 5)} units at ${50000 + Math.random() * 1000}`;
        break;
      case 'liquidity_info':
        content = `Current liquidity: ${0.1 + Math.random() * 0.9}`;
        break;
    }
    
    communications.push({
      timestamp,
      fromAgent,
      toAgent,
      messageType,
      content,
      latency: Math.random() * 100, // Random latency in ms
    });
  }
  
  // Sort by timestamp
  return communications.sort((a, b) => a.timestamp - b.timestamp);
}

// Calculate performance metrics
export function calculatePerformanceMetrics(actions: AgentAction[]): PerformanceMetrics {
  // Filter to only sell actions (where profit is realized)
  const sellActions = actions.filter(a => a.action === 'sell');
  
  // Calculate total metrics
  const totalProfit = sellActions.reduce((sum, a) => sum + a.profit, 0);
  const totalVolume = sellActions.reduce((sum, a) => sum + a.volume, 0);
  const totalImpactCost = actions.reduce((sum, a) => sum + (a.impact * a.volume), 0);
  const netProfit = totalProfit - totalImpactCost;
  
  // Calculate advanced metrics
  const successfulTrades = sellActions.filter(a => a.netProfit > 0).length;
  const successRate = sellActions.length > 0 ? successfulTrades / sellActions.length : 0;
  
  // Calculate time-based metrics
  const timestamps = [...new Set(actions.map(a => a.timestamp))];
  const avgExecutionTime = timestamps.length > 1 ? 
    (timestamps[timestamps.length - 1] - timestamps[0]) / timestamps.length : 0;
  
  // Calculate Sharpe ratio (simplified)
  const profits = sellActions.map(a => a.netProfit);
  const meanProfit = profits.reduce((sum, p) => sum + p, 0) / profits.length;
  const stdDev = Math.sqrt(
    profits.reduce((sum, p) => sum + Math.pow(p - meanProfit, 2), 0) / profits.length
  );
  const sharpeRatio = stdDev > 0 ? meanProfit / stdDev : 0;
  
  // Calculate drawdown
  let maxProfit = 0;
  let maxDrawdown = 0;
  let currentProfit = 0;
  
  sellActions.forEach(action => {
    currentProfit += action.netProfit;
    if (currentProfit > maxProfit) {
      maxProfit = currentProfit;
    }
    const drawdown = maxProfit - currentProfit;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  // Assume initial capital is 100 times the average trade volume
  const avgVolume = totalVolume / sellActions.length;
  const initialCapital = avgVolume * 100;
  const returnOnCapital = initialCapital > 0 ? netProfit / initialCapital : 0;
  
  return {
    totalProfit,
    totalVolume,
    totalImpactCost,
    netProfit,
    successRate,
    avgExecutionTime,
    sharpeRatio,
    maxDrawdown,
    returnOnCapital,
    numOpportunities: sellActions.length,
  };
}

// Prepare data for different charts
export function prepareArbitrageDecayData(opportunities: ArbitrageOpportunity[]): any[] {
  return opportunities.map(opp => ({
    time: new Date(opp.timestamp).toISOString(),
    spread: opp.spread,
    profitPotential: opp.profitPotential,
    decayRate: opp.decayRate,
    exchangeA: opp.exchangeA,
    exchangeB: opp.exchangeB,
  }));
}

export function prepareImpactCurveData(actions: AgentAction[]): any[] {
  return actions.filter(a => a.volume > 0).map(a => ({
    volume: a.volume,
    impact: a.impact,
    netProfit: a.netProfit,
    exchange: a.exchange,
    action: a.action,
  }));
}

export function prepareAgentCommunicationHeatmap(
  communications: AgentCommunication[]
): any {
  const agents = [...new Set([
    ...communications.map(c => c.fromAgent),
    ...communications.map(c => c.toAgent)
  ])].sort();
  
  // Create a matrix of communication counts
  const matrix = agents.map(from => {
    return agents.map(to => {
      const count = communications.filter(
        c => c.fromAgent === from && c.toAgent === to
      ).length;
      return { from, to, count };
    });
  });
  
  return {
    agents,
    data: matrix.flat().filter(item => item.from !== item.to)
  };
}

export function prepare3DTradeData(actions: AgentAction[]): any[] {
  return actions.filter(a => a.action !== 'hold').map(a => ({
    volume: a.volume,
    profit: a.netProfit,
    exchange: a.exchange,
    action: a.action,
    x: a.volume,
    y: a.netProfit,
    z: a.exchange === 'Exchange_1' ? 1 : a.exchange === 'Exchange_2' ? 2 : 3,
    size: a.volume * 2,
  }));
}

export function prepareCumulativeProfitData(actions: AgentAction[]): any[] {
  let cumulativeProfit = 0;
  let baseline = 0;
  let staticSplit = 0;
  
  // Sort actions by timestamp
  const sortedActions = [...actions].sort((a, b) => a.timestamp - b.timestamp);
  
  const data = sortedActions.filter(a => a.action === 'sell').map(a => {
    cumulativeProfit += a.netProfit;
    
    // Simulate baseline strategy (simplified)
    baseline += a.profit * 0.7; // 70% of potential profit with no market impact modeling
    
    // Simulate static split strategy (simplified)
    staticSplit += a.profit * 0.85 - a.impact * a.volume * 0.5;
    
    return {
      time: new Date(a.timestamp).toISOString(),
      profit: cumulativeProfit,
      baseline,
      staticSplit,
      exchange: a.exchange,
    };
  });
  
  return data;
}

export function prepareAgentActionTraceData(actions: AgentAction[]): any[] {
  const agents = [...new Set(actions.map(a => a.agent))];
  
  // Create one data point per agent per timestamp
  const timestamps = [...new Set(actions.map(a => a.timestamp))];
  
  const data = [];
  timestamps.sort().forEach(timestamp => {
    agents.forEach(agent => {
      const agentActions = actions.filter(
        a => a.agent === agent && a.timestamp === timestamp
      );
      
      if (agentActions.length > 0) {
        // If there are actions for this agent at this timestamp
        agentActions.forEach(a => {
          data.push({
            time: new Date(timestamp).toISOString(),
            agent,
            action: a.action,
            volume: a.volume,
            profit: a.netProfit,
          });
        });
      } else {
        // If no actions, add a point with zero volume
        data.push({
          time: new Date(timestamp).toISOString(),
          agent,
          action: 'hold',
          volume: 0,
          profit: 0,
        });
      }
    });
  });
  
  return data;
}

export function prepareLiquidityTrendData(rawData: ArbitrageDataPoint[]): any[] {
  const timestamps = [...new Set(rawData.map(d => d.timestamp))].sort();
  const exchanges = [...new Set(rawData.map(d => d.exchange_id))];
  
  const data = [];
  timestamps.forEach(timestamp => {
    const point: any = { time: new Date(timestamp).toISOString() };
    
    exchanges.forEach(exchange => {
      const exchangeData = rawData.find(
        d => d.exchange_id === exchange && d.timestamp === timestamp
      );
      
      if (exchangeData) {
        point[exchange] = exchangeData.liquidity_level;
      }
    });
    
    data.push(point);
  });
  
  return data;
}

export function preparePriceSpreadData(rawData: ArbitrageDataPoint[]): any[] {
  const timestamps = [...new Set(rawData.map(d => d.timestamp))].sort();
  const exchanges = [...new Set(rawData.map(d => d.exchange_id))];
  
  const data = [];
  timestamps.forEach(timestamp => {
    const point: any = { time: new Date(timestamp).toISOString() };
    
    // Add price for each exchange
    exchanges.forEach(exchange => {
      const exchangeData = rawData.find(
        d => d.exchange_id === exchange && d.timestamp === timestamp
      );
      
      if (exchangeData) {
        point[exchange] = exchangeData.price;
      }
    });
    
    // Add spreads between exchanges
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const exchangeA = exchanges[i];
        const exchangeB = exchanges[j];
        
        if (point[exchangeA] && point[exchangeB]) {
          point[`${exchangeA}-${exchangeB}`] = Math.abs(point[exchangeA] - point[exchangeB]);
        }
      }
    }
    
    data.push(point);
  });
  
  return data;
}

export function prepareVolumeHistogramData(actions: AgentAction[]): any[] {
  const agents = [...new Set(actions.map(a => a.agent))];
  
  // Calculate total volume per agent
  return agents.map(agent => {
    const agentActions = actions.filter(a => a.agent === agent && a.action !== 'hold');
    const totalVolume = agentActions.reduce((sum, a) => sum + a.volume, 0);
    const totalProfit = agentActions.reduce((sum, a) => sum + a.netProfit, 0);
    
    return {
      agent,
      totalVolume,
      totalProfit,
      avgVolumePerTrade: totalVolume / agentActions.length,
    };
  });
}

export function prepareRewardConvergenceData(actions: AgentAction[]): any[] {
  // Group actions by timestamp and calculate average reward (profit) per episode
  const timestamps = [...new Set(actions.map(a => a.timestamp))].sort();
  
  // Consider each timestamp as an "episode"
  const data = timestamps.map((timestamp, i) => {
    const episodeActions = actions.filter(a => a.timestamp === timestamp);
    const totalReward = episodeActions.reduce((sum, a) => sum + a.netProfit, 0);
    const agents = [...new Set(episodeActions.map(a => a.agent))];
    const avgReward = agents.length > 0 ? totalReward / agents.length : 0;
    
    return {
      episode: i + 1,
      avgReward,
      timestamp: new Date(timestamp).toISOString(),
      totalReward,
    };
  });
  
  return data;
}

// Function to convert raw data to CSV format
export function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(row => {
    return Object.values(row)
      .map(value => {
        // Handle string values with commas by wrapping in quotes
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      })
      .join(',');
  });
  
  return [header, ...rows].join('\n');
}

// Parse CSV data
export function parseCSV(csv: string): any[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj: any, header, index) => {
      // Try to convert to number if possible
      const value = values[index];
      obj[header] = isNaN(Number(value)) ? value : Number(value);
      return obj;
    }, {});
  }).filter(row => Object.keys(row).length > 0); // Filter out empty rows
}
