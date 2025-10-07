"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts"

export default function Charts({ topDevices, successPie }: { topDevices: { device: string; count: number }[]; successPie: { name: string; value: number; fill: string }[] }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Top Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Repairs", color: "oklch(var(--chart-1))" },
            }}
            className="w-full"
          >
            <BarChart data={topDevices}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="device" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Success Rate</CardTitle>
        </CardHeader>
        <CardContent className="grid place-items-center">
          <ChartContainer
            config={{
              Success: { label: "Success", color: "oklch(var(--chart-2))" },
              Failure: { label: "Failure", color: "#ff0000ff" }, // changed to Tailwind red-500
            }}
            className="w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={successPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} 
                data={successPie.map(d => d.name === "Failure" ? { ...d, fill: "#ff0000ff" } : d)} // set fill for Failure
              />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  )
}




