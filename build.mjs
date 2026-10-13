import * as util from "node:util";
import * as esbuild from "esbuild";
import * as fs from "fs";

const args = util.parseArgs({
  options: {
    dev: { type: "boolean", short: "d", default: false }
  }
}).values;

fs.copyFileSync("LICENSE", "public/license.txt");

await esbuild.build({
  entryPoints: ["src/index.js", "src/index.css"],
  bundle: true,
  minify: !args.dev,
  sourcemap: args.dev,
  format: "esm",
  outdir: "public",
});
