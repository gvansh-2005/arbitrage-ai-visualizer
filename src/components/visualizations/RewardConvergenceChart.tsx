
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
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface RewardConvergenceChartProps {
  data: any[];
}

const RewardConvergenceChart: React.FC<RewardConvergenceChartProps> = ({ data }) => {
  // Calculate moving average
  const movingAvgData = data.map((item, index) => {
    const windowSize = 5;
    const start = Math.max(0, index - windowSize + 1);
    const window = data.slice(start, index + 1);
    const sum = window.reduce((acc, curr) => acc + curr.avgReward, 0);
    const avg = sum / window.length;
    
    return {
      ...item,
      movingAverage: avg
    };
  });
  
  // Calculate final average reward
  const finalAvgReward = data.length > 0 
    ? data[data.length - 1].avgReward 
    : 0;

  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Reward Convergence</CardTitle>
        <CardDescription>
          Shows learning progress as average reward improves over episodes
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={movingAvgData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" />
            <XAxis
              dataKey="episode"
              style={{ fontSize: '0.75rem' }}
              label={{ value: 'Episode', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              label={{ value: 'Reward', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, undefined]}
              contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
            />
            <Legend />
            
            <ReferenceLine 
              y={finalAvgReward} 
              stroke="#0ECB81" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Final Reward', 
                position: 'right', 
                fill: '#0ECB81',
                fontSize: 12
              }} 
            />
            
            <Line
              type="monotone"
              dataKey="avgReward"
              name="Per Episode Reward"
              stroke="#00BCD4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              name="Moving Average (5)"
              stroke="#2962FF"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RewardConvergenceChart;
