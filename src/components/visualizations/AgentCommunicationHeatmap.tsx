
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AgentCommunicationHeatmapProps {
  data: {
    agents: string[];
    data: { from: string; to: string; count: number }[];
  };
}

const AgentCommunicationHeatmap: React.FC<AgentCommunicationHeatmapProps> = ({ data }) => {
  const [sort, setSort] = React.useState<"frequency" | "alphabetical">("frequency");

  // Sort data based on selection
  const sortedData = React.useMemo(() => {
    if (sort === "alphabetical") {
      return {
        ...data,
        agents: [...data.agents].sort(),
      };
    } else {
      // Sort by total frequency
      const agentTotals = data.agents.map(agent => {
        const total = data.data.reduce((sum, item) => {
          if (item.from === agent || item.to === agent) {
            return sum + item.count;
          }
          return sum;
        }, 0);
        return { agent, total };
      });
      
      return {
        ...data,
        agents: agentTotals.sort((a, b) => b.total - a.total).map(item => item.agent),
      };
    }
  }, [data, sort]);

  // Calculate max count for color intensity
  const maxCount = Math.max(...data.data.map(d => d.count), 1);

  return (
    <Card className="data-card h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Inter-Agent Communication Heatmap</CardTitle>
            <CardDescription>
              Visualizes message frequency between different agents
            </CardDescription>
          </div>
          <Select
            value={sort}
            onValueChange={(value) => setSort(value as "frequency" | "alphabetical")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequency">Sort by Frequency</SelectItem>
              <SelectItem value="alphabetical">Sort Alphabetically</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <div className="w-full h-full overflow-auto">
            <div className="flex justify-center">
              <div style={{ display: "grid", gridTemplateColumns: `auto ${sortedData.agents.map(() => "1fr").join(" ")}` }}>
                {/* Empty corner cell */}
                <div className="p-2"></div>
                
                {/* Column headers */}
                {sortedData.agents.map(agent => (
                  <div 
                    key={`col-${agent}`}
                    className="p-2 text-center font-medium text-xs rotate-45 origin-bottom-left whitespace-nowrap"
                    style={{ height: '80px' }}
                  >
                    {agent}
                  </div>
                ))}

                {/* Rows */}
                {sortedData.agents.map(fromAgent => (
                  <React.Fragment key={`row-${fromAgent}`}>
                    {/* Row header */}
                    <div className="p-2 text-xs font-medium whitespace-nowrap">
                      {fromAgent}
                    </div>

                    {/* Cells */}
                    {sortedData.agents.map(toAgent => {
                      const cell = sortedData.data.find(
                        d => d.from === fromAgent && d.to === toAgent
                      );
                      const count = cell?.count || 0;
                      const intensity = count / maxCount;
                      
                      const bgColor = fromAgent === toAgent ? 
                        'bg-muted' : 
                        `rgba(41, 98, 255, ${intensity})`;
                      
                      return (
                        <div 
                          key={`${fromAgent}-${toAgent}`}
                          className="p-2 text-center text-xs border border-border/20"
                          style={{ 
                            backgroundColor: bgColor,
                            color: intensity > 0.6 ? 'white' : 'inherit',
                            position: 'relative'
                          }}
                          title={`${fromAgent} → ${toAgent}: ${count} messages`}
                        >
                          {intensity > 0 ? count : ""}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AgentCommunicationHeatmap;
