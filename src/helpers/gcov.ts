import glob from 'fast-glob'
import { isProgramInstalled, runExternalProgram } from "./util"

export function generateGcovCoverageFiles(projectRoot: string, include: string[] = [], ignore: string[] = [], gcovArgs = '',) {
    if (!isProgramInstalled('gcov')) {
        throw new Error('gcov is not installed, cannot process files')
    }

    const globstar = (pattern: string) => `**/${pattern}`
    const gcovInclude = ['*.gcno', ...include].map(globstar)
    const gcovIgnore = ['bower_components', 'node_modules', 'vendor', ...ignore].map(globstar)
    const files = glob
        .sync(gcovInclude, {
            cwd: projectRoot,
            ignore: gcovIgnore,
            onlyFiles: true,
        })
    if (!files.length) {
        throw new Error('No gcov files found')
    }
    const gcovLog = runExternalProgram('gcov', ['-pb', gcovArgs, files.join(' ')]);
    return gcovLog
}
