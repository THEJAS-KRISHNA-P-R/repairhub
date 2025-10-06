"use client"

import { Card, CardContent } from "@/components/ui/card"

export function RepairSteps({ issue, steps, isLoading }: { issue: string; steps: string; isLoading?: boolean }) {
	return (
		<div className="space-y-4">
			<section>
				<h2 className="mb-1 text-sm font-medium text-muted-foreground">Issue</h2>
				{isLoading ? (
					<div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
				) : (
					<p>{issue || "No issue description provided."}</p>
				)}
			</section>
			<section>
				<h2 className="mb-1 text-sm font-medium text-muted-foreground">Steps</h2>
				{isLoading ? (
					<div className="space-y-2">
						<div className="h-4 w-full animate-pulse rounded bg-muted" />
						<div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
						<div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
					</div>
				) : (
					<p className="whitespace-pre-wrap">{steps || "No repair steps provided."}</p>
				)}
			</section>
		</div>
	)
}
