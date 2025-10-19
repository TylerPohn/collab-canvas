import { useQuery } from '@tanstack/react-query'
import { getRecentCanvas } from '../lib/firebase/firestore'

export function useRecentCanvas(userId: string) {
  const {
    data: recentCanvasId,
    isLoading,
    error
  } = useQuery({
    queryKey: ['recent-canvas', userId],
    queryFn: () => getRecentCanvas(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  return {
    recentCanvasId,
    isLoading,
    error
  }
}
