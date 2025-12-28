"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import styles from "./Background.module.css";

export default function AnimatedBackground() {
  useGSAP(() => {
    const moveOrbs = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * 0.4;
      const y = (e.clientY - window.innerHeight / 2) * 0.4;

      gsap.to(".p-orb", { 
        x: x*2, 
        y: y*2, 
        duration: 2, 
        ease: "power2.out" 
      });
      
      gsap.to(".b-orb", { 
        x: -x*2, 
        y: -y*2, 
        duration: 2, 
        ease: "power2.out" 
      });
    };

    window.addEventListener("mousemove", moveOrbs);
    
    // Automatic floating animation (in case the mouse doesn't move)
    gsap.to(".orb", {
      scale: 1.2,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 10
    });

    return () => window.removeEventListener("mousemove", moveOrbs);
  }, []);

  return (
    <div className={styles.bgLayer}>
      <div className={`${styles.orb} p-orb ${styles.pOrb}`}></div>
      <div className={`${styles.orb} b-orb ${styles.bOrb}`}></div>
    </div>
  );
}
