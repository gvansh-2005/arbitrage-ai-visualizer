
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

interface ArbitrageDecayChartProps {
  data: any[];
}

const ArbitrageDecayChart: React.FC<ArbitrageDecayChartProps> = ({ data }) => {
  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Arbitrage Opportunity Decay</CardTitle>
        <CardDescription>
          Shows how arbitrage opportunities diminish over time due to market response
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" />
            <XAxis
              dataKey="time"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              style={{ fontSize: '0.75rem' }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 'auto']}
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, undefined]}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
              contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="spread"
              name="Price Spread"
              stroke="#2962FF"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="profitPotential"
              name="Profit Potential"
              stroke="#00BCD4"
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ArbitrageDecayChart;
