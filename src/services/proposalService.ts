import type { ProposalFormValues } from "@/lib/validation";

export type ProposalResponse = {
  status: "success";
  id: string;
};

export async function createProposal(
  data: ProposalFormValues,
): Promise<ProposalResponse> {
  try {
    const response = await fetch("/api/proposals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // For the MVP we still resolve with a mocked success,
      // but we log the unexpected status for visibility.
      // eslint-disable-next-line no-console
      console.warn(
        "[proposalService] Received non-OK status from /api/proposals:",
        response.status,
      );
    }

    const json = (await response.json().catch(() => null)) as
      | Partial<ProposalResponse>
      | null;

    if (json?.status === "success" && typeof json.id === "string") {
      return { status: "success", id: json.id };
    }

    // Fallback: mock a success result in case the API is not wired yet.
    return {
      status: "success",
      id: `mock-${Math.random().toString(36).slice(2, 10)}`,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[proposalService] Failed to create proposal:", error);

    // For the MVP we still mock a success so the UI flow
    // can be tested without a real backend.
    return {
      status: "success",
      id: `mock-${Math.random().toString(36).slice(2, 10)}`,
    };
  }
}


