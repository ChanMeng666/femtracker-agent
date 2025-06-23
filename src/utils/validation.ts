// 输入验证工具函数

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 验证周期天数
export const validateCycleDay = (day: number): ValidationResult => {
  if (!Number.isInteger(day)) {
    return { isValid: false, error: 'Cycle day must be a whole number' };
  }
  if (day < 1 || day > 35) {
    return { isValid: false, error: 'Cycle day must be between 1 and 35' };
  }
  return { isValid: true };
};

// 验证症状严重程度
export const validateSeverity = (severity: number): ValidationResult => {
  if (!Number.isInteger(severity)) {
    return { isValid: false, error: 'Severity must be a whole number' };
  }
  if (severity < 1 || severity > 10) {
    return { isValid: false, error: 'Severity must be between 1 and 10' };
  }
  return { isValid: true };
};

// 验证心情强度
export const validateIntensity = (intensity: number): ValidationResult => {
  if (!Number.isInteger(intensity)) {
    return { isValid: false, error: 'Intensity must be a whole number' };
  }
  if (intensity < 1 || intensity > 10) {
    return { isValid: false, error: 'Intensity must be between 1 and 10' };
  }
  return { isValid: true };
};

// 验证饮水量
export const validateWaterAmount = (amount: number): ValidationResult => {
  if (amount <= 0) {
    return { isValid: false, error: 'Water amount must be greater than 0' };
  }
  if (amount > 10000) {
    return { isValid: false, error: 'Water amount seems too high (max 10L)' };
  }
  return { isValid: true };
};

// 验证睡眠时间
export const validateSleepHours = (hours: number): ValidationResult => {
  if (hours < 0 || hours > 24) {
    return { isValid: false, error: 'Sleep hours must be between 0 and 24' };
  }
  return { isValid: true };
};

// 验证睡眠质量和压力水平
export const validateRating = (rating: number, type: 'quality' | 'stress'): ValidationResult => {
  if (!Number.isInteger(rating)) {
    return { isValid: false, error: `${type} rating must be a whole number` };
  }
  if (rating < 1 || rating > 10) {
    return { isValid: false, error: `${type} rating must be between 1 and 10` };
  }
  return { isValid: true };
};

// 验证经血流量
export const validateFlowIntensity = (flow: string): ValidationResult => {
  const validFlows = ['Light', 'Medium', 'Heavy', 'Spotting'];
  if (!validFlows.includes(flow)) {
    return { isValid: false, error: 'Flow intensity must be Light, Medium, Heavy, or Spotting' };
  }
  return { isValid: true };
};

// 验证日期格式
export const validateDate = (date: string): ValidationResult => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { isValid: false, error: 'Invalid date' };
  }
  
  // Check if date is not too far in future
  const today = new Date();
  const oneMonthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (parsedDate > oneMonthFromNow) {
    return { isValid: false, error: 'Date cannot be more than 1 month in the future' };
  }
  
  return { isValid: true };
};

// 验证文本长度
export const validateNotes = (notes: string): ValidationResult => {
  if (notes.length > 500) {
    return { isValid: false, error: 'Notes must be less than 500 characters' };
  }
  return { isValid: true };
};

// 组合验证器 - 验证症状数据
export const validateSymptomData = (data: {
  symptom_type: string;
  severity: number;
  date: string;
  notes?: string;
}): ValidationResult => {
  if (!data.symptom_type.trim()) {
    return { isValid: false, error: 'Symptom type is required' };
  }
  
  const severityCheck = validateSeverity(data.severity);
  if (!severityCheck.isValid) return severityCheck;
  
  const dateCheck = validateDate(data.date);
  if (!dateCheck.isValid) return dateCheck;
  
  if (data.notes) {
    const notesCheck = validateNotes(data.notes);
    if (!notesCheck.isValid) return notesCheck;
  }
  
  return { isValid: true };
};

// 组合验证器 - 验证心情数据
export const validateMoodData = (data: {
  mood_type: string;
  intensity: number;
  date: string;
  notes?: string;
}): ValidationResult => {
  if (!data.mood_type.trim()) {
    return { isValid: false, error: 'Mood type is required' };
  }
  
  const intensityCheck = validateIntensity(data.intensity);
  if (!intensityCheck.isValid) return intensityCheck;
  
  const dateCheck = validateDate(data.date);
  if (!dateCheck.isValid) return dateCheck;
  
  if (data.notes) {
    const notesCheck = validateNotes(data.notes);
    if (!notesCheck.isValid) return notesCheck;
  }
  
  return { isValid: true };
}; 