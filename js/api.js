// API configuration
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

/**
 * Search for recipes by name
 */
export async function searchRecipes(query) {
    const response = await fetch(`${API_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.meals || [];
}

/**
 * Get recipe details by ID
 */
export async function getRecipeById(id) {
    const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
}

/**
 * Get recipes by category
 */
export async function getRecipesByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.meals || [];
}

/**
 * Get all categories
 */
export async function getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories.php`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.categories || [];
}