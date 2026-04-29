import type { VercelRequest, VercelResponse } from '@vercel/node'

export function requireApiKey(req: VercelRequest, res: VercelResponse): boolean {
  const key = req.headers['x-api-key']
  const expected = process.env.API_KEY
  if (!expected || !key || key !== expected) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}
