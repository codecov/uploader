import glob from 'fast-glob'

import { manualBlocklist } from '../../src/helpers/files'
import { isProgramInstalled, runExternalProgram } from "./util"

export async function generateGcovCoverageFiles(projectRoot: string, include: string[] = [], ignore: string[] = [], gcovArgs: string[] = []): Promise<string> {
    if (!isProgramInstalled('gcov')) {
        throw new Error('gcov is not installed, cannot process files')
    }

    const globstar = (pattern: string) => `**/${pattern}`
    const gcovInclude = ['*.gcno', ...include].map(globstar)
    const gcovIgnore = [...manualBlocklist(), ...ignore].map(globstar)
    const files = await glob(gcovInclude, {cwd: projectRoot, dot: true, ignore: gcovIgnore, onlyFiles: true})
    if (!files.length) {
        throw new Error('No gcov files found')
    }
    return runExternalProgram('gcov', ['-pb', ...gcovArgs, ...files]);
}
