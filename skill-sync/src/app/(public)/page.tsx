import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Spotlight from "@/components/landing/Spotlight";
import RecentReviews from "@/components/landing/RecentReviews";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import SmoothScrollProvider from "./SmoothScrollProvider";

import { getCurrentUserId } from "@/actions/auth";
import { listPublicProposals } from "@/actions/proposals";
import { getPublicReviews } from "@/actions/reviews";
import styles from "@/app/(public)/Landing.module.css";

export default async function Home() {
  const userId = await getCurrentUserId();

  // Fetch visual logic data for landing page
  const [proposals, reviews] = await Promise.all([
    listPublicProposals({ take: 6 }), // Featured proposals with images
    getPublicReviews(3) // Recent "Ending of proposals" / reviews
  ]);

  return (
    <>
      <AnimatedBackground />
      <Navbar userId={userId} />

      <SmoothScrollProvider>
        <div className={styles.pageWrapper}>
          <main className={styles.mainContent}>
            <Hero userId={userId} />

            {/* Importance: Showcase the newly added Unsplash images in proposals */}
            <Spotlight proposals={proposals} />

            <Features />

            {/* Importance: Showcase the newly added Review/Termination logic */}
            <RecentReviews reviews={reviews} />
          </main>
          <Footer />
        </div>
      </SmoothScrollProvider>
    </>
  );
}