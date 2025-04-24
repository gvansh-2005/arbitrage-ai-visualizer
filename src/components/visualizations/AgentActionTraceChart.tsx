
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
  Scatter,
  ComposedChart
} from "recharts";

interface AgentActionTraceChartProps {
  data: any[];
}

const AgentActionTraceChart: React.FC<AgentActionTraceChartProps> = ({ data }) => {
  // Group data by agent
  const agents = Array.from(new Set(data.map(d => d.agent)));
  
  // Define colors for each agent
  const agentColors: Record<string, string> = {
    "Agent_Exchange_1": "#2962FF",
    "Agent_Exchange_2": "#00BCD4",
    "Agent_Exchange_3": "#7B1FA2",
    "Agent_Exchange_4": "#FFC107",
    "Agent_Exchange_5": "#00E5FF",
  };

  // Filter actions with volume > 0
  const actionData = data.filter(d => d.volume > 0);

  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Real-time Agent Actions</CardTitle>
        <CardDescription>
          Visualizes each agent's actions and trade volumes over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={actionData}>
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
              label={{ value: 'Volume', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              style={{ fontSize: '0.75rem' }}
              label={{ value: 'Profit', angle: 90, position: 'insideRight' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: any, name: any, props: any) => {
                if (name.includes('volume')) {
                  return [`${Number(value).toFixed(2)} units`, 'Volume'];
                } else if (name.includes('profit')) {
                  return [`$${Number(value).toFixed(2)}`, 'Profit'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
              contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
            />
            <Legend />
            
            {agents.map(agent => (
              <React.Fragment key={agent}>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  name={`${agent} volume`}
                  stroke={agentColors[agent] || "#666"}
                  strokeWidth={2}
                  dot={false}
                  data={actionData.filter(d => d.agent === agent)}
                  connectNulls
                />
                
                <Scatter
                  yAxisId="right"
                  name={`${agent} profit`}
                  dataKey="profit"
                  fill={agentColors[agent] || "#666"}
                  data={actionData.filter(d => d.agent === agent && d.profit > 0)}
                />
              </React.Fragment>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AgentActionTraceChart;
