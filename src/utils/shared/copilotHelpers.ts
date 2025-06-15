// Common CopilotKit helper functions
export const createReadableConfig = (
  description: string,
  data: Record<string, unknown>
) => {
  return {
    description,
    value: data
  };
};

export const formatHealthScore = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
};

export const calculatePercentage = (current: number, target: number): number => {
  return Math.round((current / target) * 100);
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const generateId = (prefix: string, index: number): string => {
  return `${prefix}_${index}`;
};

// Common data transformation functions
export const transformDataForAI = (data: unknown[], fields: string[]) => {
  return data.map(item => {
    const transformed: Record<string, unknown> = {};
    fields.forEach(field => {
      if (item && typeof item === 'object' && field in item) {
        transformed[field] = (item as Record<string, unknown>)[field];
      }
    });
    return transformed;
  });
}; 