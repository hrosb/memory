import { H3Event } from 'h3'
import prisma from '~/server/database/client'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const id = parseInt(event.context.params?.id, 10)
    
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid score ID'
      })
    }

    const score = await prisma.score.findUnique({
      where: { id }
    })

    if (!score) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Score not found'
      })
    }

    return score
  } catch (error) {
    console.error('Failed to retrieve score:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve score'
    })
  }
})
