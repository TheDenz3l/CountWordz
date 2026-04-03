import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const targetPath = path.resolve(
  process.cwd(),
  'node_modules/vite/dist/node/chunks/config.js'
);

const originalSnippet = [
  '\t\t\tconst handler = getHookHandler(plugin.transform);',
  '\t\t\ttry {',
  '\t\t\t\tresult = await this.handleHookPromise(handler.call(ctx, code, id, optionsWithSSR));',
  '\t\t\t} catch (e$1) {'
].join('\n');

const patchedSnippet = [
  '\t\t\tconst handler = getHookHandler(plugin.transform);',
  '\t\t\tif (!handler) {',
  '\t\t\t\tcontinue;',
  '\t\t\t}',
  '\t\t\ttry {',
  '\t\t\t\tresult = await this.handleHookPromise(handler.call(ctx, code, id, optionsWithSSR));',
  '\t\t\t} catch (e$1) {'
].join('\n');

async function patchViteTransformHandler() {
  let source;

  try {
    source = await readFile(targetPath, 'utf8');
  } catch (error) {
    console.warn(`[vite-patch] Skipping patch: ${targetPath} is not available yet.`);
    return;
  }

  if (source.includes(patchedSnippet)) {
    console.log('[vite-patch] Undefined transform handler guard already applied.');
    return;
  }

  if (!source.includes(originalSnippet)) {
    throw new Error(
      '[vite-patch] Unable to find the expected Vite transform handler block. Patch aborted to avoid modifying an unknown version.'
    );
  }

  await writeFile(targetPath, source.replace(originalSnippet, patchedSnippet), 'utf8');
  console.log('[vite-patch] Applied undefined transform handler guard to Vite.');
}

await patchViteTransformHandler();
