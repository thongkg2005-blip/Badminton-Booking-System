import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ddlPath = resolve(process.cwd(), 'db', 'ddl.sql')

if (!existsSync(ddlPath)) {
  console.error('[check-db] Missing required file: db/ddl.sql')
  process.exit(1)
}

const ddl = readFileSync(ddlPath, 'utf8')
const requiredTokens = ['CREATE TABLE loai_dung_cu', 'CREATE TABLE dung_cu']
const missingTokens = requiredTokens.filter((token) => !ddl.includes(token))

if (missingTokens.length > 0) {
  console.error('[check-db] DDL is missing required definitions:')
  for (const token of missingTokens) {
    console.error(`- ${token}`)
  }
  process.exit(1)
}

console.log('[check-db] Database check passed')
