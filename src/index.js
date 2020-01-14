const { version } = require("../package.json");

require("yargs")
  .scriptName("pirate-parser")
  .usage("$0 <cmd> [args]")
  .version()
  .command(
    "hello [name]",
    "welcome ter yargs!",
    yargs => {
      yargs.positional("name", {
        type: "string",
        default: "Cambi",
        describe: "the name to say hello to"
      });
    },
    function(argv) {
      console.log("hello", argv.name, "welcome to yargs!");
    }
  )
  .help().argv;

function main(env, args) {
  console.log(`Codecov report uploader ${getVersion()}`);
}

function getVersion() {
  return version;
}

module.exports = {
  main,
  getVersion
};
