
https://recipe-finder-lvci.netlify.app/


┌─────────────────────────────────────────────────────────┐
│                    index.html                           │
│          (Main Entry Point - Home Page)                 │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   saved.html     │    (Saved Recipes Page)
              └──────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   about.html     │    (About & Contact Page)
              └──────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    css/style.css                        │
│         (All styles - Flexbox, Grid, Responsive)        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    js/main.js                           │
│   (Entry point - DOM manipulation, event handling)      │
└─────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────────┐      ┌─────────────────────────┐
│    js/api.js        │      │    js/storage.js        │
│ (API Communication) │      │   (localStorage CRUD)   │
└─────────────────────┘      └─────────────────────────┘


1. index.html - main page

Purpose: Landing page where users search for recipes

Key Components:

<!-- Semantic HTML5 Elements -->
<header>        <!-- Navigation -->
<main>          <!-- Main content -->
  <section>     <!-- Hero and search sections -->
  <section>     <!-- Results section -->
<footer>        <!-- Footer -->

Important Features:

    Search Form with multiple input types:

        Text input (type="text")

        Select dropdown (<select>)

        Checkbox (type="checkbox")

        Submit button (type="submit")

    HTML5 Validation:

    <input type="text" required minlength="2" maxlength="50">

    Loading States: <div id="loading-indicator">

    Error Display: <div id="error-message">

    Dynamic Results: <div id="results-grid">



2. saved.html - Saved Recipes Page

Purpose: Display and manage saved recipes

Key Components:
//
<section class="saved-hero">
  <h1>Your Saved Recipes</h1>
  <p id="saved-count">You have 0 saved recipes</p>
  <button id="clear-all-btn">Clear All</button>
</section>

<section id="saved-section">
  <div id="saved-grid"></div>     <!-- Dynamic content -->
  <div id="empty-saved"></div>    <!-- Empty state -->
</section>
//
Features:

    Displays count of saved recipes

    "Clear All" button with confirmation

    Empty state message when no saved recipes



3. about.html - About Page

Purpose: Information about the app and contact form

Key Components:
//
<article class="about-content">
  <section> <!-- About information -->
  <section> <!-- Features -->
  <section> <!-- Technologies -->
  <section> <!-- Contact Form -->
</article>
//
Contact Form Features:

    Name (text input)

    Email (email input with validation)

    Message (textarea)

    Rating (radio buttons - 5 options)

    Form validation and feedback



4. css/style.css - All Styles

Key CSS Concepts:
CSS Custom Properties (Variables)
//
:root {
    --primary-color: #e74c3c;     /* Theme color */
    --secondary-color: #2c3e50;   /* Dark color */
    --text-color: #333;           /* Text color */
    --shadow: 0 4px 15px rgba(0,0,0,0.1);
    --border-radius: 12px;
    --spacing-md: 16px;
}
//
Centralizes theming - change one value and it updates everywhere.



Flexbox Usage
//
nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}
//
Used for: Navigation bar, form groups, card action buttons.



CSS Grid Usage
//
.recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-lg);
}
//
Used for: Recipe cards layout - automatically adjusts columns based on screen size.



Responsive Design
//
/* Mobile (≤600px) */
@media (max-width: 600px) {
    .recipe-grid {
        grid-template-columns: 1fr;  /* Single column */
    }
}

/* Tablet (≤768px) */
@media (max-width: 768px) {
    .search-form {
        flex-direction: column;
    }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
    .recipe-grid {
        grid-template-columns: repeat(3, 1fr);  /* 3 columns */
    }
}
//
Class Naming Convention (BEM-like):

.recipe-card          /* Block */
.recipe-card-content  /* Block__Element */
.recipe-card-actions  /* Block__Element */
.btn-primary          /* Block--Modifier */




5. js/main.js - Main Application Logic

Architecture:

┌──────────────────────────────────────────────────┐
│              main.js (Entry Point)               │
├──────────────────────────────────────────────────┤
│  1. Import modules (api.js, storage.js)          │
│  2. DOM references                               │
│  3. Application state                            │
│  4. Utility functions (debounce)                 │
│  5. Rendering functions                          │
│  6. Event handlers                               │
│  7. Event listeners                              │
│  8. Initialization                               │
└──────────────────────────────────────────────────┘

Key JavaScript Concepts:
A. Debounce (Closure Example)

//
function debounce(func, delay) {
    let timeoutId = null;  // Private variable (closure)
    
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

// Usage
const debouncedSearch = debounce(performSearch, 500);
//


Why this is important:

    Prevents API calls on every keystroke.

    Waits 500ms after user stops typing.

    The timeoutId is private to each debounced function. (closure!)

B. DOM Creation

//
function createRecipeCard(recipe) {
    const card = document.createElement('div');  // Dynamic creation
    card.className = 'recipe-card';
    
    card.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
        <h3>${recipe.strMeal}</h3>
        <button class="save-btn">Save</button>
    `;
    
    // Add event listener to the button
    const saveBtn = card.querySelector('.save-btn');
    saveBtn.addEventListener('click', () => handleSave(recipe.idMeal));
    
    return card;
}
//

C. Event Handling (3+ types)

//
// 1. submit event - Form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevents page reload
    performSearch(query);
});

// 2. input event - Live search
searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});

// 3. change event - Category filter
categorySelect.addEventListener('change', (e) => {
    performSearch(query, e.target.value);
});

// 4. click event - Save button
saveBtn.addEventListener('click', () => handleSave(id));

// 5. change event - Checkbox toggle
showSavedOnly.addEventListener('change', () => filterResults());
//

D. Application State

//
let currentResults = [];    // Array of recipe objects
let currentQuery = '';      // Current search term
let currentCategory = '';   // Current category filter
//

E. Async/Await with Fetch

//
async function performSearch(query) {
    try {
        showLoading();  // Show spinner
        const results = await searchRecipes(query);  // API call
        hideLoading();  // Hide spinner
        renderResults(results);
    } catch (error) {
        hideLoading();
        showError('Failed to search: ' + error.message);
    }
}
//


6. js/api.js - API Communication

Purpose: Handle all external API calls

//
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Search recipes by name
export async function searchRecipes(query) {
    const response = await fetch(`${API_BASE_URL}/search.php?s=${query}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.meals || [];
}

// Get recipe details by ID
export async function getRecipeById(id) {
    const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
}

// Get recipes by category
export async function getRecipesByCategory(category) {
    const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals || [];
}
//

Key Features:

    Uses async/await for asynchronous operations

    Error handling with try/catch

    Returns empty array if no results

    All functions are exported for use in main.js



7. js/storage.js - localStorage Management

Purpose: Handle all localStorage operations
javascript

const STORAGE_KEY = 'savedRecipes';

// CRUD Operations
export function getSavedIds() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveRecipeId(id) {
    const saved = getSavedIds();
    if (!saved.includes(id)) {
        saved.push(id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
}

export function removeRecipeId(id) {
    const saved = getSavedIds();
    const index = saved.indexOf(id);
    if (index > -1) {
        saved.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
}

export function isRecipeSaved(id) {
    return getSavedIds().includes(id);
}

export function clearAllSaved() {
    localStorage.removeItem(STORAGE_KEY);
}

Why this matters:

    Data persists across page reloads

    No backend database required

    User's favorites survive browser restarts



8. Key Features to Discuss

8.1. Dynamic DOM Manipulation

// Creating elements dynamically
const card = document.createElement('div');
card.className = 'recipe-card';
card.innerHTML = `...`;
resultsGrid.appendChild(card);

8.2. Module System

// In main.js
import { searchRecipes } from './api.js';
import { getSavedIds } from './storage.js';

// In api.js
export async function searchRecipes(query) { ... }

8.3. Async Data Fetching

// Loading states
showLoading();
try {
    const data = await fetchAPI();
} catch (error) {
    showError('Something went wrong');
} finally {
    hideLoading();
}

8.4. State Persistence

// Save to localStorage
localStorage.setItem('savedRecipes', JSON.stringify(ids));

// Load from localStorage
const data = localStorage.getItem('savedRecipes');
return data ? JSON.parse(data) : [];

8.5. Responsive Design

    Mobile-first approach

    CSS Grid auto-adjusts columns

    Flexbox handles layout flexibility

8.6. Form Handling

form.addEventListener('submit', (e) => {
    e.preventDefault();  // No page reload
    // Client-side validation
    if (input.value.length < 2) {
        showError('Minimum 2 characters');
        return;
    }
    // Process form data
});