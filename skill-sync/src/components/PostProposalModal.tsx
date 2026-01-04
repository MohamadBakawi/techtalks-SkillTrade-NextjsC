"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Image as ImageIcon, Check, X, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createProposal } from "@/actions/proposal-actions";
import { searchUnsplashImages } from "@/actions/unsplash-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function PostProposalModal({
  triggerClassName,
  buttonText = "Post a Proposal"
}: {
  triggerClassName?: string,
  buttonText?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState<"Remote" | "In-Person">("Remote");
  const [offeredSkill, setOfferedSkill] = useState("");
  const [neededSkills, setNeededSkills] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Image Browser State
  const [isImageBrowserOpen, setImageBrowserOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; url: string; alt?: string; user: { name: string } }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleImageSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = imageSearchQuery || offeredSkill || title || "education";
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchUnsplashImages(query);
      setSearchResults(results);
      if (results.length === 0) {
        toast({ title: "No images found", description: "Try a different search term." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not search for images." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setImageBrowserOpen(false);
    setImageSearchQuery(""); // Clear search query after selection
    setSearchResults([]); // Clear search results after selection
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setOfferedSkill("");
    setNeededSkills("");
    setImageUrl("");
    setImageSearchQuery("");
    setSearchResults([]);
    setImageBrowserOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 10) {
      toast({ variant: "destructive", title: "Error", description: "Title is too short." });
      return;
    }
    setIsLoading(true);

    const dataToSend = {
      title,
      description,
      modality,
      offeredSkillName: offeredSkill,
      neededSkillNames: neededSkills,
      imageUrl,
    };

    try {
      const result = await createProposal(dataToSend);

      if (result.success) {
        toast({ variant: "success", title: "Success!", description: result.message });
        setIsOpen(false);
        clearForm();
        router.refresh();
      } else {
        const errorMsg = result.errors ? Object.values(result.errors).flat().join(' ') : result.message;
        toast({ variant: "destructive", title: "Error", description: errorMsg || "Failed to post proposal." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the Image Browser UI
  const renderImageBrowser = () => (
    <div className="bg-gradient-to-br from-primary/10 via-background to-background p-10 py-12 rounded-[2.5rem]">
      <DialogHeader className="mb-8">
        <DialogTitle className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Select Photo</DialogTitle>
        <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2 opacity-70">
          Find a high-quality cover for your proposal.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleImageSearch} className="flex gap-3 mb-6">
        <Input
          value={imageSearchQuery}
          onChange={(e) => setImageSearchQuery(e.target.value)}
          placeholder="Search Unsplash..."
          className="h-12 rounded-xl border-2 border-border focus:border-primary font-bold px-4"
        />
        <Button type="submit" size="icon" disabled={isSearching} className="h-12 w-12 rounded-xl bg-primary">
          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </form>

      <div className="min-h-[300px] border-2 border-dashed border-border rounded-3xl p-4 mt-2 bg-muted/20 relative overflow-hidden">
        {isSearching && (
          <div className="absolute inset-0 flex justify-center items-center bg-background/40 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {searchResults.length === 0 && !isSearching && (
          <div className="flex flex-col justify-center items-center h-full min-h-[260px] text-sm text-muted-foreground opacity-50">
            <ImageIcon className="w-12 h-12 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs text-center">Enter a keyword above to<br />browse premium cover photos</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {searchResults.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleImageSelect(img.url)}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 group",
                  imageUrl === img.url ? 'border-primary ring-4 ring-primary/20' : 'border-transparent'
                )}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                {imageUrl === img.url && (
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                    <Check className="h-10 w-10 text-white drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] font-black text-white truncate text-left uppercase tracking-tighter">Photo by {img.user.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <DialogFooter className="mt-8">
        <Button type="button" variant="ghost" onClick={() => setImageBrowserOpen(false)} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] w-full border border-border">
          Back to Proposal Form
        </Button>
      </DialogFooter>
    </div>
  );

  // Render the Main Proposal Form UI
  const renderProposalForm = () => (
    <div className="bg-gradient-to-br from-primary/10 via-background to-background p-10 py-12 rounded-[2.5rem]">
      <DialogHeader className="mb-10">
        <DialogTitle className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Create a Sync</DialogTitle>
        <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2 opacity-70">
          Share your expertise and find your perfect skill match.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-primary ml-1">Proposal Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Master Classical Piano" className="h-12 rounded-xl border-2 border-border focus:border-primary font-bold px-4 transition-all" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-primary ml-1">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're offering and what you'd like in return..." className="min-h-[100px] rounded-xl border-2 border-border focus:border-primary font-medium p-4 transition-all" required />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Cover Image (Optional)</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-border group relative">
              {imageUrl ? (
                <>
                  <img src={imageUrl} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl('')} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </>
              ) : (
                <ImageIcon className="text-muted-foreground opacity-30 w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <Button type="button" variant="outline" className="h-12 w-full rounded-xl border-2 border-border font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 hover:text-primary transition-all" onClick={() => setImageBrowserOpen(true)}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {imageUrl ? "Change Photo" : "Add Cover Photo"}
              </Button>
              <p className="text-[9px] text-muted-foreground mt-2 font-bold uppercase tracking-widest text-center opacity-60">Search from millions of photos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Modality</Label>
            <Select value={modality} onValueChange={(val: "Remote" | "In-Person") => setModality(val)}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-border font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-border">
                <SelectItem value="Remote" className="font-bold">Remote</SelectItem>
                <SelectItem value="In-Person" className="font-bold">In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="offered" className="text-xs font-black uppercase tracking-widest text-emerald-500 ml-1">Skill You Teach</Label>
            <Input id="offered" value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)} placeholder="e.g. Piano" className="h-12 rounded-xl border-2 border-emerald-500/20 focus:border-emerald-500 font-bold px-4 transition-all" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="needed" className="text-xs font-black uppercase tracking-widest text-orange-500 ml-1">Skills You Seek (comma separated)</Label>
          <Input id="needed" value={neededSkills} onChange={(e) => setNeededSkills(e.target.value)} placeholder="e.g. Cooking, French" className="h-12 rounded-xl border-2 border-orange-500/20 focus:border-orange-500 font-bold px-4 transition-all" required />
        </div>

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-2xl text-xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
            Publish Proposal
          </Button>
        </DialogFooter>
      </form>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn(
          "flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-6 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95",
          triggerClassName
        )}>
          <Plus className="w-6 h-6" /> {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-background max-h-[90vh] overflow-y-auto custom-scrollbar">
        {isImageBrowserOpen ? renderImageBrowser() : renderProposalForm()}
      </DialogContent>
    </Dialog>
  );
}
