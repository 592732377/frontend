import { globIterate } from "glob";
import { availableParallelism } from "node:os";

process.env.UV_THREADPOOL_SIZE = availableParallelism();

const gulpImports = [];

for await (const gulpModule of globIterate("build-scripts/gulp/*.?(c|m)js", {
  dotRelative: true,
})) {
  gulpImports.push(import(gulpModule));
}

// Since all tasks are currently registered with gulp.task(), this is enough
// If any are converted to named exports, need to loop and aggregate exports here
await Promise.all(gulpImports);
