"use client";

import { useState } from "react";
import { ProposalModal } from "../components/ProposalModal";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 md:px-8">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-400">
              SkillSync Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Post a{" "}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                Proposal
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
              Share what you can teach and what you want to learn. Connect with
              other builders through skill-for-skill exchanges.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-sky-500/40 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-6 py-2.5 text-sm font-medium text-slate-950 shadow-[0_18px_45px_rgba(56,189,248,0.40)] transition hover:scale-[1.03] hover:shadow-[0_22px_55px_rgba(56,189,248,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="mr-1.5 text-lg leading-none">+</span>
            <span>Post a Proposal</span>
            <span className="ml-2 h-[1px] w-6 origin-left scale-x-0 bg-slate-900/80 opacity-70 transition group-hover:scale-x-100" />
          </button>
        </header>

        {/* Placeholder dashboard content */}
        <section className="flex-1 rounded-3xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-black/40 backdrop-blur-xl md:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-medium text-slate-100 md:text-lg">
              Your recent proposals
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/30">
              MVP view &mdash; mock data only
            </span>
          </div>
          <p className="max-w-xl text-sm text-slate-300/80">
            After posting a proposal, it will appear here once you connect it to
            a real backend. For now, submissions are logged to the console as a
            mock API call.
          </p>
        </section>
      </div>

      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}


