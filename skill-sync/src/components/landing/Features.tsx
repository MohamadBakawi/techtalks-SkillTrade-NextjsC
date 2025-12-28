"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "@/app/(public)/Landing.module.css";

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
    if (!cards.length) return;

    // 1. IMMERSIVE ENTRANCE: Cards start hidden and pop in
    // This creates the "reveal" before the parallax begins
    gsap.set(cards, { opacity: 0, scale: 0.9, y: 50 });

    gsap.to(cards, {
      scrollTrigger: {
        trigger: `.${styles.featuresGrid}`,
        start: "top 85%", // Triggers slightly before the grid enters center
        toggleActions: "play none none reverse",
      },
      opacity: 1,
      scale: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.2,
      ease: "linear",
    });

    // 2. PARALLEL PARALLAX: Cards move at different speeds while scrolling
    // We use a separate ScrollTrigger for constant parallel movement
    cards.forEach((card, i) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top bottom", // Starts as soon as card bottom enters screen
          end: "bottom top",    // Ends when card top leaves screen
          scrub: true,          // Links movement strictly to scroll progress
        },
        // The further down the card is in the list, the faster it moves (Parallel effect)
        y: -100 * (i + 1) * 0.2, 
        ease: "linear",
      });
    });

    // 3. TEXT CRYSTALLIZATION (Your established blur effect)
    gsap.fromTo([`.${styles.sectionTitle}`, `.${styles.sectionDescription}`],
      { filter: "blur(15px)", opacity: 0 },
      {
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          end: "top 70%",
          scrub: true,
        },
        filter: "blur(0px)",
        opacity: 1,
      }
    );
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
