// Imports
import * as vite from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import checkerPlugin from "vite-plugin-checker";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { compression } from "vite-plugin-compression2";
import glslPlugin from "vite-plugin-glsl";
import { ViteFaviconsPlugin } from "@leancodepl/vite-plugin-favicon";

// Config
export default vite.defineConfig(({ mode }) => {
  return {
    build: {
      target: "es2015",
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
      glslPlugin({ minify: mode !== "development" }),
      ViteFaviconsPlugin({
        logo: "src/assets/rvcc.png",
        favicons: {
          icons: {
            android: false,
            appleIcon: false,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false,
          }
        }
      })
    ]
  };
});

