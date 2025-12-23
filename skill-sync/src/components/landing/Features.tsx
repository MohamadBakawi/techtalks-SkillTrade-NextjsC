"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ScrollSmoother } from "gsap/dist/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import styles from "@/app/(public)/Landing.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);
}

export default function Features() {
  const container = useRef<HTMLDivElement>(null);

  const steps = [
    {
      number: "1",
      title: "Post a Proposal",
      desc: "Share a skill you can teach and learn.",
    },
    {
      number: "2",
      title: "Find Your Match",
      desc: "Browse proposals or get matched.",
    },
    {
      number: "3",
      title: "Swap & Learn",
      desc: "Connect and start knowledge exchange.",
    },
    {
      number: "4",
      title: "Get Endorsed",
      desc: "Complete swaps and earn badges.",
    },
  ];

  useGSAP(
    () => {
      // 1. INITIALIZE SMOOTH SCROLL
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
        smoothTouch: 0.1,
      });

      // 2. TEXT CRYSTALLIZATION (Blur Reveal)
      const blurTargets = [
        `.${styles.sectionTitle}`,
        `.` + styles.sectionDescription,
      ];
      blurTargets.forEach((target) => {
        gsap.fromTo(
          target,
          { filter: "blur(15px)", opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: target,
              start: "top 90%",
              end: "top 65%",
              scrub: true,
            },
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
          }
        );
      });

      // 3. BENTO CARD REVEAL (Initial Entrance)
      gsap.set(".feature-card", { opacity: 0, scale: 1, y: 40 });
      gsap.to(".feature-card", {
        scrollTrigger: {
          trigger: `.${styles.featuresGrid}`,
          start: "top 60%",
        },
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power4.out",
      });

      // 4. WAVE ANIMATION (Dynamic Velocity Fix)
      const cards = gsap.utils.toArray(".feature-card");

      // Create 'quickTo' instances for each card for smooth, high-performance movement
      const quickToSetters = cards.map((card: any) =>
        gsap.quickTo(card, "y", { duration: 0.5, ease: "power2.out" })
      );

      ScrollTrigger.create({
        onUpdate: (self) => {
          // Get velocity and scale it (adjust 0.05 to change wave height)
          const velocity = self.getVelocity() * -0.05;

          quickToSetters.forEach((setY, i) => {
            // Offset each card by its index to create the 'wave'
            setY(velocity * (i + 1) * 0.1);
          });
        },
        // Reset to 0 when the user stops scrolling (for browsers that support it)
        onToggle: (self) => {
          if (!self.isActive) {
            quickToSetters.forEach((setY) => setY(0));
          }
        },
      });

      // Final safety reset for 2025 browsers
      window.addEventListener("scrollend", () => {
        quickToSetters.forEach((setY) => setY(0));
      });
    },
    { scope: container }
  );

  return (
    <section id="features" ref={container} className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionDescription}>
            Four simple steps to unlock a world of knowledge.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {steps.map((step) => (
            <div
              key={step.number}
              className={`feature-card ${styles.featureCard}`}
            >
              <div className={styles.featureIcon}>{step.number}</div>
              <h3 className={styles.featureTitle}>{step.title}</h3>
              <p className={styles.featureDescription}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
