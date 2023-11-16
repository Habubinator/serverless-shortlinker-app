import { BuildOptions } from "esbuild";
import path from "path";
import 'dotenv/config';

const mode = process.env.BUILD_MODE || "development";
const isProd = mode === "production";
const isDev = mode === "development";

function resolveRoot(...segments:string[]) {
  return path.resolve(__dirname, "..", "..", ...segments);
}

const config : BuildOptions = {
  outdir: resolveRoot("build"),
  entryPoints: [resolveRoot("src/**/*.ts")],
  bundle: true,
  minify: isProd,
  sourcemap: isDev,
  platform: 'node',
  tsconfig: resolveRoot("tsconfig.json")
};

export default config;
