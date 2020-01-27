const util = require("util");
const fs = require("fs");

const stat = util.promisify(fs.stat);

async function callStat() {
  const stats = await stat(".");
  console.log(`This directory is owned by ${stats.uid}`);
}

async function readCoverageFile(filePath) {}
