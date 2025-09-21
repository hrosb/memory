import { H3Event } from 'h3'
import fileDb from '~/server/database/fileDb'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.playerName || !body.timeSpent || body.accuracy === undefined || 
        !body.boardSize || !body.cardType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required score data'
      })
    }

    // Validate data types
    if (typeof body.timeSpent !== 'number' || typeof body.accuracy !== 'number') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid score data types'
      })
    }

    // Create the score record
    const newScore = await fileDb.createScore({
      playerName: body.playerName,
      timeSpent: body.timeSpent,
      accuracy: body.accuracy,
      boardSize: body.boardSize,
      cardType: body.cardType
    })

    // Get the player's rank for this board size and card type
    const betterScores = await fileDb.countBetterScores({
      timeSpent: body.timeSpent,
      accuracy: body.accuracy,
      boardSize: body.boardSize,
      cardType: body.cardType
    })

    const rank = betterScores + 1

    return {
      score: newScore,
      rank
    }
  } catch (error: any) {
    console.error('Failed to create score:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save score'
    })
  }
})
