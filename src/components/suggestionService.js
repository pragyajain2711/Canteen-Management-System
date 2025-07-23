// suggestionService.js
const STORAGE_KEY = 'canteen_suggestions_v2';

export const saveSuggestions = (suggestions) => {
  try {
    const serialized = suggestions.map(s => ({
      ...s,
      date: s.date.toISOString(),
      responseDate: s.responseDate ? s.responseDate.toISOString() : null
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save suggestions:', error);
  }
};

export const loadSuggestions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    return parsed.map(s => ({
      ...s,
      date: new Date(s.date),
      responseDate: s.responseDate ? new Date(s.responseDate) : null
    }));
  } catch (error) {
    console.error('Failed to load suggestions:', error);
    return [];
  }
};