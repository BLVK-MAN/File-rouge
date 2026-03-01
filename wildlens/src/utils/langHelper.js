/**
 * Utility to gracefully resolve localized objects.
 * If the provided value is an object (e.g. { fr: "Chien", en: "Dog" }), it resolves to the active language.
 * If the value is a plain string (like older database records), it just returns the string.
 */
export const getLocalized = (data, languageConfig = 'fr') => {
    // If it's falsy, return an empty string or fallback to avoid crashes
    if (!data) return '';

    // If it's a simple string (legacy record), return it directly
    if (typeof data === 'string') {
        return data;
    }

    // If it's an object containing translations
    if (typeof data === 'object') {
        // Ex: data = { fr: "Loup", en: "Wolf" }
        // We strip regional tags (e.g., 'fr-FR' -> 'fr') to match keys safely
        const baseLang = languageConfig.split('-')[0];

        // Return the requested language, fallback to 'fr' if not found, or the first available key
        return data[baseLang] || data['fr'] || Object.values(data)[0] || '';
    }

    return String(data);
};
