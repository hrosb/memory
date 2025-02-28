import { H3Event } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get query parameters for filtering
    const query = getQuery(event)
    const boardSize = query.boardSize as string | undefined
    const cardType = query.cardType as string | undefined
    const limit = Number(query.limit || 10)
    const page = Number(query.page || 1)
    const skip = (page - 1) * limit

    // Build filter object based on provided parameters
    const where = {
      ...(boardSize && { boardSize }),
      ...(cardType && { cardType })
    }

    // Get scores with pagination
    const scores = await prisma.score.findMany({
      where,
      orderBy: [
        { timeSpent: 'asc' },
        { accuracy: 'desc' }
      ],
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.score.count({ where })

    return {
      scores,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Failed to retrieve scores:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve leaderboard scores'
    })
  }
})
