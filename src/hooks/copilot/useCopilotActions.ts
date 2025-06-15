import { useCopilotAction } from "@copilotkit/react-core";

// Common validation utilities
export const validateRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

export const validateStringInArray = (value: string, validValues: string[]) => {
  return validValues.includes(value);
};

// Generic action hooks
export function useGenericNumericAction(
  name: string,
  description: string,
  paramName: string,
  min: number,
  max: number,
  setter: (value: number) => void
) {
  useCopilotAction({
    name,
    description,
    parameters: [{
      name: paramName,
      type: "number",
      description: `${paramName} (${min}-${max})`,
      required: true,
    }],
    handler: ({ [paramName]: value }) => {
      if (validateRange(value, min, max)) {
        setter(value);
      }
    },
  });
}

export function useGenericStringAction(
  name: string,
  description: string,
  paramName: string,
  validValues: string[],
  setter: (value: string) => void
) {
  useCopilotAction({
    name,
    description,
    parameters: [{
      name: paramName,
      type: "string",
      description: `${paramName} (${validValues.join(', ')})`,
      required: true,
    }],
    handler: ({ [paramName]: value }) => {
      if (validateStringInArray(value, validValues)) {
        setter(value);
      }
    },
  });
}

export function useGenericClearAction(
  name: string,
  description: string,
  clearFunction: () => void
) {
  useCopilotAction({
    name,
    description,
    parameters: [],
    handler: clearFunction,
  });
}

export function useGenericBooleanAction(
  name: string,
  description: string,
  paramName: string,
  setter: (value: boolean) => void
) {
  useCopilotAction({
    name,
    description,
    parameters: [{
      name: paramName,
      type: "boolean",
      description: `${paramName} (true/false)`,
      required: true,
    }],
    handler: ({ [paramName]: value }) => {
      setter(value);
    },
  });
}

// Helper function to create common parameter types
export const createStringParameter = (name: string, description: string, required = false) => ({
  name,
  type: "string" as const,
  description,
  required,
});

export const createNumberParameter = (name: string, description: string, required = false) => ({
  name,
  type: "number" as const,
  description,
  required,
});

export const createBooleanParameter = (name: string, description: string, required = false) => ({
  name,
  type: "boolean" as const,
  description,
  required,
}); 