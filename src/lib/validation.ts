export type ProposalFormValues = {
  title: string;
  modality: string;
  offeredSkill: string;
  neededSkill: string;
};

export type ProposalValidationErrors = Partial<
  Record<keyof ProposalFormValues, string>
>;

export type ProposalValidationResult = {
  isValid: boolean;
  errors: ProposalValidationErrors;
};

export function validateProposal(values: ProposalFormValues): ProposalValidationResult {
  const errors: ProposalValidationErrors = {};

  const title = values.title.trim();
  const modality = values.modality.trim();
  const offeredSkill = values.offeredSkill.trim();
  const neededSkill = values.neededSkill.trim();

  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (!modality) {
    errors.modality = "Please choose a modality.";
  }

  if (!offeredSkill) {
    errors.offeredSkill = "Tell people what you can offer in return.";
  }

  if (!neededSkill) {
    errors.neededSkill = "Describe the skill you want to learn.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}


