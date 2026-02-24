import algoliasearch from 'algoliasearch';

const appId = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID || '';
const searchApiKey = process.env.EXPO_PUBLIC_ALGOLIA_SEARCH_KEY || '';

// Client Algolia (clé publique - recherche uniquement)
const client = algoliasearch(appId, searchApiKey);

// Index des produits
const productsIndex = client.initIndex('products');

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

    try {
        const result = await productsIndex.search<AlgoliaProduct>(query, {
            hitsPerPage: limit,
            page,
            facetFilters,
            attributesToRetrieve: [
                'objectID', 'name', 'description', 'images', 'prices',
                'category', 'moq', 'rating', 'reviewCount', 'sales',
                'stock', 'country', 'deliveryTime', 'fournisseurId',
            ],
            attributesToHighlight: ['name', 'description'],
        });

        return {
            hits: result.hits.map((hit) => ({ ...hit, id: hit.objectID })),
            total: result.nbHits,
            hasMore: (page + 1) * limit < result.nbHits,
            currentPage: page,
            totalPages: result.nbPages,
        };
    } catch (error) {
        console.error('❌ [Algolia] Erreur de recherche:', error);
        return { hits: [], total: 0, hasMore: false, currentPage: 0, totalPages: 0 };
    }
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

    try {
        const result = await productsIndex.search<AlgoliaProduct>(query, {
            hitsPerPage: 5,
            attributesToRetrieve: ['name'],
        });
        return result.hits.map((hit) => hit.name);
    } catch {
        return [];
    }
}
