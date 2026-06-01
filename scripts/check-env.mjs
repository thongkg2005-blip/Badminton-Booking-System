import { spawnSync } from 'node:child_process'

const checks = [
  { name: 'node', args: ['--version'], required: true },
  { name: 'npm', args: ['--version'], required: true },
  { name: 'git', args: ['--version'], required: true },
  { name: 'java', args: ['--version'], required: false },
  { name: 'psql', args: ['--version'], required: false },
]

let hasWarning = false

for (const check of checks) {
  const result = spawnSync(check.name, check.args, {
    encoding: 'utf8',
    shell: true,
  })

  if (result.error || result.status !== 0) {
    const level = check.required ? 'ERROR' : 'WARN'
    const message = check.required
      ? `${level}: ${check.name} is missing or not available in PATH.`
      : `${level}: ${check.name} is optional and was not found.`
    console.log(`[check-env] ${message}`)
    if (check.required) {
      process.exitCode = 1
    } else {
      hasWarning = true
    }
    continue
  }

  const output = (result.stdout || result.stderr || '').trim().split('\n')[0]
  console.log(`[check-env] ${check.name}: ${output}`)
}

if (process.exitCode === 1) {
  process.exit(1)
}

if (hasWarning) {
  console.log('[check-env] Completed with warnings for optional tools.')
} else {
  console.log('[check-env] Environment check passed.')
}
