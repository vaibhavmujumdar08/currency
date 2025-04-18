export interface Currency {
  code: string;
  name: string;
}

export interface CurrencyRates {
  date: string;
  [key: string]: string | Record<string, number>;
}

export const API_BASE_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
export const CLOUDFLARE_BASE_URL = 'https://latest.currency-api.pages.dev/v1';
export const FALLBACK_BASE_URL = 'https://api.exchangerate.host';
export const BACKUP_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();

export async function fetchWithFallback(endpoint: string, date: string = 'latest'): Promise<Record<string, unknown>> {
  const cacheKey = `${endpoint}-${date}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const apis = [
    {
      url: API_BASE_URL,
      transform: (data: Record<string, unknown>) => data
    },
    {
      url: CLOUDFLARE_BASE_URL,
      transform: (data: Record<string, unknown>) => data
    },
    {
      url: FALLBACK_BASE_URL,
      transform: (data: { rates: Record<string, number> }) => {
        if (endpoint.includes('currencies.json')) {
          return data.rates;
        }
        const from = endpoint.split('/')[2]?.replace('.json', '');
        return { [from]: data.rates };
      },
      getEndpoint: () => endpoint.includes('currencies.json') ? '/latest' : '/latest'
    },
    {
      url: BACKUP_BASE_URL,
      transform: (data: { rates: Record<string, number> }) => {
        if (endpoint.includes('currencies.json')) {
          return data.rates;
        }
        const from = endpoint.split('/')[2]?.replace('.json', '');
        return { [from]: data.rates };
      },
      getEndpoint: () => ''
    }
  ];

  for (const api of apis) {
    try {
      const apiEndpoint = api.getEndpoint ? api.getEndpoint() : endpoint;
      const response = await fetch(`${api.url}${apiEndpoint}`);
      
      if (response.ok) {
        const data = await response.json();
        const transformedData = api.transform(data);
        cache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
        return transformedData;
      }
    } catch (error) {
      console.warn(`API failed (${api.url}):`, error);
      continue;
    }
  }

  throw new Error('All API endpoints failed');
}

export async function getCurrencies(date: string = 'latest'): Promise<{ [key: string]: string }> {
  const data = await fetchWithFallback('/currencies.json', date) as { currencies?: { [key: string]: string }; [key: string]: unknown };
  return data.currencies || data as { [key: string]: string };
}

export async function getExchangeRates(baseCurrency: string, date: string = 'latest'): Promise<CurrencyRates> {
  try {
    const data = await fetchWithFallback(`/currencies/${baseCurrency.toLowerCase()}.json`, date) as {
      date?: string;
      rates?: Record<string, number>;
      [key: string]: Record<string, number> | string | undefined;
    };
    
    if (!data || (!data.rates && !data[baseCurrency.toLowerCase()])) {
      throw new Error('Invalid response format');
    }
    
    return {
      date: data.date || new Date().toISOString().split('T')[0],
      [baseCurrency.toLowerCase()]: data.rates || data[baseCurrency.toLowerCase()] as Record<string, number>
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw new Error('Failed to fetch exchange rates. Please try again later.');
  }
}