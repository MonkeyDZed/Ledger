
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { formatCurrencyWithLocale } from "@/lib/formatters";
import { useParams } from 'next/navigation';


const COLORS = ["hsl(var(--chart-2))", "hsl(var(--chart-4))"];

interface FinancialOverviewChartProps {
    data: { paid: number; toPay: number };
    paidLabel: string;
    toPayLabel: string;
    currencyLabel: string;
}

export function FinancialOverviewChart({ data, paidLabel, toPayLabel, currencyLabel }: FinancialOverviewChartProps) {
  const params = useParams();
  const lang = params.lang as 'fr' | 'ar';
  
  const chartData = [
    { name: paidLabel, value: data.paid },
    { name: toPayLabel, value: data.toPay },
  ];
  const total = data.paid + data.toPay;

  return (
    <div className="w-full h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value) => `${formatCurrencyWithLocale(value as number, lang)}`}
          />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={5}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
        <span className="text-sm text-muted-foreground">TOTAL</span>
        <div className="text-2xl font-bold font-mono text-gray-800 break-all px-4" suppressHydrationWarning>
          {formatCurrencyWithLocale(total, lang)}
        </div>
      </div>
    </div>
  )
}
