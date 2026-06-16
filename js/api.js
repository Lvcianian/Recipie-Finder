const BASE_URL = ''; // replace with your API base URL

export async function fetchData(endpoint) {
  // fetch, check response.ok, return response.json()
}

// localStorage helpers — import these wherever you need saved state
export function getSaved() {
  const raw = localStorage.getItem('savedItems');
  return raw ? JSON.parse(raw) : [];
}

export function setSaved(items) {
  localStorage.setItem('savedItems', JSON.stringify(items));
}
