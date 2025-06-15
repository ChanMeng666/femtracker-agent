export const getProperIcon = (icon: string | undefined): string => {
  if (!icon) {
    return "🍴";
  }
  
  // Handle emoji codes that might be passed as hex strings
  if (typeof icon === 'string') {
    // If it's a hex code like "35e", "631", etc., convert to emoji
    if (/^[0-9a-fA-F]+$/.test(icon) && icon.length >= 2 && icon.length <= 8) {
      try {
        // Try to convert hex to emoji
        const codePoint = parseInt(icon, 16);
        
        // Common emoji mappings for the codes we're seeing
        const emojiMap: Record<string, string> = {
          '35e': '🥞', // pancake
          '631': '🍱', // bento box
          '36e': '🥮', // moon cake
          'f9c4': '🧄', // garlic
          '9c2': '🧂', // salt
          '9c3': '🧃', // beverage box
          '3c6': '🏆', // trophy
          '1f3e1f7': '🏡', // house
          '1f9c6': '🧆', // falafel
          '1f9f3': '🧳', // luggage
        };
        
        // Check if we have a direct mapping
        if (emojiMap[icon.toLowerCase()]) {
          return emojiMap[icon.toLowerCase()];
        }
        
        // For longer codes, try to parse as Unicode
        if (icon.length > 4) {
          // Handle compound emoji codes
          const parts = icon.match(/.{1,4}/g) || [];
          let result = '';
          for (const part of parts) {
            const partCode = parseInt(part, 16);
            if (partCode > 0 && partCode <= 0x10FFFF) {
              result += String.fromCodePoint(partCode);
            }
          }
          if (result) return result;
        } else {
          // Simple single code point
          if (codePoint > 0 && codePoint <= 0x10FFFF) {
            return String.fromCodePoint(codePoint);
          }
        }
      } catch {
        // If conversion fails, fall back to default
      }
    }
    
    // If it's already an emoji or regular string, return as is
    return icon;
  }
  
  return "🍴";
}; 