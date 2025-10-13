import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Cache time: how long data stays in cache when unused
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (
          error instanceof Error &&
          'status' in error &&
          typeof error.status === 'number'
        ) {
          if (error.status >= 400 && error.status < 500) {
            return false
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1
    }
  }
})
