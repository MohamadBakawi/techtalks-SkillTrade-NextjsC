"use client";

import React from "react";
import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, MapPin, Star, ArrowUpRight, ShieldCheck } from "lucide-react";
import styles from "@/app/(public)/Landing.module.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { Proposal } from "@/types/dashboard";
import Image from "next/image";
import { ProposalDetailsModal } from "../ProposalDetailsModal";
import { useState } from "react";

interface SpotlightProps {
    proposals: Proposal[];
}

export default function Spotlight({ proposals }: SpotlightProps) {
    const container = React.useRef<HTMLDivElement>(null);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (typeof window !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        tl.from(`.${styles.sectionTitle}, .${styles.eyebrow}, .${styles.sectionDescription}`, {
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        })
            .from(".spotlight-card", {
                y: 100,
                opacity: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: "expo.out" // "Viscous" ease
            }, "-=0.5");

    }, { scope: container });

    if (!proposals || proposals.length === 0) return null;

    const getSkillName = (skills: Proposal['offeredSkills'] | Proposal['neededSkills']) => {
        if (!skills || !Array.isArray(skills) || skills.length === 0) return "N/A";
        const first = skills[0] as any;
        if (typeof first === 'string') return first;
        return first.name || first.skill?.name || "N/A";
    };

    return (
        <section ref={container} className={styles.section}>
            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[50vh] bg-primary/5 blur-[120px] rounded-full rotate-12 pointer-events-none" />

            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.eyebrow}>
                        Real-Time Protocol Activity
                    </span>
                    <h2 className={styles.sectionTitle}>
                        Live <span className="text-primary">Syncs.</span>
                    </h2>
                    <p className={styles.sectionDescription}>
                        Watch the network expand as peers authenticate high-value knowledge exchanges across the globe.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {proposals.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => {
                                setSelectedProposal(p);
                                setIsModalOpen(true);
                            }}
                            className={cn(styles.glassCard, "group relative p-0 overflow-hidden hover:border-primary/20 spotlight-card cursor-pointer")}
                        >
                            <div className={styles.viscousGlow} />
                            <div className="h-64 overflow-hidden relative">
                                {p.imageUrl ? (
                                    <Image
                                        src={p.imageUrl}
                                        alt={p.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        <Zap className="w-16 h-16 text-primary/40 animate-pulse" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />

                                {/* Modality Badge Floating */}
                                <div className="absolute top-6 right-6">
                                    <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 shadow-2xl">
                                        {p.modality === "REMOTE" ? <Zap className="w-3 h-3 text-primary fill-current" /> : <MapPin className="w-3 h-3 text-primary" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{p.modality}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-background shadow-xl">
                                            <AvatarImage src={p.owner?.avatarUrl || ""} />
                                            <AvatarFallback className="font-black text-xs uppercase bg-primary/10 text-primary">{p.owner?.name?.[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg">
                                            <ShieldCheck className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-foreground">{p.owner?.name}</span>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-2 h-2 text-amber-500 fill-current" />
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{p.owner?.reputation?.title || "Contributor"}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black tracking-tight mb-8 group-hover:text-primary transition-colors line-clamp-2 leading-none uppercase italic border-l-4 border-primary/20 pl-6">
                                    {p.title}
                                </h3>

                                <div className="grid grid-cols-2 gap-6 p-6 rounded-[2rem] bg-background/40 border border-white/5 mt-auto">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 block mb-2">Providing</span>
                                        <span className="text-xs font-black truncate block uppercase tracking-tighter">{getSkillName(p.offeredSkills)}</span>
                                    </div>
                                    <div className="border-l border-white/5 pl-6">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-500/60 block mb-2">Seeking</span>
                                        <span className="text-xs font-black truncate block uppercase tracking-tighter">{getSkillName(p.neededSkills)}</span>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-muted-foreground/40 italic">PROTOCOL_ID: {p.id.slice(0, 8)}</span>
                                    <ArrowUpRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedProposal && (
                <ProposalDetailsModal
                    proposal={selectedProposal}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    isOwner={false}
                />
            )}
        </section>
    );
}
