"use client";

import { useState } from "react";
import styles from "./ProposalModal.module.css";
import {
  type ProposalFormValues,
  validateProposal,
} from "@/lib/validation";
import { createProposal } from "@/services/proposalService";

type ProposalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type ProposalErrors = ReturnType<typeof validateProposal>["errors"];

export function ProposalModal({ isOpen, onClose, onSuccess }: ProposalModalProps) {
  const [values, setValues] = useState<ProposalFormValues>({
    title: "",
    modality: "",
    offeredSkill: "",
    neededSkill: "",
  });
  const [errors, setErrors] = useState<ProposalErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    field: keyof ProposalFormValues,
    value: string,
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const result = validateProposal(values);
    setErrors(result.errors);

    if (!result.isValid) return;

    try {
      setIsSubmitting(true);

      const response = await createProposal(values);
      // MVP behavior: log the response to the console
      // so you can see the mock API flow end-to-end.
      // eslint-disable-next-line no-console
      console.log("[proposal] created proposal", { values, response });

      setValues({
        title: "",
        modality: "",
        offeredSkill: "",
        neededSkill: "",
      });
      setErrors({});

      onSuccess();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[proposal] failed to create proposal", error);
      setSubmitError("Something went wrong submitting your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFieldError = (field: keyof ProposalErrors) =>
    Boolean(errors[field]);

  return (
    <div className={styles.backdrop} aria-modal="true" role="dialog">
      <div className={styles.card}>
        <div className={styles.glow} aria-hidden="true" />

        <div className={styles.cardInner}>
          <header className="flex items-start justify-between gap-4 border-b border-slate-700/40 px-5 pb-4 pt-4 sm:px-6 sm:pt-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.21em] text-sky-300/80">
                New skill trade
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
                Post a proposal
              </h2>
              <p className="mt-1 text-xs text-slate-300/80 sm:text-sm">
                Describe what you can offer and what you want to learn. Keep it
                clear and specific so the right people can find you.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="sr-only">Close</span>
              <span className="text-sm leading-none">&times;</span>
            </button>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 px-5 pb-5 pt-3 sm:px-6 sm:pb-6"
          >
            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className={`${styles.fieldLabel} text-xs font-medium text-slate-200`}>
                  <span>Proposal title</span>
                  <span className={styles.requiredDot} />
                </label>
                <p className="mt-1 text-[0.72rem] text-slate-400">
                  Summarize your proposal in a short, clear phrase.
                </p>

                <div className="mt-2">
                  <input
                    type="text"
                    value={values.title}
                    onChange={(event) =>
                      handleChange("title", event.target.value)
                    }
                    placeholder="Teach React basics in exchange for learning UI design"
                    className={`w-full rounded-xl border bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none transition placeholder:text-slate-500/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/80 ${
                      hasFieldError("title")
                        ? "border-rose-500/70 bg-rose-950/20"
                        : "border-slate-700/70 hover:border-slate-500/80"
                    }`}
                  />

                  {errors.title && (
                    <p
                      className={`${styles.errorMessage} ${styles.errorPulse} text-rose-300`}
                    >
                      {errors.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Modality */}
              <div className="grid gap-3 sm:grid-cols-[1.15fr_minmax(0,1fr)]">
                <div>
                  <label className={`${styles.fieldLabel} text-xs font-medium text-slate-200`}>
                    <span>Modality</span>
                    <span className={styles.requiredDot} />
                  </label>
                  <p className="mt-1 text-[0.72rem] text-slate-400">
                    How do you want to meet or collaborate?
                  </p>

                  <div className="mt-2">
                    <select
                      value={values.modality}
                      onChange={(event) =>
                        handleChange("modality", event.target.value)
                      }
                      className={`w-full appearance-none rounded-xl border bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/80 ${
                        hasFieldError("modality")
                          ? "border-rose-500/70 bg-rose-950/20"
                          : "border-slate-700/70 hover:border-slate-500/80"
                      }`}
                    >
                      <option value="">Select modality</option>
                      <option value="online">Online · video calls</option>
                      <option value="async">
                        Async · messages, recordings, feedback
                      </option>
                      <option value="in-person">In-person · same city</option>
                      <option value="hybrid">Hybrid · mix of formats</option>
                    </select>

                    {errors.modality && (
                      <p
                        className={`${styles.errorMessage} ${styles.errorPulse} text-rose-300`}
                      >
                        {errors.modality}
                      </p>
                    )}
                  </div>
                </div>

                {/* Needed Skill */}
                <div>
                  <label className={`${styles.fieldLabel} text-xs font-medium text-slate-200`}>
                    <span>Needed skill</span>
                    <span className={styles.requiredDot} />
                  </label>
                  <p className="mt-1 text-[0.72rem] text-slate-400">
                    What do you want to learn or practice?
                  </p>

                  <div className="mt-2">
                    <input
                      type="text"
                      value={values.neededSkill}
                      onChange={(event) =>
                        handleChange("neededSkill", event.target.value)
                      }
                      placeholder="UI design fundamentals"
                      className={`w-full rounded-xl border bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none transition placeholder:text-slate-500/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/80 ${
                        hasFieldError("neededSkill")
                          ? "border-rose-500/70 bg-rose-950/20"
                          : "border-slate-700/70 hover:border-slate-500/80"
                      }`}
                    />

                    {errors.neededSkill && (
                      <p
                        className={`${styles.errorMessage} ${styles.errorPulse} text-rose-300`}
                      >
                        {errors.neededSkill}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Offered Skill */}
              <div>
                <label className={`${styles.fieldLabel} text-xs font-medium text-slate-200`}>
                  <span>Offered skill</span>
                  <span className={styles.requiredDot} />
                </label>
                <p className="mt-1 text-[0.72rem] text-slate-400">
                  What can you teach or help with in return?
                </p>

                <div className="mt-2">
                  <textarea
                    value={values.offeredSkill}
                    onChange={(event) =>
                      handleChange("offeredSkill", event.target.value)
                    }
                    rows={3}
                    placeholder="1:1 React mentoring, code reviews, and pairing on small frontend projects."
                    className={`w-full resize-none rounded-xl border bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none transition placeholder:text-slate-500/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/80 ${
                      hasFieldError("offeredSkill")
                        ? "border-rose-500/70 bg-rose-950/20"
                        : "border-slate-700/70 hover:border-slate-500/80"
                    }`}
                  />

                  {errors.offeredSkill && (
                    <p
                      className={`${styles.errorMessage} ${styles.errorPulse} text-rose-300`}
                    >
                      {errors.offeredSkill}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-rose-300">{submitError}</p>
            )}

            <div className="mt-3 flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-200 shadow-inner shadow-slate-950/40 transition hover:border-slate-400 hover:bg-slate-800 hover:text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border border-sky-500/60 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-5 py-2 text-xs font-semibold text-slate-900 shadow-[0_14px_40px_rgba(56,189,248,0.45)] transition hover:scale-[1.015] hover:shadow-[0_18px_50px_rgba(56,189,248,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Posting..." : "Post proposal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


