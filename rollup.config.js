import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "bin/codecov",
  output: {
    file: "dist/codecov.js",
    format: "cjs"
  },
  plugins: [commonjs(), resolve()]
};
