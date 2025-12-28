"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // Added for routing logic
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import styles from "@/app/(public)/Landing.module.css";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface NavbarProps {
  userId: string | null;
}

const Navbar = ({ userId }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Register GSAP plugins (Safe for 2025 Next.js App Router)
  useGSAP(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
      
      // Use ScrollTrigger to detect scroll position
      ScrollTrigger.create({
        start: 10,
        onUpdate: (self) => setScrolled(self.scroll() > 10),
      });
    }
  }, { dependencies: [pathname] }); // Re-run if path changes

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    
    // 1. If we are NOT on the homepage, redirect to home first
    if (pathname !== "/") {
      router.push(`/${target}`);
      return;
    }

    // 2. If we ARE on home, use ScrollSmoother
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTo(target, true, "top top");
    } else {
      // Fallback if smoother isn't active
      const element = document.querySelector(target);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
      <div className={`${styles.container} ${styles.navContent}`}>
        <Link href="/" className={styles.logo}>
          Skill<span>Swap</span>
        </Link>

        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <a href="#features" onClick={(e) => handleSmoothScroll(e, "#features")}>
            How It Works
          </a>
          <Link href="/browse">Browse</Link>
        </nav>

        <div className={styles.navActions}>
          <ThemeToggleButton />
          {userId ? (
            <>
              <Link href="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
              <form action={signOut}><Button type="submit">Logout</Button></form>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost">Log In</Button></Link>
              <Link href="/login"><Button>Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
