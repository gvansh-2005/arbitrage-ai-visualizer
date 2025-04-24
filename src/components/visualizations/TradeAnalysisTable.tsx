
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AgentAction, PerformanceMetrics } from "@/utils/dataGenerator";

interface TradeAnalysisTableProps {
  actions: AgentAction[];
  metrics: PerformanceMetrics;
}

const TradeAnalysisTable: React.FC<TradeAnalysisTableProps> = ({ actions, metrics }) => {
  // Group actions by agent
  const agentActions: Record<string, AgentAction[]> = {};
  actions.forEach(action => {
    if (!agentActions[action.agent]) {
      agentActions[action.agent] = [];
    }
    agentActions[action.agent].push(action);
  });
  
  // Calculate metrics per agent
  const agentMetrics = Object.keys(agentActions).map(agent => {
    const agentActs = agentActions[agent];
    const totalVolume = agentActs.reduce((sum, a) => sum + a.volume, 0);
    const totalTrades = agentActs.filter(a => a.action !== 'hold').length;
    const buyActions = agentActs.filter(a => a.action === 'buy');
    const sellActions = agentActs.filter(a => a.action === 'sell');
    const totalBuyVolume = buyActions.reduce((sum, a) => sum + a.volume, 0);
    const totalSellVolume = sellActions.reduce((sum, a) => sum + a.volume, 0);
    const totalProfit = agentActs.reduce((sum, a) => sum + a.profit, 0);
    const totalImpact = agentActs.reduce((sum, a) => sum + (a.impact * a.volume), 0);
    const netProfit = agentActs.reduce((sum, a) => sum + a.netProfit, 0);
    const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
    const impactRatio = totalVolume > 0 ? totalImpact / totalVolume : 0;
    
    return {
      agent,
      totalTrades,
      totalVolume,
      totalBuyVolume,
      totalSellVolume,
      totalProfit,
      totalImpact,
      netProfit,
      avgTradeSize,
      impactRatio
    };
  });
  
  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Trade Analysis</CardTitle>
        <CardDescription>
          Detailed metrics breakdown of arbitrage execution
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] overflow-auto">
        <div className="space-y-8">
          <div>
            <h3 className="font-medium text-base mb-3">Overall Performance</h3>
            <table className="data-grid">
              <tbody>
                <tr>
                  <td className="font-medium">Total Profit</td>
                  <td className="text-right positive-value">${metrics.totalProfit.toFixed(2)}</td>
                  <td className="font-medium">Net Profit</td>
                  <td className="text-right positive-value">${metrics.netProfit.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-medium">Market Impact Cost</td>
                  <td className="text-right negative-value">${metrics.totalImpactCost.toFixed(2)}</td>
                  <td className="font-medium">Total Volume</td>
                  <td className="text-right">{metrics.totalVolume.toFixed(2)} units</td>
                </tr>
                <tr>
                  <td className="font-medium">Success Rate</td>
                  <td className="text-right">{(metrics.successRate * 100).toFixed(2)}%</td>
                  <td className="font-medium">Sharpe Ratio</td>
                  <td className="text-right">{metrics.sharpeRatio.toFixed(4)}</td>
                </tr>
                <tr>
                  <td className="font-medium">Max Drawdown</td>
                  <td className="text-right negative-value">${metrics.maxDrawdown.toFixed(2)}</td>
                  <td className="font-medium">Return on Capital</td>
                  <td className="text-right">{(metrics.returnOnCapital * 100).toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="font-medium">Opportunities Executed</td>
                  <td className="text-right">{metrics.numOpportunities}</td>
                  <td className="font-medium">Avg Execution Time</td>
                  <td className="text-right">{(metrics.avgExecutionTime / 1000).toFixed(2)}s</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-3">Agent Performance</h3>
            <div className="overflow-x-auto">
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th className="text-right">Trades</th>
                    <th className="text-right">Volume</th>
                    <th className="text-right">Avg Size</th>
                    <th className="text-right">Profit</th>
                    <th className="text-right">Impact</th>
                    <th className="text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {agentMetrics.map(metric => (
                    <tr key={metric.agent}>
                      <td>{metric.agent}</td>
                      <td className="text-right">{metric.totalTrades}</td>
                      <td className="text-right">{metric.totalVolume.toFixed(2)}</td>
                      <td className="text-right">{metric.avgTradeSize.toFixed(2)}</td>
                      <td className={`text-right ${metric.totalProfit > 0 ? 'positive-value' : 'neutral-value'}`}>
                        ${metric.totalProfit.toFixed(2)}
                      </td>
                      <td className="text-right negative-value">${metric.totalImpact.toFixed(2)}</td>
                      <td className={`text-right ${metric.netProfit > 0 ? 'positive-value' : 'negative-value'}`}>
                        ${metric.netProfit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-base mb-3">Recent Actions</h3>
            <div className="overflow-x-auto">
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Agent</th>
                    <th>Exchange</th>
                    <th>Action</th>
                    <th className="text-right">Volume</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Impact</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {[...actions]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .filter(a => a.action !== 'hold')
                    .slice(0, 10)
                    .map((action, idx) => (
                      <tr key={idx}>
                        <td>{new Date(action.timestamp).toLocaleTimeString()}</td>
                        <td>{action.agent}</td>
                        <td>{action.exchange}</td>
                        <td>
                          <span className={`pill ${
                            action.action === 'buy' 
                              ? 'pill-blue' 
                              : action.action === 'sell' 
                                ? 'pill-green' 
                                : 'pill-yellow'
                          }`}>
                            {action.action}
                          </span>
                        </td>
                        <td className="text-right">{action.volume.toFixed(2)}</td>
                        <td className="text-right">${action.price.toFixed(2)}</td>
                        <td className="text-right negative-value">${(action.impact * action.volume).toFixed(2)}</td>
                        <td className={`text-right ${
                          action.netProfit > 0 
                            ? 'positive-value' 
                            : action.netProfit < 0 
                              ? 'negative-value' 
                              : 'neutral-value'
                        }`}>
                          ${action.netProfit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeAnalysisTable;
