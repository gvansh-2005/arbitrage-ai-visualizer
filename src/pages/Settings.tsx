
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

const Settings = () => {
  const { toast } = useToast();
  
  // Model settings
  const [learningRate, setLearningRate] = useState("0.001");
  const [epochs, setEpochs] = useState("100");
  const [batchSize, setBatchSize] = useState("32");
  const [optimizer, setOptimizer] = useState("adam");
  const [attentionHeads, setAttentionHeads] = useState("8");
  const [layersCount, setLayersCount] = useState("4");
  
  // Visualization settings
  const [darkMode, setDarkMode] = useState(false);
  const [animateCharts, setAnimateCharts] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [chartPrecision, setChartPrecision] = useState("2");
  const [colorTheme, setColorTheme] = useState("blue");
  
  // Advanced settings
  const [debugMode, setDebugMode] = useState(false);
  const [enableExperimental, setEnableExperimental] = useState(false);
  const [cacheResults, setCacheResults] = useState(true);
  
  const handleSaveModelSettings = () => {
    toast({
      title: "Model settings saved",
      description: "Your model configuration has been updated",
    });
  };
  
  const handleSaveVisualizationSettings = () => {
    toast({
      title: "Visualization settings saved",
      description: "Your visualization preferences have been updated",
    });
    
    // Toggle dark mode class on document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleSaveAdvancedSettings = () => {
    toast({
      title: "Advanced settings saved",
      description: "Your advanced configuration has been updated",
    });
  };
  
  const handleResetAllSettings = () => {
    // Reset model settings
    setLearningRate("0.001");
    setEpochs("100");
    setBatchSize("32");
    setOptimizer("adam");
    setAttentionHeads("8");
    setLayersCount("4");
    
    // Reset visualization settings
    setDarkMode(false);
    setAnimateCharts(true);
    setShowTooltips(true);
    setChartPrecision("2");
    setColorTheme("blue");
    
    // Reset advanced settings
    setDebugMode(false);
    setEnableExperimental(false);
    setCacheResults(true);
    
    // Remove dark mode
    document.documentElement.classList.remove('dark');
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  };
  
  const handleClearData = () => {
    // Clear session storage
    sessionStorage.removeItem('simulationState');
    
    toast({
      title: "Data cleared",
      description: "All simulation data has been cleared",
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure the application behavior and appearance
        </p>
      </div>
      
      <Tabs defaultValue="model">
        <TabsList className="mb-6">
          <TabsTrigger value="model">Model Settings</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="model">
          <Card className="data-card">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">Multi-Agent Transformer Settings</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <Input
                      id="learning-rate"
                      value={learningRate}
                      onChange={(e) => setLearningRate(e.target.value)}
                      placeholder="0.001"
                    />
                    <p className="text-xs text-muted-foreground">
                      Step size for model parameter updates
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="epochs">Training Epochs</Label>
                    <Input
                      id="epochs"
                      value={epochs}
                      onChange={(e) => setEpochs(e.target.value)}
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of complete passes through the dataset
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Input
                      id="batch-size"
                      value={batchSize}
                      onChange={(e) => setBatchSize(e.target.value)}
                      placeholder="32"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of samples processed before updating model parameters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="optimizer">Optimizer</Label>
                    <Select value={optimizer} onValueChange={setOptimizer}>
                      <SelectTrigger id="optimizer">
                        <SelectValue placeholder="Select optimizer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adam">Adam</SelectItem>
                        <SelectItem value="rmsprop">RMSprop</SelectItem>
                        <SelectItem value="sgd">SGD</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Algorithm used to update model weights
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-4">Transformer Architecture</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="attention-heads">Attention Heads</Label>
                      <Input
                        id="attention-heads"
                        value={attentionHeads}
                        onChange={(e) => setAttentionHeads(e.target.value)}
                        placeholder="8"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of attention heads in transformer
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="layers-count">Transformer Layers</Label>
                      <Input
                        id="layers-count"
                        value={layersCount}
                        onChange={(e) => setLayersCount(e.target.value)}
                        placeholder="4"
                      />
                      <p className="text-xs text-muted-foreground">
                        Number of transformer encoder layers
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveModelSettings}>Save Settings</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="visualization">
          <Card className="data-card">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">Visualization Settings</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Switch between light and dark theme
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="animate-charts">Animate Charts</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable animations for chart transitions
                      </p>
                    </div>
                    <Switch
                      id="animate-charts"
                      checked={animateCharts}
                      onCheckedChange={setAnimateCharts}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-tooltips">Show Tooltips</Label>
                      <p className="text-xs text-muted-foreground">
                        Display detailed tooltips on chart hover
                      </p>
                    </div>
                    <Switch
                      id="show-tooltips"
                      checked={showTooltips}
                      onCheckedChange={setShowTooltips}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chart-precision">Decimal Precision</Label>
                    <Select value={chartPrecision} onValueChange={setChartPrecision}>
                      <SelectTrigger id="chart-precision">
                        <SelectValue placeholder="Select precision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 decimals</SelectItem>
                        <SelectItem value="1">1 decimal</SelectItem>
                        <SelectItem value="2">2 decimals</SelectItem>
                        <SelectItem value="3">3 decimals</SelectItem>
                        <SelectItem value="4">4 decimals</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Number of decimal places shown in charts
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color-theme">Color Theme</Label>
                    <Select value={colorTheme} onValueChange={setColorTheme}>
                      <SelectTrigger id="color-theme">
                        <SelectValue placeholder="Select color theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="teal">Teal</SelectItem>
                        <SelectItem value="amber">Amber</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Primary color scheme for visualizations
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveVisualizationSettings}>Save Settings</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card className="data-card">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4">Advanced Settings</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="debug-mode">Debug Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable detailed console logging
                      </p>
                    </div>
                    <Switch
                      id="debug-mode"
                      checked={debugMode}
                      onCheckedChange={setDebugMode}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="experimental-features">Experimental Features</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable experimental features (may be unstable)
                      </p>
                    </div>
                    <Switch
                      id="experimental-features"
                      checked={enableExperimental}
                      onCheckedChange={setEnableExperimental}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cache-results">Cache Results</Label>
                      <p className="text-xs text-muted-foreground">
                        Save processed results to improve performance
                      </p>
                    </div>
                    <Switch
                      id="cache-results"
                      checked={cacheResults}
                      onCheckedChange={setCacheResults}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-4">Data Management</h4>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" className="w-full" onClick={handleClearData}>
                      Clear All Simulation Data
                    </Button>
                    <Button variant="outline" className="w-full" onClick={handleResetAllSettings}>
                      Reset All Settings to Default
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveAdvancedSettings}>Save Settings</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
