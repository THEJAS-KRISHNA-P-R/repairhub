"use client"

import { useState } from "react"
import { reportsAPI } from "@/lib/api"
import { useApi } from "@/lib/api-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Flag, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReportDialogProps {
    targetType: 'post' | 'comment' | 'user'
    targetId: string
    triggerClassName?: string
}

const REPORT_REASONS = [
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'harassment', label: 'Harassment or abuse' },
    { value: 'misinformation', label: 'Misinformation' },
    { value: 'other', label: 'Other' },
]

export function ReportDialog({ targetType, targetId, triggerClassName }: ReportDialogProps) {
    const { currentUser } = useApi()
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [description, setDescription] = useState("")
    const [submitting, setSubmitting] = useState(false)

    if (!currentUser) return null

    const handleSubmit = async () => {
        if (!reason) {
            toast.error("Please select a reason")
            return
        }

        setSubmitting(true)
        try {
            await reportsAPI.create({
                target_type: targetType,
                target_id: targetId,
                reason,
                description: description.trim() || undefined
            })
            toast.success("Report submitted. Thank you!")
            setOpen(false)
            setReason("")
            setDescription("")
        } catch (error) {
            toast.error("Failed to submit report")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className={triggerClassName}>
                    <Flag className="h-4 w-4 mr-1" />
                    Report
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report {targetType}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Reason</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Additional details (optional)</Label>
                        <Textarea
                            placeholder="Provide more context..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
