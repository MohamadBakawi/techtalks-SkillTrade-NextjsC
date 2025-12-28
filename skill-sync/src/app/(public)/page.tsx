import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import { getCurrentUserId } from "@/actions/auth";
import styles from "./Landing.module.css";
import SmoothScrollProvider from "./SmoothScrollProvider";
import AnimatedBackground from "@/components/landing/AnimatedBackground";

export default async function Home() {
  const userId = await getCurrentUserId();

  return (
    <>
      <AnimatedBackground /> {/* Static behind everything */}
      <Navbar userId={userId} /> {/* Static/Fixed at top */}
      
      <SmoothScrollProvider>
        <div className={styles.pageWrapper}>
          <main className={styles.mainContent}>
            <Hero />
            <Features />
          </main>
          <Footer />
        </div>
      </SmoothScrollProvider>
    </>
  );
}
