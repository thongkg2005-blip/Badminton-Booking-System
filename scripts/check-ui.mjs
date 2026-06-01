import { spawnSync } from 'node:child_process'

const result = spawnSync('npx', ['tsc', '--noEmit'], {
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 1)
