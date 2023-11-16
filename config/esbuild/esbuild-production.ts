import esbuild from 'esbuild';
import 'dotenv/config'
import config from "./esbuild-config"

esbuild.build(config).catch(console.log)        