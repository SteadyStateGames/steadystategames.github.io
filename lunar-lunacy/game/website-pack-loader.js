// GitHub Pages serves the unchanged Godot resource pack in files below its
// per-file Git limit. Feed the assembled bytes through Godot's public API.
(() => {
  let notify = () => {};
  let packLoaded = 0;
  let wasmLoaded = 0;
  const manifest = window.WEBSITE_PACK;
  const report = () => notify(packLoaded + wasmLoaded, manifest.bytes + manifest.wasmBytes);
  window.websiteProgress = (current) => {
    wasmLoaded = Math.min(current, manifest.wasmBytes);
    report();
  };

  async function downloadPack() {
    const pack = new Uint8Array(manifest.bytes);
    let offset = 0;
    for (const part of manifest.parts) {
      let complete = false;
      for (let attempt = 0; attempt < 3 && !complete; attempt++) {
        let reader;
        try {
          const response = await fetch(part.name);
          if (!response.ok) throw new Error('Game download failed. Please reload to retry.');
          let received = 0;
          if (response.body) {
            reader = response.body.getReader();
            while (true) {
              const {value, done} = await reader.read();
              if (done) break;
              if (received + value.length > part.bytes) throw new Error('Incomplete game download. Please reload to retry.');
              pack.set(value, offset + received);
              received += value.length;
              packLoaded = offset + received;
              report();
            }
          } else {
            const bytes = new Uint8Array(await response.arrayBuffer());
            if (bytes.length !== part.bytes) throw new Error('Incomplete game download. Please reload to retry.');
            pack.set(bytes, offset);
            received = bytes.length;
          }
          if (received !== part.bytes) throw new Error('Incomplete game download. Please reload to retry.');
          complete = true;
        } catch (error) {
          if (reader) await reader.cancel().catch(() => {});
          packLoaded = offset;
          report();
          if (attempt === 2) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
          if (reader) reader.releaseLock();
        }
      }
      offset += part.bytes;
      packLoaded = offset;
      report();
    }
    if (offset !== manifest.bytes) throw new Error('Invalid game download. Please reload to retry.');
    return pack.buffer;
  }

  window.startWebsiteGame = async (engine, config, options) => {
    notify = options.onProgress || (() => {});
    report();
    await Promise.all([
      engine.init(config.executable),
      downloadPack().then(bytes => engine.preloadFile(bytes, 'index.pck')),
    ]);
    return engine.start({...options, args: ['--main-pack', 'index.pck', ...(config.args || [])]});
  };
})();
