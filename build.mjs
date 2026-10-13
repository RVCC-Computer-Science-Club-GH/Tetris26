// Imports
import util from "util";
import esbuild from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import glsl from "esbuild-plugin-glsl";
import { sassPlugin } from "esbuild-sass-plugin";
import progress from "esbuild-plugin-progress";
import copyPluginPkg from "@sprout2000/esbuild-copy-plugin";
const { copyPlugin } = copyPluginPkg;
import fs from "fs";

// Build args
const args = util.parseArgs({
  options: {
    dev: { type: "boolean", short: "d", default: false }
  }
}).values;

// Esbuild options
const options = {
  entryPoints: ["src/index.html"],
  bundle: true,
  minify: !args.dev,
  sourcemap: args.dev,
  outdir: "public",
  assetNames: "assets/[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  loader: { ".webp": "dataurl" },
  target: [
    "es2020",
    "chrome80",
    "edge80",
    "firefox78",
    "safari14",
    "ios14",
    "opera67",
  ],
  plugins: [
    htmlPlugin(),
    glsl(),
    sassPlugin(),
    progress(),
    copyPlugin({ force: true, src: "LICENSE", dest: "public/license.txt" }),
  ],
};

// Clean public
fs.rmSync("public", { force: true, recursive: true });

// Serve or build
if (args.dev) {
  console.log("Open https://localhost:8000");
  console.log("Reload page to trigger rebuild");
  const ctx = await esbuild.context(options);
  await ctx.serve({ servedir: "public" });
} else {
  await esbuild.build(options);
}
