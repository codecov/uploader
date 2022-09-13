import td from 'testdouble'
import childProcess from 'child_process'

import * as fixesHelpers from '../../src/helpers/fixes'

describe('Fixes Helpers', () => {
  afterEach(() => {
    td.reset()
  })

  it('provides no fixes if none are applicable', async () => {
    const files = ['package.json']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fixesHelpers.generateFixes('.')
    ).toBe('')
  })

  it('provides proper fixes for c-like files', async () => {
    const files = ['test/fixtures/gcov/main.c']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fixesHelpers.generateFixes('.')
    ).toBe('test/fixtures/gcov/main.c:2,4,11,12,13,14,16,20\n')
  })

  it('provides proper fixes for php-like files', async () => {
    const files = ['test/fixtures/fixes/example.php']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fixesHelpers.generateFixes('.')
    ).toBe('test/fixtures/fixes/example.php:4,6,11,15,19,20\n')
  })

  it('provides multiple fixes for files', async () => {
    const files = ['test/fixtures/fixes/example.php', 'test/fixtures/gcov/main.c']
    td.replace(childProcess, 'spawnSync', () => {
      return {
        stdout: files.join('\n'),
        status: 0,
        error: undefined,
      }
    })
    expect(
      await fixesHelpers.generateFixes('.')
    ).toBe('test/fixtures/fixes/example.php:4,6,11,15,19,20\ntest/fixtures/gcov/main.c:2,4,11,12,13,14,16,20\n')
  })
})
