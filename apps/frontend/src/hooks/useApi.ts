import { useState, useCallback, useEffect } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface ApiOptions {
  initialLoad?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // Cache duration in milliseconds
}

const CACHE: Record<string, { data: any; timestamp: number }> = {};

/**
 * Custom hook for API calls, supports loading state, error handling and optional caching
 * @param apiFn API function that returns a Promise
 * @param options Configuration options
 * @returns API state and execution function
 */
export function useApi<T, P extends any[] = []>(
  apiFn: (...params: P) => Promise<T>,
  options: ApiOptions = {}
) {
  const { initialLoad = false, cacheKey, cacheDuration = 5 * 60 * 1000 } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: initialLoad,
    error: null
  });

  // Clear current data
  const clear = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null
    });
    
    if (cacheKey) {
      delete CACHE[cacheKey];
    }
  }, [cacheKey]);

  // Execute API call
  const execute = useCallback(
    async (...params: P) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check cache
      if (cacheKey && CACHE[cacheKey]) {
        const cachedData = CACHE[cacheKey];
        const now = Date.now();
        
        if (now - cachedData.timestamp < cacheDuration) {
          setState({
            data: cachedData.data,
            isLoading: false,
            error: null
          });
          return cachedData.data;
        }
      }
      
      try {
        const data = await apiFn(...params);
        
        setState({
          data,
          isLoading: false,
          error: null
        });
        
        // Store in cache
        if (cacheKey) {
          CACHE[cacheKey] = { data, timestamp: Date.now() };
        }
        
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setState({
          data: null,
          isLoading: false,
          error: errorObj
        });
        
        throw errorObj;
      }
    },
    [apiFn, cacheKey, cacheDuration]
  );
  
  // If initial load is set, execute once automatically
  useEffect(() => {
    if (initialLoad) {
      execute(...([] as unknown as P));
    }
  }, [initialLoad, execute]);
  
  return {
    ...state,
    execute,
    clear
  };
}

export default useApi; 