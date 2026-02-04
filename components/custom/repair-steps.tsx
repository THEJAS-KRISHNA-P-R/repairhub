"use client"

import ReactMarkdown from "react-markdown"

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
					<div className="prose prose-sm dark:prose-invert max-w-none">
						<ReactMarkdown>
							{steps || "No repair steps provided."}
						</ReactMarkdown>
					</div>
				)}
			</section>
		</div>
	)
}
