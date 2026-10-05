/* Personal audio stays on this device. No uploads or network folder access. */
(() => {
  'use strict';
  const supported = name => /\.(mp3|ogg)$/i.test(name);
  let database, tracks = [], folder, revision = 0, ready = false, notice = '', action = 'load';
  const urls = new Map();
  const db = new Promise((resolve, reject) => {
    const request = indexedDB.open('pomodoro-music', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('tracks', { keyPath: 'id' });
      request.result.createObjectStore('settings');
    };
    request.onsuccess = () => { database = request.result; resolve(database); };
    request.onerror = () => reject(request.error);
  });
  function requestValue(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function reload(nextAction = 'load') {
    const database = await db;
    const transaction = database.transaction(['tracks', 'settings']);
    [tracks, folder] = await Promise.all([
      requestValue(transaction.objectStore('tracks').getAll()),
      requestValue(transaction.objectStore('settings').get('folder')),
    ]);
    tracks.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    ready = true;
    action = nextAction;
    revision++;
  }
  function complete(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = resolve;
      transaction.onerror = transaction.onabort = () => reject(transaction.error || new Error('Could not save music'));
    });
  }
  async function storeFiles(files) {
    const selected = [...files].filter(file => supported(file.name));
    if (!selected.length) { notice = 'Choose MP3 or OGG audio files.'; return; }
    await db;
    const transaction = database.transaction('tracks', 'readwrite');
    const finished = complete(transaction);
    const store = transaction.objectStore('tracks');
    for (const file of selected) {
      // Stable identity avoids duplicates when the same folder is imported again.
      const id = 'file:' + (file.webkitRelativePath || file.name) + ':' + file.size + ':' + file.lastModified;
      store.put({ id, name: file.name.replace(/\.(mp3|ogg)$/i, ''), blob: file });
    }
    await finished;
    await reload('import');
    navigator.storage?.persist?.().catch(() => {});
    notice = `Added ${selected.length} tracks to this browser.`;
  }
  function importFiles(directory = false) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.mp3,.ogg,audio/mpeg,audio/ogg'; input.multiple = true;
    if (directory) input.webkitdirectory = true;
    input.hidden = true; document.body.append(input);
    input.onchange = () => {
      storeFiles(input.files).catch(() => { notice = 'Could not save this library. Browser storage may be full. Try fewer files.'; }).finally(() => { input.remove(); document.getElementById('canvas')?.focus(); });
    };
    input.oncancel = () => { input.remove(); document.getElementById('canvas')?.focus(); };
    input.click();
  }
  async function scan(handle, prefix = '') {
    const result = [];
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === 'directory') result.push(...await scan(entry, prefix + name + '/'));
      else if (supported(name)) result.push({ id: 'folder:' + prefix + name,
        name: name.replace(/\.(mp3|ogg)$/i, ''), handle: entry });
    }
    return result;
  }
  async function saveFolder(handle) {
    const selected = await scan(handle);
    if (!selected.length) { notice = 'This folder has no MP3 or OGG files.'; return; }
    await db;
    const transaction = database.transaction(['tracks', 'settings'], 'readwrite');
    const finished = complete(transaction);
    const store = transaction.objectStore('tracks');
    for (const track of tracks.filter(track => track.handle)) store.delete(track.id);
    for (const track of selected) store.put(track);
    transaction.objectStore('settings').put(handle, 'folder');
    await finished;
    for (const [id, url] of urls) { URL.revokeObjectURL(url); urls.delete(id); }
    await reload('folder');
    notice = `Connected ${handle.name}: ${selected.length} tracks.`;
  }
  async function linkFolder() {
    if (!window.showDirectoryPicker) { importFiles(true); return; }
    try {
      const handle = await window.showDirectoryPicker({ mode: 'read' });
      await saveFolder(handle);
    } catch (error) {
      if (error.name !== 'AbortError') notice = 'Could not connect this folder. You can import its files instead.';
    } finally { document.getElementById('canvas')?.focus(); }
  }
  async function reconnect() {
    try {
      if (!folder) { await linkFolder(); return; }
      if (await folder.requestPermission({ mode: 'read' }) !== 'granted') {
        notice = 'Folder access was not granted. Your library is still saved.'; return;
      }
      await saveFolder(folder);
    } catch { notice = 'Could not reopen the folder. Use Connect folder to choose it again.'; }
  }
  async function resolveTrack(id) {
    await db;
    if (!ready) await reload();
    const track = tracks.find(track => track.id === id);
    if (!track) throw new Error('This track is unavailable. Choose another song or reconnect your folder.');
    if (track.handle) {
      if (await track.handle.queryPermission({ mode: 'read' }) !== 'granted')
        throw new Error('Reconnect your music folder in the music library.');
      // Read the current file so edited linked tracks are reflected immediately.
      if (urls.has(id)) URL.revokeObjectURL(urls.get(id));
      urls.set(id, URL.createObjectURL(await track.handle.getFile()));
    } else if (!urls.has(id)) urls.set(id, URL.createObjectURL(track.blob));
    return urls.get(id);
  }
  async function remove(id) {
    try {
      await db;
      const transaction = database.transaction('tracks', 'readwrite');
      const finished = complete(transaction);
      transaction.objectStore('tracks').delete(id);
      await finished;
      if (urls.has(id)) { URL.revokeObjectURL(urls.get(id)); urls.delete(id); }
      await reload();
    } catch { notice = 'Could not remove this library entry.'; }
  }
  reload().catch(() => { ready = true; notice = 'Personal music storage is unavailable in this browser.'; });
  window.StillLibrary = {
    importFiles, linkFolder, reconnect, resolveTrack, remove,
    status: () => JSON.stringify({ ready, revision, action, folder: folder?.name || '',
      tracks: tracks.map(({ id, name }) => ({ id, name, path: 'custom:' + id })) }),
    takeNotice() { const value = notice; notice = ''; return value; },
  };
})();
