import { ref } from 'vue'

export function useLeaderboard() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const leaderboard = ref<any[]>([])
  const playerRank = ref<number | null>(null)

  /**
   * Submit a new score to the leaderboard
   */
  async function submitScore(scoreData: {
    playerName: string;
    timeSpent: number;
    accuracy: number;
    boardSize: string;
    cardType: string;
  }) {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await $fetch('/api/scores', {
        method: 'POST',
        body: scoreData
      })
      
      playerRank.value = result.rank
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to submit score'
      console.error('Error submitting score:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get leaderboard scores with filtering
   */
  async function getLeaderboard(filters: {
    boardSize?: string;
    cardType?: string;
    limit?: number;
    page?: number;
  } = {}) {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await $fetch('/api/scores', {
        params: filters
      })
      
      leaderboard.value = result.scores
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch leaderboard'
      console.error('Error fetching leaderboard:', err)
      return { scores: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Get a specific score by ID
   */
  async function getScore(id: number) {
    isLoading.value = true
    error.value = null
    
    try {
      return await $fetch(`/api/scores/${id}`)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch score'
      console.error('Error fetching score:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    isLoading,
    error,
    leaderboard,
    playerRank,
    submitScore,
    getLeaderboard,
    getScore
  }
}
