import { searchRecipes, getRecipeById, getRecipesByCategory } from './api.js';
import { 
    getSavedIds, 
    saveRecipeId, 
    removeRecipeId, 
    isRecipeSaved,
    getSavedCount,
    clearAllSaved
} from './storage.js';

console.log('Main.js loaded at:', new Date().toISOString());

// ===== DOM Element References =====
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const showSavedOnly = document.getElementById('show-saved-only');
const resultsGrid = document.getElementById('results-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const savedGrid = document.getElementById('saved-grid');
const emptySaved = document.getElementById('empty-saved');
const savedCount = document.getElementById('saved-count');
const clearAllBtn = document.getElementById('clear-all-btn');
const contactForm = document.getElementById('contact-form');
const contactFeedback = document.getElementById('contact-feedback');

// Debug - log DOM elements
console.log('DOM Elements:', {
    searchForm: !!searchForm,
    searchInput: !!searchInput,
    categorySelect: !!categorySelect,
    resultsGrid: !!resultsGrid,
    loadingIndicator: !!loadingIndicator,
    errorMessage: !!errorMessage
});

// ===== Application State =====
let currentResults = [];
let currentQuery = '';
let currentCategory = '';

// ===== Utility: Debounce (Closure) =====
function debounce(func, delay) {
    let timeoutId = null;
    
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}

// ===== Recipe Card Rendering =====
function createRecipeCard(recipe, showSaveButton = true) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
    const saved = isRecipeSaved(recipe.idMeal);
    
    card.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
        <div class="recipe-card-content">
            <span class="recipe-category">${recipe.strCategory || 'Uncategorized'}</span>
            <h3>${recipe.strMeal}</h3>
            <div class="recipe-card-actions">
                <button class="btn btn-secondary btn-sm view-details-btn" data-id="${recipe.idMeal}">View Details</button>
                ${showSaveButton ? `
                    <button class="btn ${saved ? 'btn-danger' : 'btn-primary'} btn-sm save-btn" data-id="${recipe.idMeal}">
                        ${saved ? '❤️ Saved' : '🤍 Save'}
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    const viewBtn = card.querySelector('.view-details-btn');
    viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleViewDetails(recipe.idMeal);
    });
    
    if (showSaveButton) {
        const saveBtn = card.querySelector('.save-btn');
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleSaveToggle(recipe.idMeal, saveBtn);
        });
    }
    
    return card;
}

// ===== Event Handlers =====

async function handleViewDetails(id) {
    try {
        showLoading();
        const recipe = await getRecipeById(id);
        hideLoading();
        
        if (recipe) {
            const saved = isRecipeSaved(id);
            const ingredients = getIngredients(recipe);
            const message = `
🍳 ${recipe.strMeal}
Category: ${recipe.strCategory || 'N/A'}
Area: ${recipe.strArea || 'N/A'}

Ingredients:
${ingredients.map(i => `• ${i}`).join('\n')}

${saved ? '❤️ This recipe is saved!' : '🤍 Click Save on the card to save this recipe.'}
            `;
            alert(message);
        } else {
            showError('Recipe not found');
        }
    } catch (error) {
        hideLoading();
        showError('Failed to load recipe details: ' + error.message);
    }
}

function handleSaveToggle(id, buttonElement) {
    const saved = isRecipeSaved(id);
    
    if (saved) {
        removeRecipeId(id);
        buttonElement.textContent = '🤍 Save';
        buttonElement.className = 'btn btn-primary btn-sm save-btn';
    } else {
        saveRecipeId(id);
        buttonElement.textContent = '❤️ Saved';
        buttonElement.className = 'btn btn-danger btn-sm save-btn';
    }
    
    if (savedCount) {
        savedCount.textContent = `You have ${getSavedCount()} saved recipes`;
    }
    
    if (savedGrid) {
        renderSavedRecipes();
    }
}

function getIngredients(recipe) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure || ''} ${ingredient}`.trim());
        }
    }
    return ingredients;
}

// ===== Search Handler =====

async function performSearch(query, category) {
    console.log('🔍 performSearch called with:', { query, category });
    
    try {
        // Store current search parameters
        currentQuery = query;
        currentCategory = category;
        
        showLoading();
        hideError();
        
        let results = [];
        
        console.log('📡 Fetching data from API...');
        
        if (query && query.trim().length >= 2) {
            console.log('🔎 Searching by query:', query);
            results = await searchRecipes(query.trim());
            console.log('📊 Results from search:', results.length);
        } else if (category) {
            console.log('📂 Searching by category:', category);
            results = await getRecipesByCategory(category);
            console.log('📊 Results from category:', results.length);
        } else {
            console.log('⚠️ No search criteria provided');
            hideLoading();
            showError('Please enter a search term or select a category');
            return;
        }
        
        hideLoading();
        
        // Filter by saved status if checked
        if (showSavedOnly && showSavedOnly.checked) {
            console.log('🔒 Filtering by saved status');
            const savedIds = getSavedIds();
            results = results.filter(r => savedIds.includes(r.idMeal));
            console.log('📊 After saved filter:', results.length);
        }
        
        currentResults = results;
        renderResults(results);
        
        if (results.length === 0) {
            showError('No recipes found. Try a different search term.');
        } else {
            console.log('✅ Displaying', results.length, 'recipes');
        }
        
    } catch (error) {
        console.error('❌ Search error:', error);
        hideLoading();
        showError('Failed to search recipes: ' + error.message);
    }
}

const debouncedSearch = debounce((query, category) => {
    console.log('🔄 Debounced search triggered');
    performSearch(query, category);
}, 500);

// ===== Render Functions =====

function renderResults(recipes) {
    console.log('🎨 Rendering', recipes.length, 'recipes');
    if (!resultsGrid) {
        console.error('❌ resultsGrid not found!');
        return;
    }
    
    resultsGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        console.log('ℹ️ No recipes to display');
        return;
    }
    
    recipes.forEach((recipe, index) => {
        console.log(`  ${index + 1}. ${recipe.strMeal}`);
        const card = createRecipeCard(recipe, true);
        resultsGrid.appendChild(card);
    });
}

async function renderSavedRecipes() {
    if (!savedGrid || !emptySaved) return;
    
    const savedIds = getSavedIds();
    
    if (savedCount) {
        savedCount.textContent = `You have ${savedIds.length} saved recipes`;
    }
    
    if (savedIds.length === 0) {
        savedGrid.innerHTML = '';
        emptySaved.style.display = 'block';
        return;
    }
    
    emptySaved.style.display = 'none';
    savedGrid.innerHTML = '<div class="loading"><p>Loading saved recipes...</p></div>';
    
    try {
        const recipes = [];
        for (const id of savedIds) {
            const recipe = await getRecipeById(id);
            if (recipe) {
                recipes.push(recipe);
            }
        }
        
        savedGrid.innerHTML = '';
        
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe, true);
            savedGrid.appendChild(card);
        });
        
        if (recipes.length === 0) {
            savedGrid.innerHTML = '';
            emptySaved.style.display = 'block';
        }
        
    } catch (error) {
        savedGrid.innerHTML = '<div class="error">Failed to load saved recipes</div>';
        console.error('Error loading saved recipes:', error);
    }
}

// ===== UI Helpers =====

function showLoading() {
    console.log('⏳ Showing loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
}

function hideLoading() {
    console.log('✅ Hiding loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function showError(message) {
    console.log('❌ Showing error:', message);
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
}

function showFeedback(element, message, type) {
    if (element) {
        element.textContent = message;
        element.className = `feedback ${type}`;
        element.style.display = 'block';
    }
}

// ===== Event Listeners =====

// --- Search Form ---
if (searchForm) {
    console.log('✅ Search form found, attaching submit listener');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('📝 Form submitted');
        
        const query = searchInput ? searchInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        
        console.log('📝 Form values:', { query, category });
        
        if (!query && !category) {
            showError('Please enter a search term or select a category');
            return;
        }
        
        if (query && query.length < 2) {
            showError('Please enter at least 2 characters');
            return;
        }
        
        hideError();
        performSearch(query, category);
        
        return false;
    });
} else {
    console.error('❌ Search form not found!');
}

// --- Search Input with debounce ---
if (searchInput) {
    console.log('✅ Search input found');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const category = categorySelect ? categorySelect.value : '';
        
        console.log('⌨️ Input changed:', query);
        
        hideError();
        
        if (query.length >= 2 || category) {
            debouncedSearch(query, category);
        } else if (query.length === 0 && !category) {
            if (resultsGrid) {
                resultsGrid.innerHTML = '';
            }
            currentResults = [];
        }
    });
} else {
    console.error('❌ Search input not found!');
}

// --- Category Select ---
if (categorySelect) {
    console.log('✅ Category select found');
    
    categorySelect.addEventListener('change', (e) => {
        const query = searchInput ? searchInput.value.trim() : '';
        const category = e.target.value;
        
        console.log('📂 Category changed:', category);
        
        hideError();
        
        if (query.length >= 2 || category) {
            performSearch(query, category);
        }
    });
} else {
    console.error('❌ Category select not found!');
}

// --- Show Saved Only ---
if (showSavedOnly) {
    showSavedOnly.addEventListener('change', () => {
        const query = searchInput ? searchInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : '';
        
        console.log('🔒 Saved only toggled:', showSavedOnly.checked);
        
        if (query.length >= 2 || category) {
            performSearch(query, category);
        } else if (currentResults.length > 0) {
            const savedIds = getSavedIds();
            const filtered = currentResults.filter(r => savedIds.includes(r.idMeal));
            renderResults(filtered);
            if (filtered.length === 0) {
                showError('No saved recipes match your search');
            }
        }
    });
}

// --- Clear All Saved ---
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved recipes?')) {
            clearAllSaved();
            renderSavedRecipes();
            
            if (resultsGrid && currentResults.length > 0) {
                renderResults(currentResults);
            }
        }
    });
}

// --- Contact Form ---
if (contactForm && contactFeedback) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const name = document.getElementById('contact-name');
        const email = document.getElementById('contact-email');
        const message = document.getElementById('contact-message');
        const rating = document.querySelector('input[name="rating"]:checked');
        
        if (!name || !name.value.trim() || name.value.trim().length < 2) {
            showFeedback(contactFeedback, 'Please enter your name (minimum 2 characters)', 'error');
            return;
        }
        
        if (!email || !email.value.trim() || !email.value.includes('@')) {
            showFeedback(contactFeedback, 'Please enter a valid email address', 'error');
            return;
        }
        
        if (!message || !message.value.trim() || message.value.trim().length < 10) {
            showFeedback(contactFeedback, 'Please enter a message (minimum 10 characters)', 'error');
            return;
        }
        
        const ratingValue = rating ? rating.value : 'Not rated';
        showFeedback(contactFeedback, 
            `✅ Thank you, ${name.value.trim()}! Your feedback has been received. Rating: ${ratingValue} ★`, 
            'success'
        );
        
        contactForm.reset();
    });
}

// ===== Initialize Page =====

function initializePage() {
    console.log('🚀 RecipeFinder initializing...');
    console.log('📍 Current page:', window.location.pathname);
    
    // On home page, load default recipes
    if (resultsGrid && document.querySelector('.hero')) {
        console.log('🏠 Home page detected, loading default recipes...');
        performSearch('chicken', '');
    }
    
    // On saved page, render saved recipes
    if (savedGrid) {
        console.log('💾 Saved page detected, loading saved recipes...');
        renderSavedRecipes();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// ===== Global Error Handling =====

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled rejection:', event.reason);
    hideLoading();
    showError('An unexpected error occurred. Please try again.');
});

console.log('🍳 RecipeFinder loaded successfully!');