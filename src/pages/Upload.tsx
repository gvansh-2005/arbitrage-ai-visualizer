
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FileUp, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import {
  ArbitrageDataPoint,
  convertToCSV,
  generateSampleData,
  parseCSV
} from "@/utils/dataGenerator";
import { processData, SimulationState } from "@/utils/modelSimulation";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processProgress, setProcessProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [dataPreview, setDataPreview] = useState<ArbitrageDataPoint[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 50);
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        clearInterval(timer);
        setUploadProgress(100);
        
        const csvData = event.target?.result as string;
        const parsedData = parseCSV(csvData);
        
        // Show a preview of the data
        setDataPreview(parsedData.slice(0, 5) as ArbitrageDataPoint[]);
        
        toast({
          title: "Upload successful",
          description: `Uploaded ${file.name} with ${parsedData.length} data points`,
        });
        
        // After a brief delay, reset the upload state
        setTimeout(() => {
          setIsUploading(false);
        }, 500);
        
      } catch (error) {
        clearInterval(timer);
        setIsUploading(false);
        console.error("Failed to parse CSV:", error);
        
        toast({
          title: "Upload failed",
          description: "The file format is invalid. Please use the correct CSV format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  const handleGenerateData = () => {
    // Generate sample data
    const sampleData = generateSampleData(3, 100);
    
    setFileName("sample_data.csv");
    setDataPreview(sampleData.slice(0, 5));
    
    toast({
      title: "Sample data generated",
      description: `Created ${sampleData.length} data points for simulation`,
    });
  };
  
  const handleProcessData = async () => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    // Simulate processing progress
    const timer = setInterval(() => {
      setProcessProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
    
    try {
      // Process the data (either sample or uploaded)
      const data = dataPreview.length > 0 
        ? await processData(dataPreview)
        : await processData();
      
      // Store data in sessionStorage for use in other pages
      sessionStorage.setItem('simulationState', JSON.stringify(data));
      
      // Complete progress
      clearInterval(timer);
      setProcessProgress(100);
      
      toast({
        title: "Processing complete",
        description: "Data processed successfully, redirecting to visualizations",
      });
      
      // Redirect to visualization page after a brief delay
      setTimeout(() => {
        navigate("/visualization");
      }, 1000);
      
    } catch (error) {
      clearInterval(timer);
      setIsProcessing(false);
      console.error("Failed to process data:", error);
      
      toast({
        title: "Processing failed",
        description: "Failed to process the data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadSample = () => {
    // Generate sample data
    const sampleData = generateSampleData(3, 20);
    
    // Convert to CSV
    const csv = convertToCSV(sampleData);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arbitrage_sample_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sample downloaded",
      description: "Sample CSV file has been downloaded",
    });
  };
  
  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="data-card">
            <h2 className="card-title">Upload Dataset</h2>
            <p className="card-subtitle">Upload a CSV file containing cross-exchange arbitrage data</p>
            
            <div className="mt-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Drag & drop your file here</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click the button below to select from your computer
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading || isProcessing}
                  />
                  <Button className="w-full">Select File</Button>
                </div>
                {isUploading && (
                  <div className="mt-4">
                    <p className="text-sm mb-2">Uploading {fileName}...</p>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Don't have data?</h3>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleGenerateData} disabled={isProcessing}>
                  Generate Sample Data
                </Button>
                <Button variant="outline" onClick={handleDownloadSample}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card className="data-card">
            <h2 className="card-title">Data Preview</h2>
            <p className="card-subtitle">Preview of the dataset to be processed</p>
            
            {dataPreview.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="data-grid w-full">
                  <thead>
                    <tr>
                      <th>Exchange</th>
                      <th>Price</th>
                      <th>Volume</th>
                      <th>Liquidity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, i) => (
                      <tr key={i}>
                        <td>{row.exchange_id}</td>
                        <td>${row.price.toFixed(2)}</td>
                        <td>{row.volume.toFixed(2)}</td>
                        <td>{row.liquidity_level.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-right text-xs text-muted-foreground mt-2">
                  Showing {dataPreview.length} out of {dataPreview.length * 20} entries
                </p>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-8 text-center mt-4">
                <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No data available. Please upload a CSV file or generate sample data.
                </p>
              </div>
            )}
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-medium mb-4">Expected CSV Format</h3>
              <p className="text-sm text-muted-foreground mb-2">Each row should contain:</p>
              <code className="text-xs bg-muted p-2 rounded block mb-4 overflow-x-auto">
                timestamp,exchange_id,price,volume,bid,ask,liquidity_level
              </code>
              
              <Button
                className="w-full"
                disabled={isProcessing || dataPreview.length === 0}
                onClick={handleProcessData}
              >
                {isProcessing ? "Processing..." : "Process Data"}
              </Button>
              
              {isProcessing && (
                <div className="mt-4">
                  <Progress value={processProgress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    {processProgress < 100 
                      ? "Processing data and training model..."
                      : "Complete! Redirecting..."}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Upload;
