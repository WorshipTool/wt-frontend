import { attachRetry } from '@/tech/fetch/retry'
import axios from 'axios'

/**
 * Shared axios instance for all generated API classes (client + server).
 * Adds the narrow retry for transient backend failures — see retry.ts.
 */
export const apiAxios = attachRetry(axios.create())
