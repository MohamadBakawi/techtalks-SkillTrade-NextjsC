"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "@/app/(public)/Landing.module.css";

// Register GSAP plugin safely for Next.js
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Features() {
  const container = useRef<HTMLDivElement>(null);
  
  const steps = [
    { number: "1", title: "Post a Proposal", desc: "Share a skill you can teach and learn." },
    { number: "2", title: "Find Your Match", desc: "Browse proposals or get matched." },
    { number: "3", title: "Swap & Learn", desc: "Connect and start knowledge exchange." },
    { number: "4", title: "Get Endorsed", desc: "Complete swaps and earn badges." },
  ];

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

    // 1. TEXT CRYSTALLIZATION (Reveals first)
    gsap.fromTo([`.${styles.sectionTitle}`, `.${styles.sectionDescription}`],
      { filter: "blur(15px)", opacity: 0, y: 30 },
      {
        filter: "blur(0px)",
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: container.current,
          start: "top 90%",
          end: "top 70%",
          scrub: 1,
        },
      }
    );

    // 2. THE PHYSICAL WAVE REVEAL
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { 
          y: 120,          // Start below original position
          rotateZ: 6,      // Tilted for the "wave" look
          opacity: 0,
          scale: 0.85      // Slightly smaller
        }, 
        {
          y: 0,            // Return to "first place"
          rotateZ: 0,      // Straighten out
          opacity: 1,
          scale: 1,        // Normal size
          ease: "back.out(1.4)", // Physical bounce settling effect
          scrollTrigger: {
            trigger: card,
            // STAGGERED START: i * 80 creates a 80px scroll delay between cards
            start: () => `top+=${i * 80} 95%`, 
            end: () => `top+=${i * 80} 65%`,
            scrub: 1.8,    // High inertia makes them glide into place
            toggleActions: "play none none reverse",
          }
        }
      );
    });
  }, { scope: container });

  return (
    <section id="features" ref={container} className={styles.features}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionDescription}>
            Unlock knowledge without spending a dime.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {steps.map((step) => (
            <div
              key={step.number}
              className={`feature-card ${styles.featureCard}`}
              style={{ willChange: "transform, opacity" }}
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
