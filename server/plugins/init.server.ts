import { initializeDatabase } from '../utils/init-db'

export default defineNitroPlugin(async () => {
  // Run database initialization when server starts
  await initializeDatabase()
})
