import util from "node:util";
import esbuild from "esbuild";
import fs from "fs";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import glsl from "esbuild-plugin-glsl";
import { sassPlugin } from "esbuild-sass-plugin";

const args = util.parseArgs({
  options: {
    dev: { type: "boolean", short: "d", default: false }
  }
}).values;

await esbuild.build({
  entryPoints: ["src/index.html"],
  bundle: true,
  minify: !args.dev,
  sourcemap: args.dev,
  outdir: "public",
  assetNames: "assets/[name]-[hash]",
  chunkNames: "chunks/[name]-[hash]",
  loader: { ".png": "file" },
  plugins: [htmlPlugin(), glsl(), sassPlugin()],
});

fs.copyFileSync("LICENSE", "public/license.txt");
