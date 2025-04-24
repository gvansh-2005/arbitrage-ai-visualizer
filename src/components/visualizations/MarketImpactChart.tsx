
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ZAxis
} from "recharts";

interface MarketImpactChartProps {
  data: any[];
}

const MarketImpactChart: React.FC<MarketImpactChartProps> = ({ data }) => {
  // Group data by exchange
  const exchangeData: Record<string, any[]> = {};
  data.forEach(item => {
    if (!exchangeData[item.exchange]) {
      exchangeData[item.exchange] = [];
    }
    exchangeData[item.exchange].push(item);
  });

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
        <CardTitle>Trade Volume vs. Market Impact</CardTitle>
        <CardDescription>
          Illustrates how trade size affects market price across different exchanges
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" />
            <XAxis 
              type="number" 
              dataKey="volume" 
              name="Volume" 
              unit=" units"
              domain={['auto', 'auto']}
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis 
              type="number" 
              dataKey="impact" 
              name="Price Impact" 
              unit=" %"
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => value.toFixed(3)}
            />
            <ZAxis 
              type="number" 
              dataKey="netProfit" 
              range={[50, 500]} 
              name="Net Profit" 
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any, name: string) => {
                if (name === "Price Impact") return [`${Number(value).toFixed(4)} %`, name];
                if (name === "Volume") return [`${Number(value).toFixed(2)} units`, name];
                return [value, name];
              }}
              contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
            />
            <Legend />
            {Object.keys(exchangeData).map((exchange, index) => (
              <Scatter 
                key={exchange}
                name={exchange} 
                data={exchangeData[exchange]} 
                fill={exchangeColors[exchange] || `hsl(${index * 60}, 80%, 50%)`}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MarketImpactChart;
