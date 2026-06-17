const STORAGE_KEY = 'savedRecipes';

/**
 * Get all saved recipe IDs from localStorage
 * @returns {Array} Array of saved recipe IDs
 */
export function getSavedIds() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

/**
 * Save a recipe ID to localStorage
 * @param {string} id - Recipe ID to save
 * @returns {boolean} Success status
 */
export function saveRecipeId(id) {
    try {
        const saved = getSavedIds();
        if (!saved.includes(id)) {
            saved.push(id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        }
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

/**
 * Remove a recipe ID from localStorage
 * @param {string} id - Recipe ID to remove
 * @returns {boolean} Success status
 */
export function removeRecipeId(id) {
    try {
        const saved = getSavedIds();
        const index = saved.indexOf(id);
        if (index > -1) {
            saved.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        }
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

/**
 * Check if a recipe is saved
 * @param {string} id - Recipe ID to check
 * @returns {boolean} True if saved
 */
export function isRecipeSaved(id) {
    const saved = getSavedIds();
    return saved.includes(id);
}

/**
 * Get count of saved recipes
 * @returns {number} Number of saved recipes
 */
export function getSavedCount() {
    return getSavedIds().length;
}

/**
 * Clear all saved recipes
 * @returns {boolean} Success status
 */
export function clearAllSaved() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
}