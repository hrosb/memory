import { H3Event } from 'h3'
import prisma from '~/server/database/client'

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
    const newScore = await prisma.score.create({
      data: {
        playerName: body.playerName,
        timeSpent: body.timeSpent,
        accuracy: body.accuracy,
        boardSize: body.boardSize,
        cardType: body.cardType
      }
    })

    // Get the player's rank for this board size and card type
    const betterScores = await prisma.score.count({
      where: {
        boardSize: body.boardSize,
        cardType: body.cardType,
        OR: [
          { timeSpent: { lt: body.timeSpent } },
          {
            timeSpent: body.timeSpent,
            accuracy: { gt: body.accuracy }
          }
        ]
      }
    })

    const rank = betterScores + 1

    return {
      score: newScore,
      rank
    }
  } catch (error) {
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
