import { z } from "zod";

// Campaign form validation schema
export const campaignSchema = z.object({
  name: z
    .string()
    .min(3, "Campaign name must be at least 3 characters")
    .max(255, "Campaign name must be less than 255 characters"),
  total_budget: z
    .number({ message: "Total budget is required" })
    .positive("Total budget must be greater than 0")
    .max(10000000, "Total budget cannot exceed $10,000,000"),
  daily_budget: z
    .number()
    .positive("Daily budget must be greater than 0")
    .nullable()
    .optional(),
  max_bid: z
    .number({ message: "Max bid is required" })
    .positive("Max bid must be greater than 0")
    .max(1000, "Max bid cannot exceed $1000 CPM"),
  bid_strategy: z.enum(["highest", "lowest", "average"]).default("highest"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().nullable().optional(),
  target_geos: z.array(z.string()).default([]),
  target_devices: z.array(z.string()).default([]),
  target_os: z.array(z.string()).default([]),
  target_browsers: z.array(z.string()).default([]),
  max_impressions_per_user: z.number().int().positive().nullable().optional(),
  max_impressions_per_day: z.number().int().positive().nullable().optional(),
  active_hours: z.array(z.number()).default([]),
  active_days: z.array(z.number()).default([0, 1, 2, 3, 4, 5, 6]),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
});

// Type inference from schema
export type CampaignFormData = z.infer<typeof campaignSchema>;

// Schema for the raw form input (strings from inputs)
export const campaignFormInputSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  total_budget: z.string().min(1, "Total budget is required"),
  daily_budget: z.string().optional(),
  max_bid: z.string().min(1, "Max bid is required"),
  bid_strategy: z.enum(["highest", "lowest", "average"]).default("highest"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  target_geos: z.array(z.string()).default([]),
  target_devices: z.array(z.string()).default([]),
  target_os: z.array(z.string()).default([]),
  target_browsers: z.array(z.string()).default([]),
  max_impressions_per_user: z.string().optional(),
  max_impressions_per_day: z.string().optional(),
  active_hours: z.array(z.number()).default([]),
  active_days: z.array(z.number()).default([0, 1, 2, 3, 4, 5, 6]),
});

export type CampaignFormInput = z.infer<typeof campaignFormInputSchema>;

// Transform form input to API format
export function transformFormToApi(
  input: CampaignFormInput,
  status: string = "draft"
): CampaignFormData {
  return {
    name: input.name,
    total_budget: parseFloat(input.total_budget),
    daily_budget: input.daily_budget ? parseFloat(input.daily_budget) : null,
    max_bid: parseFloat(input.max_bid),
    bid_strategy: input.bid_strategy,
    start_date: input.start_date,
    end_date: input.end_date || null,
    target_geos: input.target_geos,
    target_devices: input.target_devices,
    target_os: input.target_os,
    target_browsers: input.target_browsers,
    max_impressions_per_user: input.max_impressions_per_user
      ? parseInt(input.max_impressions_per_user)
      : null,
    max_impressions_per_day: input.max_impressions_per_day
      ? parseInt(input.max_impressions_per_day)
      : null,
    active_hours: input.active_hours,
    active_days: input.active_days,
    status: status as CampaignFormData["status"],
  };
}

// Validate form input and return errors
export function validateCampaignForm(input: CampaignFormInput): {
  success: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Name validation
  if (!input.name || input.name.length < 3) {
    errors.name = "Campaign name must be at least 3 characters";
  }

  // Budget validation
  if (!input.total_budget) {
    errors.total_budget = "Total budget is required";
  } else {
    const budget = parseFloat(input.total_budget);
    if (isNaN(budget) || budget <= 0) {
      errors.total_budget = "Total budget must be a positive number";
    }
  }

  // Daily budget validation (optional)
  if (input.daily_budget) {
    const dailyBudget = parseFloat(input.daily_budget);
    const totalBudget = parseFloat(input.total_budget);
    if (isNaN(dailyBudget) || dailyBudget <= 0) {
      errors.daily_budget = "Daily budget must be a positive number";
    } else if (dailyBudget > totalBudget) {
      errors.daily_budget = "Daily budget cannot exceed total budget";
    }
  }

  // Max bid validation
  if (!input.max_bid) {
    errors.max_bid = "Max bid is required";
  } else {
    const maxBid = parseFloat(input.max_bid);
    if (isNaN(maxBid) || maxBid <= 0) {
      errors.max_bid = "Max bid must be a positive number";
    }
  }

  // Start date validation
  if (!input.start_date) {
    errors.start_date = "Start date is required";
  }

  // End date validation
  if (input.end_date && input.start_date) {
    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);
    if (endDate < startDate) {
      errors.end_date = "End date must be after start date";
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

// Default form values
export const defaultCampaignFormValues: CampaignFormInput = {
  name: "",
  total_budget: "",
  daily_budget: "",
  max_bid: "",
  bid_strategy: "highest",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  target_geos: [],
  target_devices: [],
  target_os: [],
  target_browsers: [],
  max_impressions_per_user: "",
  max_impressions_per_day: "",
  active_hours: [],
  active_days: [0, 1, 2, 3, 4, 5, 6],
};
