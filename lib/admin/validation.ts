export function asObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }

  return value as Record<string, unknown>;
}

export function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }

  return value;
}

export function asString(
  value: unknown,
  label: string,
  options?: { required?: boolean; allowEmpty?: boolean }
) {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }

  const normalized = value.trim();
  const required = options?.required ?? true;
  const allowEmpty = options?.allowEmpty ?? false;

  if (required && !allowEmpty && normalized.length === 0) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

export function asStringArray(value: unknown, label: string, options?: { allowEmpty?: boolean }) {
  const items = asArray(value, label).map((item, index) => asString(item, `${label}[${index}]`, { allowEmpty: false }));

  if (!options?.allowEmpty && items.length === 0) {
    throw new Error(`${label} must have at least one item.`);
  }

  return items;
}