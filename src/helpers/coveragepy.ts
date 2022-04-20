import { isProgramInstalled, runExternalProgram } from "./util"
import { info } from './logger'

export async function generateCoveragePyFile(): Promise<string> {
    if (!isProgramInstalled('coverage')) {
        throw new Error('coveragepy is not installed')
    }

    info('Running coverage xml...')
    return runExternalProgram('coverage', ['xml']);
}
