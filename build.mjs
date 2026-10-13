import util from "node:util";
import esbuild from "esbuild";
import fs from "fs";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import glsl from "esbuild-plugin-glsl";

const args = util.parseArgs({
  options: {
    dev: { type: "boolean", short: "d", default: false }
  }
}).values;

fs.copyFileSync("LICENSE", "public/license.txt");

await esbuild.build({
  entryPoints: ["src/index.html"],
  bundle: true,
  minify: !args.dev,
  sourcemap: args.dev,
  outdir: "public",
  assetNames: "build/[name]-[hash]",
  chunkNames: "build/[name]-[hash]",
  plugins: [htmlPlugin(), glsl()],
});
