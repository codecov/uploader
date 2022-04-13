import { isProgramInstalled, runExternalProgram } from "./util"
import { UploadLogger } from './logger'

export async function generateCoveragePyFile(): Promise<string> {
    if (!isProgramInstalled('coverage')) {
        UploadLogger.verbose(`coveragepy is not installed, skipping coverage xml conversion`)
        return '';
    }

    return runExternalProgram('coverage', ['xml']);
}
