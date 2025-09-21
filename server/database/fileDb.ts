import { promises as fs } from 'fs'
import { join } from 'path'

export interface Score {
  id: number
  playerName: string
  timeSpent: number
  accuracy: number
  boardSize: string
  cardType: string
  createdAt: string
  updatedAt: string
}

export interface ScoreCreateInput {
  playerName: string
  timeSpent: number
  accuracy: number
  boardSize: string
  cardType: string
}

export interface ScoreFilter {
  boardSize?: string
  cardType?: string
}

export interface PaginationOptions {
  limit: number
  page: number
}

export interface PaginationResult {
  total: number
  page: number
  limit: number
  pages: number
}

class FileDatabase {
  private dbPath: string
  private dataPath: string

  constructor() {
    // Store database in the server/database directory
    this.dbPath = join(process.cwd(), 'server', 'database')
    this.dataPath = join(this.dbPath, 'scores.json')
  }

  private async ensureDbExists(): Promise<void> {
    try {
      await fs.access(this.dbPath)
    } catch {
      await fs.mkdir(this.dbPath, { recursive: true })
    }

    try {
      await fs.access(this.dataPath)
    } catch {
      await fs.writeFile(this.dataPath, JSON.stringify([]), 'utf8')
    }
  }

  private async readScores(): Promise<Score[]> {
    await this.ensureDbExists()
    try {
      const data = await fs.readFile(this.dataPath, 'utf8')
      return JSON.parse(data) || []
    } catch (error) {
      console.error('Error reading scores file:', error)
      return []
    }
  }

  private async writeScores(scores: Score[]): Promise<void> {
    await this.ensureDbExists()
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(scores, null, 2), 'utf8')
    } catch (error) {
      console.error('Error writing scores file:', error)
      throw new Error('Failed to save scores')
    }
  }

  private getNextId(scores: Score[]): number {
    if (scores.length === 0) return 1
    return Math.max(...scores.map(score => score.id)) + 1
  }

  async createScore(data: ScoreCreateInput): Promise<Score> {
    const scores = await this.readScores()
    const now = new Date().toISOString()
    
    const newScore: Score = {
      id: this.getNextId(scores),
      ...data,
      createdAt: now,
      updatedAt: now
    }

    scores.push(newScore)
    await this.writeScores(scores)
    
    return newScore
  }

  async findUniqueScore(id: number): Promise<Score | null> {
    const scores = await this.readScores()
    return scores.find(score => score.id === id) || null
  }

  async findManyScores(
    filter: ScoreFilter = {},
    pagination: PaginationOptions = { limit: 10, page: 1 }
  ): Promise<{ scores: Score[]; pagination: PaginationResult }> {
    const allScores = await this.readScores()
    
    // Apply filters
    let filteredScores = allScores
    if (filter.boardSize) {
      filteredScores = filteredScores.filter(score => score.boardSize === filter.boardSize)
    }
    if (filter.cardType) {
      filteredScores = filteredScores.filter(score => score.cardType === filter.cardType)
    }

    // Sort by timeSpent (ascending) then by accuracy (descending)
    filteredScores.sort((a, b) => {
      if (a.timeSpent !== b.timeSpent) {
        return a.timeSpent - b.timeSpent
      }
      return b.accuracy - a.accuracy
    })

    // Apply pagination
    const total = filteredScores.length
    const skip = (pagination.page - 1) * pagination.limit
    const paginatedScores = filteredScores.slice(skip, skip + pagination.limit)

    return {
      scores: paginatedScores,
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(total / pagination.limit)
      }
    }
  }

  async countScores(filter: ScoreFilter = {}): Promise<number> {
    const allScores = await this.readScores()
    
    let filteredScores = allScores
    if (filter.boardSize) {
      filteredScores = filteredScores.filter(score => score.boardSize === filter.boardSize)
    }
    if (filter.cardType) {
      filteredScores = filteredScores.filter(score => score.cardType === filter.cardType)
    }

    return filteredScores.length
  }

  async countBetterScores(scoreData: { timeSpent: number; accuracy: number; boardSize: string; cardType: string }): Promise<number> {
    const allScores = await this.readScores()
    
    // Filter by board size and card type, then count better scores
    const relevantScores = allScores.filter(score => 
      score.boardSize === scoreData.boardSize && score.cardType === scoreData.cardType
    )

    return relevantScores.filter(score => {
      // A score is better if:
      // 1. Time is less (faster), OR
      // 2. Time is the same but accuracy is higher
      return score.timeSpent < scoreData.timeSpent || 
             (score.timeSpent === scoreData.timeSpent && score.accuracy > scoreData.accuracy)
    }).length
  }
}

// Create a singleton instance
const fileDb = new FileDatabase()

export default fileDb