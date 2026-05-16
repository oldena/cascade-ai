#!/usr/bin/env node
// Run migration 003_agents_platform.sql against Supabase
// Usage: node scripts/run-migration-003.js

const https = require('https')
const fs = require('fs')
const path = require('path')

const sql = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/003_agents_platform.sql'),
  'utf8'
)

const body = Buffer.from(JSON.stringify({ query: sql }), 'utf8')

const options = {
  hostname: 'api.supabase.com',
  path: '/v1/projects/tgbknlbtbzyphwhmjfcw/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${SUPABASE_PERSONAL_ACCESS_TOKEN}',
    'Content-Type': 'application/json',
    'Content-Length': body.length,
  },
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Migration succeeded:', res.statusCode)
      console.log(data)
    } else {
      console.error('Migration failed:', res.statusCode)
      console.error(data)
      process.exit(1)
    }
  })
})

req.on('error', (err) => {
  console.error('Request error:', err.message)
  process.exit(1)
})

req.write(body)
req.end()
