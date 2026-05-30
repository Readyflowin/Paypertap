import type { Product } from "../types/firestore";

export type ProductVariantOption = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  variantId: string;
  label: string;
  options: Record<string, string>;
  inventoryQuantity?: number;
  isAvailable?: boolean;
  sortOrder?: number;
};

export type VariantSelectionValidation = {
  isValid: boolean;
  message?: string;
  variant?: ProductVariant | null;
};

const MAX_OPTION_GROUPS = 2;
const MAX_OPTION_VALUES = 20;
const MAX_VARIANTS = 100;
const DEFAULT_OPTION_NAMES = ["Size", "Color"];

function toCleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueValues(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  const seen = new Set<string>();
  const unique: string[] = [];

  values.forEach((value) => {
    const cleanValue = toCleanText(value);
    const key = cleanValue.toLocaleLowerCase();

    if (!cleanValue || seen.has(key)) return;

    seen.add(key);
    unique.push(cleanValue);
  });

  return unique.slice(0, MAX_OPTION_VALUES);
}

function normalizeOptionName(name: unknown, index: number): string {
  const cleanName = toCleanText(name);

  return cleanName || DEFAULT_OPTION_NAMES[index] || `Option ${index + 1}`;
}

function optionSignature(options: Record<string, string>): string {
  return Object.entries(options)
    .map(([name, value]) => `${name.toLocaleLowerCase()}:${value.toLocaleLowerCase()}`)
    .sort()
    .join("|");
}

function makeVariantId(options: Record<string, string>, index: number): string {
  const slug = Object.values(options)
    .join("-")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `variant-${slug || index + 1}`;
}

function normalizeVariant(input: unknown, index: number): ProductVariant | null {
  if (!input || typeof input !== "object") return null;

  const rawVariant = input as Record<string, unknown>;
  const rawOptions =
    rawVariant.options && typeof rawVariant.options === "object"
      ? (rawVariant.options as Record<string, unknown>)
      : {};
  const options = Object.fromEntries(
    Object.entries(rawOptions)
      .map(([name, value]) => [toCleanText(name), toCleanText(value)])
      .filter(([name, value]) => Boolean(name && value))
  );

  if (!Object.keys(options).length) return null;

  const label = toCleanText(rawVariant.label) || Object.values(options).join(" / ");
  const variantId = toCleanText(rawVariant.variantId) || makeVariantId(options, index);
  const inventoryQuantity = Number(rawVariant.inventoryQuantity);
  const sortOrder = Number(rawVariant.sortOrder);

  return {
    variantId,
    label,
    options,
    ...(Number.isInteger(inventoryQuantity) && inventoryQuantity >= 0
      ? { inventoryQuantity }
      : {}),
    ...(typeof rawVariant.isAvailable === "boolean"
      ? { isAvailable: rawVariant.isAvailable }
      : { isAvailable: true }),
    ...(Number.isInteger(sortOrder) ? { sortOrder } : { sortOrder: index }),
  };
}

export function normalizeVariantOptions(input: unknown): ProductVariantOption[] {
  if (!Array.isArray(input)) return [];

  return input
    .slice(0, MAX_OPTION_GROUPS)
    .map((option, index) => {
      const rawOption =
        option && typeof option === "object" ? (option as Record<string, unknown>) : {};

      return {
        name: normalizeOptionName(rawOption.name, index),
        values: uniqueValues(rawOption.values),
      };
    })
    .filter((option) => option.values.length > 0);
}

export function generateVariantCombinations(
  optionsInput: unknown,
  existingVariantsInput?: unknown
): ProductVariant[] {
  const options = normalizeVariantOptions(optionsInput);
  if (!options.length) return [];

  const existingVariants = Array.isArray(existingVariantsInput)
    ? existingVariantsInput
        .map((variant, index) => normalizeVariant(variant, index))
        .filter((variant): variant is ProductVariant => Boolean(variant))
    : [];
  const existingBySignature = new Map(
    existingVariants.map((variant) => [optionSignature(variant.options), variant])
  );
  const combinations: Array<Record<string, string>> = [];

  function walk(optionIndex: number, selectedOptions: Record<string, string>) {
    if (combinations.length >= MAX_VARIANTS) return;

    const option = options[optionIndex];
    if (!option) {
      combinations.push({ ...selectedOptions });
      return;
    }

    option.values.forEach((value) => {
      walk(optionIndex + 1, {
        ...selectedOptions,
        [option.name]: value,
      });
    });
  }

  walk(0, {});

  return combinations.map((combination, index) => {
    const existing = existingBySignature.get(optionSignature(combination));
    const label = Object.values(combination).join(" / ");

    return {
      variantId: existing?.variantId || makeVariantId(combination, index),
      label: existing?.label || label,
      options: combination,
      inventoryQuantity: existing?.inventoryQuantity,
      isAvailable: existing?.isAvailable !== false,
      sortOrder: index,
    };
  });
}

export function getVariantLabel(variant?: ProductVariant | null): string {
  if (!variant) return "";

  return variant.label || Object.values(variant.options || {}).filter(Boolean).join(" / ");
}

export function productHasVariants(product?: Partial<Product> | null): boolean {
  if (!product) return false;

  return Boolean(
    product.hasVariants &&
      (
        normalizeVariantOptions(product.variantOptions).length > 0 ||
        (Array.isArray(product.variants) && product.variants.length > 0)
      )
  );
}

export function getProductVariants(product?: Partial<Product> | null): ProductVariant[] {
  if (!productHasVariants(product)) return [];

  const normalizedVariants = Array.isArray(product?.variants)
    ? product.variants
        .map((variant, index) => normalizeVariant(variant, index))
        .filter((variant): variant is ProductVariant => Boolean(variant))
    : [];

  return normalizedVariants.length
    ? normalizedVariants.slice(0, MAX_VARIANTS)
    : generateVariantCombinations(product?.variantOptions);
}

export function getSelectedVariant(
  product: Partial<Product> | null | undefined,
  selectedOptions: Record<string, string>
): ProductVariant | null {
  if (!productHasVariants(product)) return null;

  const normalizedSelection = Object.fromEntries(
    Object.entries(selectedOptions || {})
      .map(([name, value]) => [toCleanText(name), toCleanText(value)])
      .filter(([name, value]) => Boolean(name && value))
  );
  const selectionSignature = optionSignature(normalizedSelection);

  return (
    getProductVariants(product).find(
      (variant) => optionSignature(variant.options) === selectionSignature
    ) || null
  );
}

export function isVariantAvailable(variant?: ProductVariant | null): boolean {
  if (!variant) return false;
  if (variant.isAvailable === false) return false;
  if (
    typeof variant.inventoryQuantity === "number" &&
    Number.isFinite(variant.inventoryQuantity)
  ) {
    return variant.inventoryQuantity > 0;
  }

  return true;
}

export function getAvailableOptions(
  product: Partial<Product> | null | undefined,
  selectedOptions: Record<string, string> = {}
): Record<string, Set<string>> {
  const options = normalizeVariantOptions(product?.variantOptions);
  const availableOptions: Record<string, Set<string>> = Object.fromEntries(
    options.map((option) => [option.name, new Set<string>()])
  );

  getProductVariants(product).forEach((variant) => {
    if (!isVariantAvailable(variant)) return;

    options.forEach((option) => {
      const candidateValue = variant.options[option.name];
      if (!candidateValue) return;

      const matchesOtherSelectedOptions = options.every((otherOption) => {
        if (otherOption.name === option.name) return true;
        const selectedValue = selectedOptions[otherOption.name];
        return !selectedValue || variant.options[otherOption.name] === selectedValue;
      });

      if (matchesOtherSelectedOptions) {
        availableOptions[option.name]?.add(candidateValue);
      }
    });
  });

  return availableOptions;
}

export function validateSelectedVariant(
  product: Partial<Product> | null | undefined,
  selectedOptions: Record<string, string>
): VariantSelectionValidation {
  const options = normalizeVariantOptions(product?.variantOptions);

  if (!productHasVariants(product)) {
    return { isValid: true, variant: null };
  }

  const missingOption = options.find((option) => !toCleanText(selectedOptions?.[option.name]));

  if (missingOption) {
    return {
      isValid: false,
      message: `Please select ${missingOption.name.toLocaleLowerCase()}.`,
      variant: null,
    };
  }

  const variant = getSelectedVariant(product, selectedOptions);

  if (!variant) {
    return {
      isValid: false,
      message: "This option is not available.",
      variant: null,
    };
  }

  if (!isVariantAvailable(variant)) {
    return {
      isValid: false,
      message: "This option is not available.",
      variant,
    };
  }

  return { isValid: true, variant };
}

export function getVariantSummary(product: Partial<Product> | null | undefined): string {
  const options = normalizeVariantOptions(product?.variantOptions);

  if (!productHasVariants(product) || !options.length) return "No variants";

  const sizeOption = options.find((option) => option.name.toLocaleLowerCase() === "size");
  const colorOption = options.find((option) => option.name.toLocaleLowerCase() === "color");

  if (sizeOption && colorOption) {
    return `${sizeOption.values.length} sizes · ${colorOption.values.length} colors`;
  }

  if (sizeOption) return `${sizeOption.values.length} sizes`;
  if (colorOption) return `${colorOption.values.length} colors`;

  return `${getProductVariants(product).length} variants`;
}

export function getVariantDetailsText(
  input?: {
    selectedVariantLabel?: string;
    selectedVariantOptions?: Record<string, string>;
  } | null
): string {
  if (!input) return "";

  const options = input.selectedVariantOptions || {};
  const parts = Object.entries(options)
    .filter(([, value]) => Boolean(value))
    .map(([name, value]) => `${name}: ${value}`);

  return parts.length ? parts.join(" · ") : input.selectedVariantLabel || "";
}
