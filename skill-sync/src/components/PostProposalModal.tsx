"use client";

import React,   { useState } from "react";
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
import { Plus, Loader2, Image as ImageIcon, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createProposal } from "@/actions/proposal-actions";
import { searchUnsplashImages } from "@/actions/unsplash-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function PostProposalModal() {
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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleImageSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSearchQuery) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchUnsplashImages(imageSearchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not search for images." });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
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
        toast({ title: "Success!", description: result.message });
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
    <>
      <DialogHeader>
        <DialogTitle>Search for an Image</DialogTitle>
        <DialogDescription>Find a relevant image for your proposal from Unsplash.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleImageSearch} className="flex gap-2">
        <Input
          value={imageSearchQuery}
          onChange={(e) => setImageSearchQuery(e.target.value)}
          placeholder="e.g., computer, plumbing..."
        />
        <Button type="submit" size="icon" disabled={isSearching}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      </form>

      <div className="min-h-[240px] border rounded-md p-2 mt-2">
        {isSearching && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
        
        {!isSearching && searchResults.length === 0 && (
          <div className="flex justify-center items-center h-full text-sm text-muted-foreground">
            Search for images to get started.
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {searchResults.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleImageSelect(img.url)}
                className={cn(
                  "relative rounded-md overflow-hidden focus:ring-2 focus:ring-primary focus:outline-none group",
                  imageUrl === img.url && 'ring-2 ring-primary'
                )}
              >
                <img src={img.url} alt={img.alt} className="w-full h-24 object-cover" />
                {imageUrl === img.url && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                )}
                <a 
                  href={`${img.user.link}?utm_source=skillswap&utm_medium=referral`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded-tr-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()} // Prevent image selection when clicking the credit link
                >
                  {img.user.name}
                </a>
              </button>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setImageBrowserOpen(false)}>
          Back to Form
        </Button>
      </DialogFooter>
    </>
  );

  // Render the Main Proposal Form UI
  const renderProposalForm = () => (
    <>
      <DialogHeader>
        <DialogTitle>Post a Proposal</DialogTitle>
        <DialogDescription>What can you teach, and what do you want to learn?</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Spanish Lessons for Guitar Basics" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're offering and what you'd like in return..." required />
        </div>
        
        <div className="grid gap-2">
          <Label>Image (Optional)</Label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
              {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <Button type="button" variant="outline" className="w-full" onClick={() => setImageBrowserOpen(true)}>Browse Images</Button>
              {imageUrl && <Button type="button" variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => setImageUrl('')}> <X className="w-3 h-3 mr-1"/> Remove Image</Button>}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Modality</Label>
          <Select value={modality} onValueChange={(val: any) => setModality(val)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="In-Person">In-Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="offered">Your Offered Skill</Label>
          <Input id="offered" value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)} placeholder="e.g. Conversational Spanish" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="needed">Requested Skills (comma-separated)</Label>
          <Input id="needed" value={neededSkills} onChange={(e) => setNeededSkills(e.target.value)} placeholder="e.g. Acoustic Guitar, Music Theory" required />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Post Proposal
          </Button>
        </DialogFooter>
      </form>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-5 rounded-full transition-all duration-300">
          <Plus className="w-5 h-5" /> Post Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isImageBrowserOpen ? renderImageBrowser() : renderProposalForm()}
      </DialogContent>
    </Dialog>
  );
}