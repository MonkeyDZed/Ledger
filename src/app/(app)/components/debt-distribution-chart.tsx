"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartTooltipContent, ChartContainer, ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

const chartConfig = {
  debt: {
    label: "Créance",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface DebtDistributionChartProps {
    data: { name: string; debt: number }[];
}

export function DebtDistributionChart({ data }: DebtDistributionChartProps) {
  return (
     <ChartContainer config={chartConfig} className="w-full h-[250px]">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" dataKey="debt" tickFormatter={(value) => `${value / 1000}k`} axisLine={false} tickLine={false} />
            <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent 
                formatter={(value) => formatCurrency(value as number)}
                indicator="dot"
              />}
            />
            <Bar dataKey="debt" fill="var(--color-debt)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
  )
}
