
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import ArbitrageDecayChart from "@/components/visualizations/ArbitrageDecayChart";
import MarketImpactChart from "@/components/visualizations/MarketImpactChart";
import AgentCommunicationHeatmap from "@/components/visualizations/AgentCommunicationHeatmap";
import CumulativeProfitChart from "@/components/visualizations/CumulativeProfitChart";
import AgentActionTraceChart from "@/components/visualizations/AgentActionTraceChart";
import LiquidityTrendChart from "@/components/visualizations/LiquidityTrendChart";
import PriceSpreadChart from "@/components/visualizations/PriceSpreadChart";
import VolumeHistogramChart from "@/components/visualizations/VolumeHistogramChart";
import RewardConvergenceChart from "@/components/visualizations/RewardConvergenceChart";
import TradeAnalysisTable from "@/components/visualizations/TradeAnalysisTable";
import { SimulationState, initSimulationState, trainModel } from "@/utils/modelSimulation";
import {
  prepareArbitrageDecayData,
  prepareImpactCurveData,
  prepareAgentCommunicationHeatmap,
  prepareCumulativeProfitData,
  prepareAgentActionTraceData,
  prepareLiquidityTrendData,
  preparePriceSpreadData,
  prepareVolumeHistogramData,
  prepareRewardConvergenceData,
  convertToCSV,
  identifyArbitrageOpportunities
} from "@/utils/dataGenerator";
import { useNavigate } from "react-router-dom";

const Visualization = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [simulationState, setSimulationState] = useState<SimulationState>(initSimulationState());
  const [visualData, setVisualData] = useState({
    arbitrageDecay: [] as any[],
    impactCurve: [] as any[],
    communicationHeatmap: { agents: [], data: [] } as any,
    cumulativeProfit: [] as any[],
    agentActionTrace: [] as any[],
    liquidityTrend: [] as any[],
    priceSpread: [] as any[],
    volumeHistogram: [] as any[],
    rewardConvergence: [] as any[]
  });
  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0);

  // Load simulation state from session storage
  useEffect(() => {
    const storedState = sessionStorage.getItem('simulationState');
    
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState) as SimulationState;
        setSimulationState(parsedState);
        
        if (parsedState.dataLoaded) {
          prepareVisualData(parsedState);
        }
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

  // Prepare data for all visualizations
  const prepareVisualData = (state: SimulationState) => {
    // Extract opportunities from raw data
    const opportunities = identifyArbitrageOpportunities(state.rawData);
    
    // Prepare data for each visualization
    setVisualData({
      arbitrageDecay: prepareArbitrageDecayData(opportunities),
      impactCurve: prepareImpactCurveData(state.actions),
      communicationHeatmap: prepareAgentCommunicationHeatmap(state.communications),
      cumulativeProfit: prepareCumulativeProfitData(state.actions),
      agentActionTrace: prepareAgentActionTraceData(state.actions),
      liquidityTrend: prepareLiquidityTrendData(state.rawData),
      priceSpread: preparePriceSpreadData(state.rawData),
      volumeHistogram: prepareVolumeHistogramData(state.actions),
      rewardConvergence: prepareRewardConvergenceData(state.actions),
    });
  };

  // Handle model training
  const handleTrainModel = async () => {
    if (!simulationState.rawData.length) {
      toast({ title: "No data available", description: "Please upload data first" });
      return;
    }
    
    setIsTraining(true);
    setTrainProgress(0);
    
    try {
      // Train model with progress callback
      const trainedState = await trainModel(
        simulationState.rawData,
        100,
        (progress) => setTrainProgress(progress)
      );
      
      // Update simulation state and visual data
      setSimulationState(trainedState);
      prepareVisualData(trainedState);
      
      // Store updated state
      sessionStorage.setItem('simulationState', JSON.stringify(trainedState));
      
      toast({
        title: "Model training complete",
        description: "The multi-agent transformer model has been trained successfully"
      });
    } catch (error) {
      console.error("Training failed:", error);
      toast({
        title: "Training failed",
        description: "An error occurred during model training",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  // Export all data as CSV
  const handleExportData = () => {
    const dataToExport = {
      rawData: convertToCSV(simulationState.rawData),
      actions: convertToCSV(simulationState.actions),
      communications: convertToCSV(simulationState.communications),
      metrics: JSON.stringify(simulationState.metrics, null, 2)
    };
    
    // Create a ZIP file (mock implementation)
    const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arbitrage_simulation_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Simulation results have been exported successfully"
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="mb-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <p className="text-lg">Loading visualization data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Multi-Agent Arbitrage Visualizations</h2>
            <Badge variant="outline" className="bg-primary/10">
              {simulationState.rawData.length} Data Points
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Visualizing cross-exchange arbitrage execution with market impact modeling
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          {!isTraining ? (
            <Button onClick={handleTrainModel} disabled={isTraining}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {simulationState.modelState.isModelReady ? "Retrain Model" : "Train Model"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 min-w-[200px]">
              <Progress value={trainProgress} className="h-2" />
              <span className="text-xs whitespace-nowrap">{trainProgress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="marketAnalysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="agentPerformance">Agent Performance</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Tables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ArbitrageDecayChart data={visualData.arbitrageDecay} />
            <MarketImpactChart data={visualData.impactCurve} />
            <CumulativeProfitChart data={visualData.cumulativeProfit} />
            <AgentActionTraceChart data={visualData.agentActionTrace} />
          </div>
        </TabsContent>
        
        <TabsContent value="marketAnalysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PriceSpreadChart data={visualData.priceSpread} />
            <LiquidityTrendChart data={visualData.liquidityTrend} />
            <ArbitrageDecayChart data={visualData.arbitrageDecay} />
            <MarketImpactChart data={visualData.impactCurve} />
          </div>
        </TabsContent>
        
        <TabsContent value="agentPerformance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AgentCommunicationHeatmap data={visualData.communicationHeatmap} />
            <VolumeHistogramChart data={visualData.volumeHistogram} />
            <RewardConvergenceChart data={visualData.rewardConvergence} />
            <AgentActionTraceChart data={visualData.agentActionTrace} />
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 gap-6">
            <TradeAnalysisTable 
              actions={simulationState.actions} 
              metrics={simulationState.metrics || {
                totalProfit: 0,
                totalVolume: 0,
                totalImpactCost: 0,
                netProfit: 0,
                successRate: 0,
                avgExecutionTime: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
                returnOnCapital: 0,
                numOpportunities: 0,
              }} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Visualization;
