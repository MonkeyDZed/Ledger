
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["hsl(var(--chart-2))", "hsl(var(--chart-4))"];

interface FinancialOverviewChartProps {
    data: { paid: number; toPay: number };
}

export function FinancialOverviewChart({ data }: FinancialOverviewChartProps) {
  const chartData = [
    { name: 'Payé', value: data.paid },
    { name: 'Reste à payer', value: data.toPay },
  ];
  const total = data.paid + data.toPay;

  return (
    <div className="w-full h-[200px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value) => formatCurrency(value as number)}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold">{formatCurrency(total / 1000)}k</span>
        <span className="text-sm text-muted-foreground">Total</span>
      </div>
    </div>
  )
}
