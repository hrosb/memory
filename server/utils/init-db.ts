import fileDb from '../database/fileDb'

/**
 * Initialize database with some sample scores if empty
 */
export async function initializeDatabase() {
  try {
    // Check if we already have scores
    const result = await fileDb.findManyScores({}, { limit: 1, page: 1 })
    
    if (result.pagination.total === 0) {
      console.log('Database is empty, adding sample scores...')
      
      // Add some sample scores
      const sampleScores = [
        {
          playerName: 'Memory Master',
          timeSpent: 12.5,
          accuracy: 1.0,
          boardSize: '4x4',
          cardType: 'animals'
        },
        {
          playerName: 'Quick Thinker',
          timeSpent: 15.2,
          accuracy: 0.95,
          boardSize: '4x4',
          cardType: 'animals'
        },
        {
          playerName: 'Card Shark',
          timeSpent: 20.1,
          accuracy: 0.9,
          boardSize: '4x4',
          cardType: 'letters'
        },
        {
          playerName: 'Brain Wizard',
          timeSpent: 5.8,
          accuracy: 1.0,
          boardSize: '2x2',
          cardType: 'animals'
        },
        {
          playerName: 'Puzzle Pro',
          timeSpent: 60.3,
          accuracy: 0.85,
          boardSize: '6x6',
          cardType: 'letters'
        }
      ]

      for (const scoreData of sampleScores) {
        await fileDb.createScore(scoreData)
      }
      
      console.log('Sample scores added successfully')
    } else {
      console.log(`Database already contains ${result.pagination.total} scores`)
    }
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}
