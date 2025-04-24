
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

interface CumulativeProfitChartProps {
  data: any[];
}

const CumulativeProfitChart: React.FC<CumulativeProfitChartProps> = ({ data }) => {
  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Cumulative Profit Comparison</CardTitle>
        <CardDescription>
          Compares profit across different arbitrage strategies over time
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
              type="monotone"
              dataKey="profit"
              name="Multi-Agent Transformer"
              stroke="#0ECB81"
              dot={false}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="staticSplit"
              name="Static Split Strategy"
              stroke="#00BCD4"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Baseline"
              stroke="#B8B8B8"
              dot={false}
              strokeDasharray="5 5"
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CumulativeProfitChart;
