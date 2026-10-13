import util from "node:util";
import esbuild from "esbuild";
import fs from "fs";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import glsl from "esbuild-plugin-glsl";
import { sassPlugin } from "esbuild-sass-plugin";
import progress from "esbuild-plugin-progress";

const args = util.parseArgs({
  options: {
    dev: { type: "boolean", short: "d", default: false }
  }
}).values;

const options = {
  entryPoints: ["src/index.html"],
  bundle: true,
  minify: !args.dev,
  sourcemap: args.dev,
  outdir: "public",
  assetNames: "assets/[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  loader: { ".png": "dataurl" },
  plugins: [
    htmlPlugin(),
    glsl(),
    sassPlugin(),
    progress()
  ],
};

if (args.dev) {
  console.log("Open https://localhost:8000");
  console.log("Reload page to trigger rebuild");
  const ctx = await esbuild.context(options);
  await ctx.serve({ servedir: "public" });
} else {
  await esbuild.build(options);
}

fs.copyFileSync("LICENSE", "public/license.txt");
