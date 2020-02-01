function exitNonZeroIfSet(inputs) {
    const { args, envs} = inputs
    if (envs.DEBUG || args.nonZero) {
        process.exit(-1)
    }
    process.exit()
}

module.exports = {
    exitNonZeroIfSet
}