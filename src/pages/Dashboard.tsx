
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowUp, ArrowDown, FileUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { SimulationState, initSimulationState } from "@/utils/modelSimulation";
import CumulativeProfitChart from "@/components/visualizations/CumulativeProfitChart";
import { prepareCumulativeProfitData } from "@/utils/dataGenerator";

const Dashboard = () => {
  const navigate = useNavigate();
  const [simulationState, setSimulationState] = useState<SimulationState>(initSimulationState());
  const [cumulativeProfit, setCumulativeProfit] = useState<any[]>([]);

  useEffect(() => {
    const storedState = sessionStorage.getItem('simulationState');
    
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState) as SimulationState;
        setSimulationState(parsedState);
        
        if (parsedState.actions.length > 0) {
          setCumulativeProfit(prepareCumulativeProfitData(parsedState.actions));
        }
      } catch (error) {
        console.error("Failed to parse stored simulation state:", error);
      }
    }
  }, []);
  
  const handleUploadData = () => {
    navigate("/upload");
  };
  
  const handleViewVisualizations = () => {
    navigate("/visualization");
  };
  
  const handleViewAnalysis = () => {
    navigate("/analysis");
  };
  
  // Format metrics for display
  const formatMetric = (value: number, isPercent = false): string => {
    if (value === undefined || value === null) return "N/A";
    return isPercent ? `${(value * 100).toFixed(2)}%` : `$${value.toFixed(2)}`;
  };
  
  const hasData = simulationState.dataLoaded && simulationState.metrics;

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Multi-Agent Arbitrage Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visualizing cross-exchange arbitrage execution with market impact modeling
          </p>
        </div>
        {!hasData && (
          <Button onClick={handleUploadData}>
            <FileUp className="mr-2 h-4 w-4" />
            Upload Dataset
          </Button>
        )}
      </div>
      
      {hasData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Net Profit</p>
                  {simulationState.metrics && simulationState.metrics.netProfit > 0 ? (
                    <ArrowUp className="h-4 w-4 text-profit" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-loss" />
                  )}
                </div>
                <div className="mt-2">
                  <span className={`text-2xl font-bold ${
                    simulationState.metrics && simulationState.metrics.netProfit > 0 
                      ? 'text-profit' 
                      : 'text-loss'
                  }`}>
                    {formatMetric(simulationState.metrics?.netProfit || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Success Rate</p>
                  <ArrowUp className="h-4 w-4 text-profit" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    {formatMetric(simulationState.metrics?.successRate || 0, true)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Impact Cost</p>
                  <ArrowDown className="h-4 w-4 text-loss" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-loss">
                    {formatMetric(simulationState.metrics?.totalImpactCost || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Return on Capital</p>
                  {simulationState.metrics && simulationState.metrics.returnOnCapital > 0 ? (
                    <ArrowUp className="h-4 w-4 text-profit" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-loss" />
                  )}
                </div>
                <div className="mt-2">
                  <span className={`text-2xl font-bold ${
                    simulationState.metrics && simulationState.metrics.returnOnCapital > 0 
                      ? 'text-profit' 
                      : 'text-loss'
                  }`}>
                    {formatMetric(simulationState.metrics?.returnOnCapital || 0, true)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Cumulative Profit</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {cumulativeProfit.length > 0 && (
                    <CumulativeProfitChart data={cumulativeProfit} />
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Opportunities Executed:</span>
                      <span className="font-medium">{simulationState.metrics?.numOpportunities || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Profit:</span>
                      <span className="font-medium positive-value">{formatMetric(simulationState.metrics?.totalProfit || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volume Traded:</span>
                      <span className="font-medium">{simulationState.metrics?.totalVolume.toFixed(2) || 0} units</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Execution Time:</span>
                      <span className="font-medium">{((simulationState.metrics?.avgExecutionTime || 0) / 1000).toFixed(2)} s</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sharpe Ratio:</span>
                      <span className="font-medium">{simulationState.metrics?.sharpeRatio.toFixed(4) || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Max Drawdown:</span>
                      <span className="font-medium negative-value">{formatMetric(simulationState.metrics?.maxDrawdown || 0)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <Button className="w-full" onClick={handleViewVisualizations}>
                      View All Visualizations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleViewAnalysis}>
                      View Detailed Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About Multi-Agent Transformers for Arbitrage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p>
                    This dashboard visualizes a novel application of multi-agent transformer models for optimizing 
                    cross-exchange cryptocurrency arbitrage while incorporating market impact modeling.
                  </p>
                  <p>
                    The system employs multiple agents operating on different exchanges, coordinating their actions
                    through a pub-sub messaging system to maximize arbitrage profits while minimizing market impact costs.
                  </p>
                  <p>
                    Each agent utilizes a transformer encoder to process time-series price and liquidity data, identifying
                    optimal trade sizes and timing through reinforcement learning.
                  </p>
                </div>
                
                <div className="mt-4 bg-muted/30 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Research Implementation</h4>
                  <p className="text-sm">
                    Implements the model described in <em>"Multi-Agent Transformers for Cross-Exchange Arbitrage Execution
                    with Market Impact Modeling"</em>, demonstrating how advanced deep learning architectures can maximize
                    profits in cross-exchange arbitrage scenarios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-1">No data available</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a dataset or generate sample data to start visualizing cross-exchange arbitrage strategies.
            </p>
            <Button onClick={handleUploadData}>
              Upload Dataset
            </Button>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Dashboard;
