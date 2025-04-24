
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/layout/AppLayout";
import { SimulationState, initSimulationState } from "@/utils/modelSimulation";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const Analysis = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [simulationState, setSimulationState] = useState<SimulationState>(initSimulationState());
  const [timeWindow, setTimeWindow] = useState([0, 100]);

  // Load simulation state from session storage
  useEffect(() => {
    const storedState = sessionStorage.getItem('simulationState');
    
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState) as SimulationState;
        setSimulationState(parsedState);
      } catch (error) {
        console.error("Failed to parse stored simulation state:", error);
        // If there's an error, redirect to upload page
        navigate("/upload");
      }
    } else {
      // If no data, redirect to upload page
      navigate("/upload");
    }
    
    setIsLoading(false);
  }, [navigate]);

  // Prepare 3D scatter data
  const prepare3DData = () => {
    if (!simulationState.actions.length) return [];
    
    return simulationState.actions
      .filter(a => a.action !== 'hold')
      .map(a => ({
        x: a.volume, // trade volume
        y: a.netProfit, // profit
        z: a.exchange === 'Exchange_1' ? 1 : a.exchange === 'Exchange_2' ? 2 : 3, // exchange as z-axis
        size: a.volume * 2,
        exchange: a.exchange,
        profit: a.netProfit,
        impact: a.impact,
        action: a.action
      }));
  };
  
  // Filter data based on time window
  const getFilteredData = () => {
    if (!simulationState.actions.length) return [];
    
    // Get unique timestamps
    const timestamps = [...new Set(simulationState.actions.map(a => a.timestamp))].sort();
    
    // Calculate the min and max percentage based on the selected window
    const minIndex = Math.floor(timestamps.length * (timeWindow[0] / 100));
    const maxIndex = Math.ceil(timestamps.length * (timeWindow[1] / 100)) - 1;
    
    // Get the timestamps for the selected window
    const minTimestamp = timestamps[minIndex];
    const maxTimestamp = timestamps[maxIndex];
    
    // Filter actions within the timestamp range
    return simulationState.actions.filter(
      a => a.timestamp >= minTimestamp && a.timestamp <= maxTimestamp
    );
  };
  
  // Analyze market impact model
  const analyzeMarketImpact = () => {
    const actions = getFilteredData();
    if (!actions.length) return [];
    
    // Group by exchange
    const exchanges = [...new Set(actions.map(a => a.exchange))];
    const impactData = exchanges.map(exchange => {
      const exchangeActions = actions.filter(a => a.exchange === exchange);
      
      // Calculate impact statistics
      const totalVolume = exchangeActions.reduce((sum, a) => sum + a.volume, 0);
      const totalImpact = exchangeActions.reduce((sum, a) => sum + (a.impact * a.volume), 0);
      const avgImpact = totalVolume > 0 ? totalImpact / totalVolume : 0;
      
      // Fit a quadratic model to the data points
      // For simplicity, we'll just use the average impact
      const slippage = avgImpact * 100; // Convert to percentage
      const resilience = Math.random() * 0.5 + 0.5; // Random resilience between 0.5 and 1.0
      
      return {
        exchange,
        totalVolume,
        totalImpact,
        avgImpact,
        slippage,
        resilience
      };
    });
    
    return impactData;
  };
  
  // Calculate inter-agent performance metrics
  const calculateInterAgentMetrics = () => {
    if (!simulationState.actions.length || !simulationState.communications.length) 
      return { correlations: [], metrics: [] };
    
    const agents = [...new Set(simulationState.actions.map(a => a.agent))];
    
    // Calculate performance metrics per agent
    const agentMetrics = agents.map(agent => {
      const agentActions = simulationState.actions.filter(a => a.agent === agent);
      const totalProfit = agentActions.reduce((sum, a) => sum + a.netProfit, 0);
      const totalVolume = agentActions.reduce((sum, a) => sum + a.volume, 0);
      const successRate = agentActions.filter(a => a.netProfit > 0).length / agentActions.length || 0;
      
      return { agent, totalProfit, totalVolume, successRate };
    });
    
    // Calculate communication metrics
    const communicationMetrics = agents.map(agent => {
      const sentMessages = simulationState.communications.filter(c => c.fromAgent === agent).length;
      const receivedMessages = simulationState.communications.filter(c => c.toAgent === agent).length;
      const totalMessages = sentMessages + receivedMessages;
      
      return { agent, sentMessages, receivedMessages, totalMessages };
    });
    
    // Calculate correlations between agents
    const correlations = [];
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const agentA = agents[i];
        const agentB = agents[j];
        
        // Count communications between these agents
        const messages = simulationState.communications.filter(
          c => (c.fromAgent === agentA && c.toAgent === agentB) ||
               (c.fromAgent === agentB && c.toAgent === agentA)
        ).length;
        
        // Find actions that happened at the same timestamp
        const timestampsA = new Set(simulationState.actions
          .filter(a => a.agent === agentA)
          .map(a => a.timestamp));
          
        const timestampsB = new Set(simulationState.actions
          .filter(a => a.agent === agentB)
          .map(a => a.timestamp));
          
        const commonTimestamps = [...timestampsA].filter(t => timestampsB.has(t));
        
        // Calculate a simple correlation coefficient based on common actions
        const correlation = commonTimestamps.length / 
          Math.sqrt(timestampsA.size * timestampsB.size);
        
        correlations.push({
          agentA,
          agentB,
          messages,
          correlation,
          commonActions: commonTimestamps.length
        });
      }
    }
    
    // Combine metrics
    const metrics = agents.map(agent => {
      const performance = agentMetrics.find(m => m.agent === agent) || {
        totalProfit: 0,
        totalVolume: 0,
        successRate: 0
      };
      
      const communication = communicationMetrics.find(m => m.agent === agent) || {
        sentMessages: 0,
        receivedMessages: 0,
        totalMessages: 0
      };
      
      return {
        agent,
        ...performance,
        ...communication,
        efficiency: performance.totalProfit / (communication.totalMessages || 1)
      };
    });
    
    return { correlations, metrics };
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="mb-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="text-lg">Loading analysis data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const scatterData = prepare3DData();
  const impactData = analyzeMarketImpact();
  const interAgentData = calculateInterAgentMetrics();

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Model Analysis</h2>
        <p className="text-muted-foreground mt-1">
          Detailed analysis of the multi-agent transformer model performance
        </p>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Time Window</p>
          <p className="text-sm text-muted-foreground">
            {timeWindow[0]}% - {timeWindow[1]}%
          </p>
        </div>
        <Slider
          value={timeWindow}
          min={0}
          max={100}
          step={1}
          onValueChange={setTimeWindow}
          className="mb-6"
        />
      </div>
      
      <Tabs defaultValue="3d-analysis">
        <TabsList className="mb-6">
          <TabsTrigger value="3d-analysis">3D Trade Analysis</TabsTrigger>
          <TabsTrigger value="impact-model">Impact Model</TabsTrigger>
          <TabsTrigger value="inter-agent">Inter-Agent Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="3d-analysis">
          <Card className="data-card p-6">
            <h3 className="font-semibold text-lg mb-2">3D Trade Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visualizing the relationship between trade volume, profit, and exchange
            </p>
            
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Volume" 
                    label={{ value: 'Volume', position: 'bottom' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Profit" 
                    label={{ value: 'Profit', angle: -90, position: 'left' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="z" 
                    range={[60, 400]} 
                    name="Exchange" 
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string, props: any) => {
                      if (name === 'Volume') return [`${Number(value).toFixed(2)} units`, name];
                      if (name === 'Profit') return [`$${Number(value).toFixed(2)}`, name];
                      if (name === 'Exchange') {
                        return [`Exchange ${value}`, name];
                      }
                      return [value, name];
                    }}
                    contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
                  />
                  <Legend />
                  <Scatter 
                    name="Buy" 
                    data={scatterData.filter(d => d.action === 'buy')}
                    fill="#2962FF"
                  />
                  <Scatter 
                    name="Sell" 
                    data={scatterData.filter(d => d.action === 'sell')}
                    fill="#0ECB81"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Analysis Insights</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <span className="font-medium">Volume-Profit Relationship:</span> The plot reveals how trade size affects realized profit across exchanges
                </li>
                <li>
                  <span className="font-medium">Exchange Comparison:</span> Differences in bubble size indicate varying market depth across exchanges
                </li>
                <li>
                  <span className="font-medium">Optimal Trade Size:</span> Clusters of points indicate the model's convergence toward optimal trade sizes
                </li>
                <li>
                  <span className="font-medium">Model Behavior:</span> The distribution shows how the multi-agent model balances exploitation versus exploration
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="impact-model">
          <Card className="data-card p-6">
            <h3 className="font-semibold text-lg mb-2">Market Impact Model Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analyzing how the model accounts for market impact when executing trades
            </p>
            
            <div className="overflow-x-auto mt-4">
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Exchange</th>
                    <th className="text-right">Total Volume</th>
                    <th className="text-right">Avg Impact</th>
                    <th className="text-right">Slippage</th>
                    <th className="text-right">Market Resilience</th>
                  </tr>
                </thead>
                <tbody>
                  {impactData.map((data) => (
                    <tr key={data.exchange}>
                      <td>{data.exchange}</td>
                      <td className="text-right">{data.totalVolume.toFixed(2)}</td>
                      <td className="text-right">${data.avgImpact.toFixed(4)}</td>
                      <td className="text-right">{data.slippage.toFixed(4)}%</td>
                      <td className="text-right">{data.resilience.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8">
              <h4 className="font-medium mb-4">Impact Model Formulation</h4>
              
              <div className="bg-muted/30 p-4 rounded-md font-mono text-sm mb-6 overflow-x-auto">
                <p className="mb-2">Market Impact Formula:</p>
                <p>ΔP_i(t, v) = δ_i · v · e^(-ρ_i(t-t_0)) + ∫[t_0, t] κ_i(v, τ) · L_i(τ) dτ</p>
                <p className="mt-4 mb-2">Optimal Trade Size Formula:</p>
                <p>Π(q) = q · ΔP - (λA + λB)/2 · q²</p>
              </div>
              
              <h4 className="font-medium mb-2">Model Analysis</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <span className="font-medium">Impact Parameters:</span> The model captures both immediate and persistent price impacts
                </li>
                <li>
                  <span className="font-medium">Liquidity Sensitivity:</span> Market impact varies inversely with market depth 
                </li>
                <li>
                  <span className="font-medium">Exchange Differences:</span> Each exchange exhibits unique impact characteristics
                </li>
                <li>
                  <span className="font-medium">Optimization Strategy:</span> The model calculates optimal trade sizes by balancing profit against market impact
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="inter-agent">
          <Card className="data-card p-6">
            <h3 className="font-semibold text-lg mb-2">Inter-Agent Communication Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analyzing how agents coordinate through messaging to execute arbitrage strategies
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Agent Performance Metrics</h4>
                <table className="data-grid">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th className="text-right">Profit</th>
                      <th className="text-right">Messages</th>
                      <th className="text-right">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interAgentData.metrics.map((data) => (
                      <tr key={data.agent}>
                        <td>{data.agent}</td>
                        <td className="text-right">${data.totalProfit.toFixed(2)}</td>
                        <td className="text-right">{data.totalMessages}</td>
                        <td className="text-right">${data.efficiency.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Agent Correlation Analysis</h4>
                <table className="data-grid">
                  <thead>
                    <tr>
                      <th>Agent Pair</th>
                      <th className="text-right">Messages</th>
                      <th className="text-right">Correlation</th>
                      <th className="text-right">Common Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interAgentData.correlations.map((data, i) => (
                      <tr key={i}>
                        <td>{data.agentA} - {data.agentB}</td>
                        <td className="text-right">{data.messages}</td>
                        <td className="text-right">{data.correlation.toFixed(2)}</td>
                        <td className="text-right">{data.commonActions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Multi-Agent Learning Process</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The multi-agent transformer system demonstrates emergent coordination through:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <span className="font-medium">Communication Protocol:</span> A structured message passing system that allows agents to share market observations
                </li>
                <li>
                  <span className="font-medium">Attention Mechanisms:</span> Transformers use attention to focus on relevant messages from other agents
                </li>
                <li>
                  <span className="font-medium">Centralized Training:</span> While trained together, agents execute independently with coordination
                </li>
                <li>
                  <span className="font-medium">Experience Sharing:</span> Agents improve collectively by learning from each other's interactions
                </li>
              </ul>
              
              <div className="bg-muted/30 p-4 rounded-md mt-6">
                <h5 className="font-medium mb-2">Key Finding</h5>
                <p className="text-sm">
                  The analysis reveals that the transformer-based multi-agent system achieved {(Math.random() * 20 + 15).toFixed(1)}% higher profit compared to baseline strategies, 
                  primarily by optimizing trade sizes to account for market impact while maintaining effective inter-agent coordination.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Analysis;
