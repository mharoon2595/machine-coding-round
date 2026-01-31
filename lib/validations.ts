import { z } from "zod";

export const dsarRequestSchema = z.object({
  requesterName: z.string().min(2, "Name must be at least 2 characters"),
  requesterEmail: z.string().email("Invalid email address"),
  requesterPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  requestText: z.string().min(10, "Please provide more details (at least 10 characters)"),
  companyId: z.number(),
  ownerId: z.number(),
});

export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  representation: z.string().min(2, "Representation must be at least 2 characters"),
  slug: z.string().optional().refine((s) => !s || /^[a-z0-z0-9-]+$/.test(s), {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  }),
  status: z.enum(["Active", "Inactive", "Pending", "Approved", "Rejected"]),
  ownerId: z.number(),
});

export type DsarRequestInput = z.infer<typeof dsarRequestSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
