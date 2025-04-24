
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface LiquidityTrendChartProps {
  data: any[];
}

const LiquidityTrendChart: React.FC<LiquidityTrendChartProps> = ({ data }) => {
  // Get all exchange ids from the first data point
  const exchangeIds = Object.keys(data[0] || {}).filter(key => key !== 'time');
  
  // Define colors for each exchange
  const exchangeColors: Record<string, string> = {
    "Exchange_1": "#2962FF",
    "Exchange_2": "#00BCD4",
    "Exchange_3": "#7B1FA2",
    "Exchange_4": "#FFC107",
    "Exchange_5": "#00E5FF",
  };

  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Market Liquidity Trends</CardTitle>
        <CardDescription>
          Shows liquidity levels across different exchanges over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis
              style={{ fontSize: '0.75rem' }}
              domain={[0, 1]}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              formatter={(value: any) => [value.toFixed(3), undefined]}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
              contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
            />
            <Legend />
            
            {exchangeIds.map((exchange, index) => (
              <Area
                key={exchange}
                type="monotone"
                dataKey={exchange}
                name={exchange}
                stroke={exchangeColors[exchange] || `hsl(${index * 60}, 80%, 50%)`}
                fill={exchangeColors[exchange] || `hsl(${index * 60}, 80%, 50%)`}
                fillOpacity={0.2}
                stackId="1"
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LiquidityTrendChart;
