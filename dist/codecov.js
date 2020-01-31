'use strict';

// #!/usr/bin/env node

const app = require("../src");

var argv = require("yargs") // eslint-disable-line
  .usage("Usage: $0 <command> [options]")
  .options({
    build: {
      alias: "b",
      description: "Specify the build number manually"
    },
    branch: {
      alias: "B",
      description: "Specify the branch manually"
    },
    sha: {
      alias: "C",
      description: "Specify the commit SHA mannually"
    },
    file: {
      alias: "f",
      description: "Target file(s) to upload"
    },
    flags: {
      alias: "F",
      default: "",
      description: "Flag the upload to group coverage metrics"
    },
    pr: {
      alias: "P",
      description: "Specify the pull request number mannually"
    },
    token: {
      alias: "t",
      default: "",
      description: "Codecov upload token"
    },
    tag: {
      alias: "T",
      default: "",
      description: "Specify the git tag"
    },
    verbose: {
      alias: "v",
      type: "boolean",
      description: "Run with verbose logging"
    },
    "dry-run": {
      alias: "d",
      type: "boolean",
      description: "Don't upload files to Codecov"
    },
    slug: {
      alias: "r",
      description: "Specify the slug manually (Enterprise use)"
    },
    url: {
      type: "string",
      description: "Change the upload host (Enterprise use)",
      default: "https://codecov.io"
    }
  })
  .version()
  .help("help")
  .alias("help", "h").argv;

app.main(argv);
