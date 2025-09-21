import { H3Event } from 'h3'
import fileDb from '~/server/database/fileDb'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get query parameters for filtering
    const query = getQuery(event)
    const boardSize = query.boardSize as string | undefined
    const cardType = query.cardType as string | undefined
    const limit = Number(query.limit || 10)
    const page = Number(query.page || 1)

    // Build filter object based on provided parameters
    const filter = {
      ...(boardSize && { boardSize }),
      ...(cardType && { cardType })
    }

    // Get scores with pagination
    const result = await fileDb.findManyScores(filter, { limit, page })

    return result
  } catch (error: any) {
    console.error('Failed to retrieve scores:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve leaderboard scores'
    })
  }
})
