import childprocess from 'child_process'

export function isProgramInstalled(programName: string): boolean {
  return !childprocess.spawnSync(programName).error
}

export function runExternalProgram(
  programName: string,
  optionalArguments: string[] = [],
): string {
  const result = childprocess.spawnSync(programName, optionalArguments)
  if (result.error) {
    throw new Error(`Error running external program: ${result.error}`)
  }
  return result.stdout.toString().trim()
}
