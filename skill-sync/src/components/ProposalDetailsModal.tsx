"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createApplication } from "@/actions/applications";
import { deleteProposal } from "@/actions/proposal-actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Send, Zap, MapPin } from "lucide-react";
import { ReputationBadge } from "@/components/ReputationBadge";
import { Proposal } from "@/types/dashboard";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProposalDetailsModal({
    proposal,
    isOwner,
    isOpen,
    onOpenChange
}: {
    proposal: Proposal,
    isOwner: boolean,
    isOpen: boolean,
    onOpenChange: (open: boolean) => void
}) {
    const [isApplying, setIsApplying] = useState(false);
    const [pitch, setPitch] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleApply = async () => {
        if (!pitch.trim()) return;
        setLoading(true);
        try {
            await createApplication({ proposalId: proposal.id, pitchMessage: pitch });
            toast({ variant: "success", title: "Application Sent!", description: "Good luck!" });
            onOpenChange(false);
            setPitch("");
            setIsApplying(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to send application.";
            toast({ variant: "destructive", title: "Error", description: message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure?")) return;
        setLoading(true);
        try {
            const result = await deleteProposal(proposal.id);
            if (result.success) {
                toast({ variant: "success", title: "Deleted", description: "Proposal deleted." });
                onOpenChange(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: result.message });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
        } finally {
            setLoading(false);
        }
    };

    const getSkillName = (s: { name?: string; skill?: { name: string } } | string) => {
        if (!s) return "Skill";
        if (typeof s === 'string') return s;
        return s.name || s.skill?.name || "Skill";
    };

    const offeredSkill = proposal.offeredSkills?.[0] ? getSkillName(proposal.offeredSkills[0]) : "Skill";
    const neededSkills = proposal.neededSkills || [];
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap className="w-4 h-4" /> : <MapPin className="w-4 h-4" />;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {!isOpen && (
                <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 rounded-xl font-bold hover:bg-primary/5 hover:text-primary transition-all">Details</Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-xl p-0 rounded-[2.5rem] border-none shadow-2xl bg-background overflow-hidden flex flex-col h-[85vh]">
                <ScrollArea className="flex-1 w-full">
                    {proposal.imageUrl && (
                        <div className="h-64 w-full relative group">
                            <Image
                                src={proposal.imageUrl}
                                alt={proposal.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                        </div>
                    )}
                    <div className={cn("p-10 bg-gradient-to-br from-primary/5 via-background to-background", !proposal.imageUrl && "pt-12")}>
                        <DialogHeader className="mb-8 text-left">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    {modalityIcon}
                                </div>
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-none uppercase tracking-widest text-[10px] font-black">
                                    {String(proposal.modality).replace("_", " ")}
                                </Badge>
                            </div>
                            <DialogTitle className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">{proposal.title}</DialogTitle>

                            {proposal.owner && (
                                <div className="flex items-center gap-3 mt-6">
                                    <Link href={`/profile/${proposal.ownerId}`} className="group">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                            Posted by <span className="text-primary font-black group-hover:underline">{proposal.owner.name}</span>
                                        </p>
                                    </Link>
                                    {proposal.owner.reputation && <ReputationBadge reputation={proposal.owner.reputation} size="sm" />}
                                </div>
                            )}
                        </DialogHeader>

                        <div className="space-y-8">
                            <div className="relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 rounded-full" />
                                <p className="pl-6 text-muted-foreground text-lg leading-relaxed font-medium">
                                    {proposal.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-8 bg-muted/20 p-8 rounded-3xl border border-border/50">
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block">Teach</span>
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-2 rounded-xl text-sm font-black italic">{offeredSkill}</Badge>
                                </div>
                                <div className="space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 block">Seek</span>
                                    <div className="flex flex-wrap gap-2">
                                        {neededSkills.map((s) => (
                                            <Badge key={(s as any).id || Math.random()} variant="secondary" className="bg-orange-500/10 text-orange-600 border-none px-4 py-2 rounded-xl text-sm font-black italic">
                                                {getSkillName(s as any)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="border-t border-border/10 p-8 pt-6 !flex-col md:!flex-row !justify-between items-center gap-4 bg-background/80 backdrop-blur-xl shrink-0">
                    <div className="w-full md:w-auto">
                        {!isOwner && (
                            <Button variant="ghost" size="sm" className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] hover:text-destructive transition-colors" asChild>
                                <a href={`mailto:support@skillswap.com?subject=Report%20Proposal:%20${proposal.title}&body=Proposal%20ID:%20${proposal.id}%0A%0AReason%20for%20reporting:`}>
                                    Flag Content
                                </a>
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4 items-center w-full md:w-auto">
                        {isOwner ? (
                            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="w-full md:w-auto h-14 rounded-2xl font-black uppercase tracking-tight px-8 shadow-xl shadow-destructive/10 hover:scale-105 active:scale-95 transition-all">
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} Delete Proposal
                            </Button>
                        ) : (
                            !isApplying ? (
                                <Button onClick={() => setIsApplying(true)} className="h-16 w-full md:w-auto px-10 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
                                    Request Swap <Zap className="w-5 h-5" />
                                </Button>
                            ) : (
                                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <Textarea
                                        placeholder="Introduce yourself and explain why this is a perfect match..."
                                        value={pitch}
                                        onChange={e => setPitch(e.target.value)}
                                        className="min-h-[120px] rounded-2xl border-2 border-primary/20 focus:border-primary p-4 text-base font-medium"
                                    />
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setIsApplying(false)} className="h-14 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</Button>
                                        <Button onClick={handleApply} disabled={loading} className="h-14 flex-[2] rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/10">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Send Request
                                        </Button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
