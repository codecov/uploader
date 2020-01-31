function exitNonZeroIfSet(envs, args) {
    if (envs.DEBUG || args.nonZero) {
        process.exit(-1)
    }
    process.exit()
}

module.exports = {
    exitNonZeroIfSet
}