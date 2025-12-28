"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { getNotifications, markNotificationAsRead } from "@/actions/notifications";
import { deleteProposal } from "@/actions/proposal-actions";
import { createSwapFromApplication, updateSwapStatus } from "@/actions/swaps";
import { updateApplicationStatus } from "@/actions/applications";
import { createReview } from "@/actions/reviews";
import styles from './Dashboard.module.css';

// UI Components
import { PostProposalModal } from "@/components/PostProposalModal";
import { ChatModal } from "@/components/ChatModal";
import { ProposalDetailsModal } from "@/components/ProposalDetailsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import {
  Bell, LogOut, Zap, MapPin, Search, Layers, Trash2, CheckCircle, XCircle, UserCircle, Plus, Home, MoreVertical, Star, AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NavSearchButton from "../../../components/features/search/NavSearchButton";

// --- Types ---
interface DashboardProps {
  overview: any; myProposals: any[]; publicOnlyProposals: any[];
  search: string; rawModality: string; activeTab: string;
  swaps: any[]; applications: any[];
}

// --- Main Client Component ---
export default function DashboardClientContent({
  overview, myProposals, publicOnlyProposals, activeTab, swaps, applications,
}: DashboardProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingSwap, setReviewingSwap] = useState<any | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const rawData = await getNotifications();
        // FIX: Cast the unknown data from the raw query to an array type.
        const data = rawData as any[]; 
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (e) { console.error(e); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteProposal(id);
    if (res.success) {
      toast({ title: "Deleted", description: "Proposal removed." });
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Error", description: res.message });
    }
  };

  const handleAccept = async (appId: string) => {
    try {
      await createSwapFromApplication(appId);
      toast({ title: "Accepted!", description: "Swap started." });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error accepting." }); }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateApplicationStatus({ applicationId: appId, status: "REJECTED" });
      router.refresh();
    } catch (e) { toast({ variant: "destructive", title: "Error rejecting." }); }
  };

  const handleUpdateSwapStatus = async (swapId: string, status: "COMPLETED" | "CLOSED") => {
    if (status === "CLOSED" && !confirm("Are you sure you want to cancel this swap? This action cannot be undone.")) return;
    try {
        await updateSwapStatus({ swapId, status });
        toast({ title: "Swap Updated", description: `The swap has been marked as ${status.toLowerCase()}.` });
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update swap status." });
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
        setReviewError("Please select a rating.");
        return;
    }
    if (!reviewingSwap) return;
    
    try {
        await createReview({ swapId: reviewingSwap.id, rating, comment });
        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        setReviewingSwap(null);
        setReviewModalOpen(false);
        setRating(0);
        setComment("");
        setReviewError("");
        router.refresh();
    } catch (error: any) {
        setReviewError(error.message || "Failed to submit review.");
    }
  }

  const handleOpenReviewModal = (swap: any) => {
    setReviewingSwap(swap);
    setReviewModalOpen(true);
    setRating(0);
    setComment("");
    setReviewError("");
  };

  const NavLink = ({ id, label, icon: Icon }: any) => (
    <Link href={`?tab=${id}`} className={`${styles.navLink} ${activeTab === id ? styles.active : ''}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );

  const tabTitle = {
    "browse": "Browse Proposals", "my-proposals": "My Proposals", "active-swaps": "Active Swaps",
  }[activeTab] || "Dashboard";

  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>Skill<span>Swap</span></Link>
        <nav className="flex flex-col gap-2">
          <p className={styles.navGroupTitle}>Menu</p>
          <NavLink id="browse" label="Browse" icon={Search} />
          <NavLink id="my-proposals" label="My Proposals" icon={Layers} />
          <NavLink id="active-swaps" label="Active Swaps" icon={Zap} />
        </nav>
        <div className={styles.sidebarFooter}>
           <Link href={`/profile/${overview.user?.id}`} className={styles.navLink}>
             <UserCircle className="w-5 h-5" /><span>My Profile</span>
           </Link>
           <Link href="/" className={styles.navLink}>
             <Home className="w-5 h-5" /><span>Landing Page</span>
           </Link>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>{tabTitle}</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {overview.user?.name || "User"}!</p>
          </div>
          <div className={styles.headerActions}>
            <NavSearchButton />
            <PostProposalModal />
            <ThemeToggleButton />
            <Notifications notifications={notifications} unreadCount={unreadCount} handleMarkRead={handleMarkRead} />
            <UserMenu user={overview.user} />
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "browse" && <BrowseTabContent publicOnlyProposals={publicOnlyProposals} />}
          {activeTab === "my-proposals" && <MyProposalsTabContent myProposals={myProposals} handleDelete={handleDeleteProposal} />}
          {activeTab === "active-swaps" && <ActiveSwapsTabContent applications={applications} swaps={swaps} user={overview.user} handleAccept={handleAccept} handleReject={handleReject} handleComplete={handleUpdateSwapStatus} handleCancel={handleUpdateSwapStatus} handleReview={handleOpenReviewModal}/>}
        </div>
      </main>

      <Dialog open={isReviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Leave a Review for {reviewingSwap?.proposal?.title}</DialogTitle>
                <DialogDescription>
                    How was your experience with {reviewingSwap?.teacherId === overview.user?.id ? reviewingSwap?.student.name : reviewingSwap?.teacher.name}? Your review is required to close the swap.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReviewSubmit}>
                <div className="py-4 space-y-4">
                    <div>
                        <Label>Rating</Label>
                        <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    className={`cursor-pointer h-8 w-8 transition-colors ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="comment">Comment (Optional)</Label>
                        <Textarea id="comment" value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." className="mt-2" />
                    </div>
                    {reviewError && (
                        <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{reviewError}</p>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Submit Review</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-Components ---

const SwapCard = ({ swap, partner, currentUserId, onComplete, onCancel, onReview, hasReviewed }: any) => {
    const prematureClosureReasons = [
        "Mutual agreement", "Partner unresponsive", "Skill mismatch", "Other"
    ];

    return (
        <div className={styles.swapCard}>
            <div className={styles.partnerInfo}>
                <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={partner.avatarUrl} />
                    <AvatarFallback>{partner.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-bold text-foreground">{partner.name}</h4>
                    <p className="text-sm text-primary">{swap.proposal.title}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <ChatModal
                    swapId={swap.id}
                    currentUserId={currentUserId}
                    otherUserName={partner.name}
                />
                <div className="flex items-center gap-2">
                    {swap.status === 'ACTIVE' && (
                        <>
                            <Button size="sm" onClick={() => onComplete(swap.id, 'COMPLETED')}>Complete</Button>
                        </>
                    )}
                    {swap.status === 'COMPLETED' && !hasReviewed && (
                        <Button size="sm" variant="outline" onClick={() => onReview(swap)}>Leave Review</Button>
                    )}
                    {swap.status === 'COMPLETED' && hasReviewed && (
                        <Badge variant="secondary"><CheckCircle className="w-4 h-4 mr-2" />Reviewed</Badge>
                    )}
                    {swap.status === 'CLOSED' && (
                        <Badge variant="destructive">Cancelled</Badge>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {swap.status === 'ACTIVE' && (
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Cancel Swap</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuLabel>Reason for cancellation</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {prematureClosureReasons.map(reason => (
                                                 <DropdownMenuItem key={reason} onClick={() => onCancel(swap.id, 'CLOSED')}>
                                                     {reason}
                                                 </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <a className="text-destructive focus:text-destructive" href={`mailto:support@skillswap.com?subject=Report%20Swap:%20${swap.proposal.title}&body=Swap%20ID:%20${swap.id}%0A%0AReason%20for%20reporting:`}>Report Swap</a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

const ActiveSwapsTabContent = ({ applications, swaps, user, handleAccept, handleReject, handleComplete, handleCancel, handleReview }: any) => {
  const pendingApps = applications.filter((a: any) => a.status === "PENDING");
  return (
    <div className="space-y-12">
      {pendingApps.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-foreground mb-4">Pending Requests</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {pendingApps.map((app: any) => (
              <ApplicationCard key={app.id} app={app} onAccept={handleAccept} onReject={handleReject} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="text-xl font-bold text-foreground mb-4">Active Conversations</h3>
        {swaps.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No active swaps yet. Accept a proposal to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {swaps.map((swap: any) => {
              const partner = swap.teacherId === user.id ? swap.student : swap.teacher;
              const hasReviewed = swap.reviews?.some((r: any) => r.authorId === user.id);
              return <SwapCard key={swap.id} swap={swap} partner={partner} currentUserId={user.id} onComplete={handleComplete} onCancel={handleCancel} onReview={handleReview} hasReviewed={hasReviewed} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
};


// --- Other Helper Components (Unchanged) ---

const BrowseTabContent = ({ publicOnlyProposals }: any) => (
  <div className={styles.cardGrid}>
    {publicOnlyProposals.length === 0 ? (
      <EmptyState message="No public proposals found. Be the first to post!" />
    ) : (
      publicOnlyProposals.map((p: any) => <ProposalCard key={p.id} proposal={p} />)
    )}
  </div>
);

const MyProposalsTabContent = ({ myProposals, handleDelete }: any) => (
  <div className={styles.cardGrid}>
    {myProposals.length === 0 ? (
      <EmptyState message="You haven't posted any proposals yet." />
    ) : (
      myProposals.map((p: any) => <ProposalCard key={p.id} proposal={p} isOwner onDelete={handleDelete} />)
    )}
  </div>
);

const ProposalCard = ({ proposal, isOwner = false, onDelete }: any) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalityIcon = proposal.modality === "REMOTE" ? <Zap size={14} /> : <MapPin size={14} />;
    const offered = proposal.offeredSkills?.[0]?.name || "N/A";
    const needed = proposal.neededSkills?.map((s: any) => s.name).join(", ") || "N/A";

    return (
        <div className={styles.card}>
            {proposal.imageUrl && <img src={proposal.imageUrl} alt={proposal.title} className="w-full h-32 object-cover rounded-t-lg" />}
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{proposal.title}</h3>
                <div className={styles.cardBadge}>{modalityIcon} {proposal.modality}</div>
            </div>
            <div className={styles.cardBody}>
                <div className={styles.skillRow}>
                    <p className={`${styles.skillLabel} ${styles.offered}`}>Offers</p>
                    <p className={styles.skillName}>{offered}</p>
                </div>
                <div className={styles.skillRow}>
                    <p className={`${styles.skillLabel} ${styles.needed}`}>Wants</p>
                    <p className={styles.skillName}>{needed}</p>
                </div>
            </div>
            <div className={styles.cardFooter}>
                <ProposalDetailsModal
                    proposal={proposal}
                    isOwner={isOwner}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
                {isOwner && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{proposal._count?.applications || 0} Applicants</span>
                        <button onClick={() => onDelete(proposal.id)} className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ApplicationCard = ({ app, onAccept, onReject }: any) => (
  <div className={styles.applicationCard}>
    <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Request from</p>
          <Link href={`/profile/${app.applicant.id}`} className="font-bold text-foreground hover:underline">{app.applicant.name}</Link>
        </div>
        <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400">PENDING</span>
    </div>
    <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md border border-border mb-4">"{app.pitchMessage}"</p>
    <div className="flex gap-3">
        <button onClick={() => onAccept(app.id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md py-2 font-semibold">
            <CheckCircle size={16} /> Accept
        </button>
        <button onClick={() => onReject(app.id)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-md py-2 font-semibold">
            <XCircle size={16} /> Reject
        </button>
    </div>
  </div>
);

const UserMenu = ({ user }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="h-10 w-10 rounded-full border-2 border-border overflow-hidden hover:border-primary transition-colors">
        <Avatar><AvatarImage src={user?.avatarUrl || ""} /><AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback></Avatar>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
      <DropdownMenuItem asChild><Link href={`/profile/${user?.id}`} className="cursor-pointer">My Profile</Link></DropdownMenuItem>
      <DropdownMenuSeparator className="bg-border" />
      <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Notifications = ({ notifications, unreadCount, handleMarkRead }: any) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="relative h-10 w-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500" />}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80 bg-popover border-border text-popover-foreground">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator className="bg-border" />
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
        ) : (
          notifications.map((n: any) => (
            <DropdownMenuItem key={n.id} onClick={() => handleMarkRead(n.id)} className={`cursor-pointer ${!n.isRead ? 'bg-primary/10' : ''}`}>
              <div>
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className={styles.emptyState}>
    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-background border-border mb-4">
      <Layers className="h-8 w-8 text-muted-foreground" />
    </div>
    <p>{message}</p>
  </div>
);