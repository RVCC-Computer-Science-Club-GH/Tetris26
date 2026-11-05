// Imports
import * as vite from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import checkerPlugin from "vite-plugin-checker";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { compression } from "vite-plugin-compression2";
import wasmPlugin from "vite-plugin-wasm";
import glslPlugin from "vite-plugin-glsl";

// Config
export default vite.defineConfig(({ mode }) => {
  return {
    build: {
      target: "es2022",
      reportCompressedSize: false
    },
    server: { port: 8000 },
    preview: { port: 8000 },
    base: "",
    plugins: [
      ViteMinifyPlugin(),
      checkerPlugin({ typescript: true }),
      viteStaticCopy({ targets: [{ src: "license.txt", dest: "" }] }),
      compression({ include: /\.(html|xml|css|json|js|mjs|cjs|svg|yaml|yml|toml|wasm)$/ }),
      wasmPlugin(),
      glslPlugin({ minify: mode !== "development" })
    ]
  }
});

