import { isProgramInstalled, runExternalProgram } from "./util"

export async function generateCoveragePyFile(): Promise<string> {
    if (!isProgramInstalled('coverage')) {
        throw new Error('coveragepy is not installed, cannot convert file format')
    }

    return runExternalProgram('coverage', ['xml']);
}
