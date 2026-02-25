// Algolia is disabled for mobile - use API backend instead
// import algoliasearch from 'algoliasearch';

const appId = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY || '';

// Client Algolia (clé publique - recherche uniquement)
// Disabled for React Native compatibility - use API backend instead
const client = null; // algoliasearch(appId, searchApiKey);

// Index des produits
const productsIndex = null; // client?.initIndex('products');

export interface AlgoliaProduct {
    objectID: string;
    id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
    prices: Array<{ price: number; minQty: number }>;
    moq: number;
    rating: number;
    reviewCount: number;
    sales: number;
    stock: number;
    country: string;
    deliveryTime: string;
    fournisseurId: string;
}

export interface SearchResult {
    hits: AlgoliaProduct[];
    total: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
}

/**
 * Recherche de produits via Algolia (full-text)
 */
export async function searchProducts(
    query: string,
    options?: {
        category?: string;
        limit?: number;
        page?: number;
    }
): Promise<SearchResult> {
    if (!appId || !searchApiKey) {
        console.warn('⚠️ [Algolia] Clés API non configurées. Utiliser EXPO_PUBLIC_ALGOLIA_APP_ID et EXPO_PUBLIC_ALGOLIA_SEARCH_KEY dans .env');
        return { hits: [], total: 0, hasMore: false, currentPage: 0, totalPages: 0 };
    }

    const { category, limit = 20, page = 0 } = options || {};

    const facetFilters = category && category !== 'all'
        ? [`category:${category}`]
        : [];

    // Algolia disabled for React Native - return empty results
    console.warn('⚠️ [Algolia] Service désactivé pour React Native. Utiliser l\'API backend à la place.');
    return { hits: [], total: 0, hasMore: false, currentPage: 0, totalPages: 0 };
}

/**
 * Recherche par catégorie
 */
export async function searchByCategory(
    category: string,
    limit = 20
): Promise<SearchResult> {
    return searchProducts('', { category, limit });
}

/**
 * Suggestions de recherche (autocomplétion)
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];

    // Algolia disabled for React Native
    console.warn('⚠️ [Algolia] Service désactivé pour React Native.');
    return [];
}
