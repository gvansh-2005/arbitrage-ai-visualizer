
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";

interface VolumeHistogramChartProps {
  data: any[];
}

const VolumeHistogramChart: React.FC<VolumeHistogramChartProps> = ({ data }) => {
  // Sort data by volume for better visualization
  const sortedData = [...data].sort((a, b) => b.totalVolume - a.totalVolume);
  
  // Calculate average volume across all agents
  const avgVolume = data.reduce((sum, item) => sum + item.totalVolume, 0) / data.length;

  // Define colors
  const colors = ["#2962FF", "#00BCD4", "#7B1FA2", "#FFC107", "#00E5FF"];

  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <CardTitle>Execution Volume by Agent</CardTitle>
        <CardDescription>
          Shows total trade volume executed by each agent
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 10, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(125,125,125,0.2)" vertical={false} />
            <XAxis 
              dataKey="agent" 
              style={{ fontSize: '0.75rem' }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              style={{ fontSize: '0.75rem' }}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === "Volume") return [`${Number(value).toFixed(2)} units`, name];
                if (name === "Profit") return [`$${Number(value).toFixed(2)}`, name];
                return [value, name];
              }}
              contentStyle={{ backgroundColor: "rgba(10,10,20,0.8)", borderColor: "rgba(60,60,80,0.8)" }}
            />
            <Legend />
            
            <ReferenceLine 
              y={avgVolume} 
              stroke="#F6465D" 
              strokeDasharray="3 3"
              label={{ 
                value: 'Avg Volume', 
                position: 'insideBottomRight', 
                fill: '#F6465D',
                fontSize: 12
              }} 
            />
            
            <Bar 
              dataKey="totalVolume" 
              name="Volume" 
              barSize={40}
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default VolumeHistogramChart;
