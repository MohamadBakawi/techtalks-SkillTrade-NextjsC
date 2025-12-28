"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import styles from "@/app/(public)/Landing.module.css";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null); // To track the H1 for cleanup

  useGSAP(() => {
    // Save original HTML to restore it on cleanup (prevents "animating the code" bug)
    const originalHTML = titleRef.current?.innerHTML;

    const splitTextWithLines = (selector: string): void => {
      const title = container.current?.querySelector(selector) as HTMLElement | null;
      if (!title || !originalHTML) return;

      // Use the clean originalHTML to ensure we never split <span> tags
      const lines: string[] = originalHTML.split("<br>");
      let newHTML: string = "";

      lines.forEach((line: string, index: number) => {
        const chars: string = line.trim().split("").map((c: string) => 
          `<span class="char" style="display:inline-block; will-change:transform, filter;">${c === " " ? "&nbsp;" : c}</span>`
        ).join("");
        newHTML += chars + (index < lines.length - 1 ? "<br>" : "");
      });

      title.innerHTML = newHTML;
    };

    splitTextWithLines(`.${styles.heroTitle}`);

    const chars = gsap.utils.toArray(".char");
    const introTl = gsap.timeline();

    // autoAlpha: 1 handles visibility:hidden (from CSS) and opacity
    introTl.set([`.${styles.heroTitle}`, `.${styles.heroEyebrow}`, `.${styles.heroDescription}`, `.${styles.heroActions}`], { 
      autoAlpha: 1 
    });

    introTl
      .to(`.${styles.heroBackground}`, { 
          opacity: 1,
          duration: 0.1 
      })
      .from(`.${styles.heroBackground}`, { 
          scale: 1.2, 
          duration: 2, 
          ease: "expo.out" 
      }, "<")
      .from(chars, { 
          opacity: 0, 
          y: 50, 
          filter: "blur(15px)", 
          rotateX: -90, 
          stagger: 0.02, 
          duration: 1, 
          ease: "back.out(1.7)",
          clearProps: "filter,transform" // Keeps text sharp after animation
      }, "-=1.5");

    // CLEANUP: Reset the HTML when navigating away/returning
    return () => {
      if (titleRef.current && originalHTML) {
        titleRef.current.innerHTML = originalHTML;
      }
    };
  }, { scope: container });

  return (
    <section ref={container} className={styles.hero}>
      <div className={styles.heroBackground} aria-hidden="true" />
      
      <div className={`${styles.container} ${styles.heroContent}`}>
        <span className={`${styles.heroEyebrow} anim-load`}>
          The future of learning is collaborative
        </span>
        
        {/* Added titleRef here */}
        <h1 ref={titleRef} className={styles.heroTitle}>
          Trade Your Talent.<br />Master a New Skill.
        </h1>
        
        <p className={`${styles.heroDescription} anim-load`}>
          SkillSwap is a peer-to-peer marketplace where your expertise is the only currency. 
          Exchange your knowledge for the skills you've always wanted to learn, one-on-one.
        </p>

        <div className={`${styles.heroActions} anim-load`}>
          <Link href="/dashboard">
            <Button size="lg">Start Browsing Swaps</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Find Your Match
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
