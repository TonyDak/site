import { type ContactSubmission } from "@/lib/admin/content-models";
import { asObject, asString } from "@/lib/admin/validation";

export function parseContactSubmissionDto(input: unknown): ContactSubmission {
  const raw = asObject(input, "contact");

  return {
    name: asString(raw.name, "contact.name"),
    email: asString(raw.email, "contact.email"),
    detail: asString(raw.detail, "contact.detail"),
    website:
      typeof raw.website === "undefined"
        ? undefined
        : asString(raw.website, "contact.website", { required: false, allowEmpty: true }),
  };
}