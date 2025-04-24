
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceSpreadChartProps {
  data: any[];
}

const PriceSpreadChart: React.FC<PriceSpreadChartProps> = ({ data }) => {
  // Get all keys from the first data point
  const allKeys = Object.keys(data[0] || {}).filter(key => key !== 'time');
  
  // Separate exchange prices and spreads
  const exchanges = allKeys.filter(key => !key.includes('-'));
  const spreads = allKeys.filter(key => key.includes('-'));
  
  // Define colors
  const exchangeColors: Record<string, string> = {
    "Exchange_1": "#2962FF",
    "Exchange_2": "#00BCD4",
    "Exchange_3": "#7B1FA2",
    "Exchange_4": "#FFC107",
    "Exchange_5": "#00E5FF",
  };
  
  const spreadColors: Record<string, string> = {
    "Exchange_1-Exchange_2": "#F6465D",
    "Exchange_1-Exchange_3": "#0ECB81",
    "Exchange_2-Exchange_3": "#B8B8B8",
  };

  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Price Spreads Between Exchanges</CardTitle>
        <CardDescription>
          Visualizes price differences between exchanges over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prices">
          <TabsList className="mb-4">
            <TabsTrigger value="prices">Prices</TabsTrigger>
            <TabsTrigger value="spreads">Spreads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prices" className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  style={{ fontSize: '0.75rem' }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, undefined]}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
                />
                <Legend />
                
                {exchanges.map((exchange) => (
                  <Line
                    key={exchange}
                    type="monotone"
                    dataKey={exchange}
                    name={exchange}
                    stroke={exchangeColors[exchange] || "#666"}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="spreads" className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  style={{ fontSize: '0.75rem' }}
                />
                <YAxis
                  style={{ fontSize: '0.75rem' }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, undefined]}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                  contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
                />
                <Legend />
                
                {spreads.map((spread) => (
                  <Line
                    key={spread}
                    type="monotone"
                    dataKey={spread}
                    name={`Spread ${spread}`}
                    stroke={spreadColors[spread] || "#666"}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceSpreadChart;
