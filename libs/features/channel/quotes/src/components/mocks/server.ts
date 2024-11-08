import { handlers } from './apiHandlers'
import { setupServer } from 'msw/node'

export default setupServer(...handlers)
