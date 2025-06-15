export const getExerciseIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    'Yoga': '🧘‍♀️',
    'Running': '🏃‍♀️',
    'Strength': '🏋️‍♀️',
    'Walking': '🚶‍♀️',
    'Swimming': '🏊‍♀️',
    'Rest': '😴'
  };
  return iconMap[type] || '🏃‍♀️';
}; 