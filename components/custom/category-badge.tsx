"use client"

import { Badge } from "@/components/ui/badge"
import { Category } from "@/lib/api"

interface CategoryBadgeProps {
    category?: Category | null
    size?: "sm" | "default"
}

export function CategoryBadge({ category, size = "default" }: CategoryBadgeProps) {
    if (!category) return null

    return (
        <Badge
            variant="outline"
            className={size === "sm" ? "text-xs px-1.5 py-0" : ""}
        >
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
        </Badge>
    )
}
