// Yerleşik yerel yapay zekâ (ana süreç): API anahtarı, sunucu adresi ve ücret yok; model bu bilgisayarda çalışır.
// - Motor: node-llama-cpp (llama.cpp). Model dosyası (GGUF) ilk kullanımda Hugging Face'ten TEK SEFER indirilir
//   (yalnız dosya istenir; kullanıcı verisi gönderilmez). Sonrasında internet gerekmez.
// - Güvenlik: indirme yalnız huggingface.co / hf.co konaklarından (yönlendirme sonrası da denetlenir), boyutu katalogla doğrulanır.
// - Sohbet ve araç çağrıları cihazdan çıkmaz; araçlar electron-ai.cjs'teki aynı güvenlik katmanından (çalışma klasörü, onay) geçer.
const { app, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Yalnız Apache-2.0 lisanslı modeller (ticari kullanıma uygun).
const MODELS = {
  'qwen2.5-coder-1.5b': {
    label: 'Qwen2.5-Coder 1.5B', tier: 'fast', size: 1117320768, ctx: 8192, ramGb: 3,
    file: 'qwen2.5-coder-1.5b-instruct-q4_k_m.gguf',
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf'
  },
  'qwen2.5-coder-7b': {
    label: 'Qwen2.5-Coder 7B', tier: 'strong', size: 4683073536, ctx: 8192, ramGb: 8,
    file: 'qwen2.5-coder-7b-instruct-q4_k_m.gguf',
    url: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF/resolve/main/qwen2.5-coder-7b-instruct-q4_k_m.gguf'
  }
};
const DEFAULT_ID = 'qwen2.5-coder-1.5b';
const IDLE_MS = 10 * 60 * 1000;

const modelsDir = () => path.join(app.getPath('userData'), 'models');
const finalPath = (id) => path.join(modelsDir(), MODELS[id].file);
const partPath = (id) => finalPath(id) + '.part';
const isInstalled = (id) => {
  try { return fs.statSync(finalPath(id)).size === MODELS[id].size; } catch { return false; }
};
const hostOk = (u) => {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' && (x.hostname === 'huggingface.co' || x.hostname.endsWith('.huggingface.co') || x.hostname === 'hf.co' || x.hostname.endsWith('.hf.co'));
  } catch { return false; }
};

const downloads = new Map(); // id -> { abort, received }
let lib = null; // node-llama-cpp (ESM) — tembel yüklenir
let llama = null;
let loaded = null; // { id, model }
let idleTimer = null;

async function getLib() {
  if (!lib) lib = await import('node-llama-cpp');
  return lib;
}

async function disposeModel() {
  clearTimeout(idleTimer);
  const l = loaded;
  loaded = null;
  try { if (l) await l.model.dispose(); } catch { /* kapalı */ }
}

async function getModel(id) {
  clearTimeout(idleTimer);
  if (loaded && loaded.id === id) return loaded.model;
  await disposeModel();
  const { getLlama } = await getLib();
  if (!llama) llama = await getLlama({ build: 'never', logLevel: 'error' }); // derleme yok: yalnız hazır ikililer
  const model = await llama.loadModel({ modelPath: finalPath(id), gpuLayers: 'auto' });
  loaded = { id, model };
  return model;
}

const scheduleIdle = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { void disposeModel(); }, IDLE_MS);
};

// ---------- İndirme (Range ile devam, ilerleme olayı) ----------
async function download(id, emit) {
  const m = MODELS[id];
  if (!m) return { success: false, error: 'unknown-model' };
  if (isInstalled(id)) return { success: true };
  if (downloads.has(id)) return { success: false, error: 'busy' };
  fs.mkdirSync(modelsDir(), { recursive: true });
  const ctl = { abort: new AbortController(), received: 0 };
  downloads.set(id, ctl);
  try {
    let have = 0;
    try { have = fs.statSync(partPath(id)).size; } catch { /* yeni indirme */ }
    if (have > m.size) { fs.rmSync(partPath(id), { force: true }); have = 0; }
    const res = await fetch(m.url, { headers: have ? { range: `bytes=${have}-` } : {}, signal: ctl.abort.signal, redirect: 'follow' });
    if (!hostOk(res.url)) throw new Error('izinsiz-konak');
    if (res.status === 416) { have = 0; fs.rmSync(partPath(id), { force: true }); throw new Error('aralik-hatasi'); }
    if (!res.ok && res.status !== 206) throw new Error('http-' + res.status);
    if (res.status === 200 && have) { have = 0; fs.rmSync(partPath(id), { force: true }); } // sunucu Range'i yok saydı
    const out = fs.createWriteStream(partPath(id), { flags: have ? 'a' : 'w' });
    ctl.received = have;
    let last = 0;
    try {
      for await (const chunk of res.body) {
        if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
        ctl.received += chunk.length;
        const now = Date.now();
        if (now - last > 400) { last = now; emit({ id, received: ctl.received, total: m.size }); }
      }
    } finally {
      await new Promise((r) => out.end(r));
    }
    if (fs.statSync(partPath(id)).size !== m.size) throw new Error('boyut-uyusmuyor');
    fs.renameSync(partPath(id), finalPath(id));
    emit({ id, received: m.size, total: m.size, done: true });
    return { success: true };
  } catch (err) {
    const aborted = ctl.abort.signal.aborted;
    emit({ id, received: ctl.received, total: m.size, error: aborted ? 'cancelled' : 'failed' });
    return { success: false, error: aborted ? 'cancelled' : 'failed' };
  } finally {
    downloads.delete(id);
  }
}

// ---------- Sohbet (electron-ai.cjs çağırır) ----------
// Araç çağırma modelden bağımsız, istem tabanlı bir protokolle yapılır: model ```json {"name":..,"arguments":{..}} ``` yazar,
// biz ayrıştırıp çalıştırır, sonucu bir sonraki iletiyle geri veririz. (Küçük modellerde yerel fonksiyon çağırma güvenilir değil.)
const READ_ONLY = new Set(['list_dir', 'read_file', 'search_text']);
const TOOL_BLOCK = /```(?:json|tool_call|tool)?\s*\n?([\s\S]*?)```|<tool_call>([\s\S]*?)<\/tool_call>/i;

function parseToolCall(text, names) {
  const t = String(text || '').trim();
  const m = TOOL_BLOCK.exec(t);
  const candidate = (m ? (m[1] || m[2]) : t).trim();
  if (!candidate.startsWith('{')) return null;
  try {
    const o = JSON.parse(candidate);
    const name = o && (o.name || o.tool || o.function);
    const args = o && (o.arguments || o.parameters || o.input || o.args || {});
    if (typeof name === 'string' && names.includes(name) && args && typeof args === 'object') return { name, args };
  } catch { /* geçerli JSON değil: normal metin */ }
  return null;
}

const toolGuide = (tools) => [
  'ARAÇLAR: Bir araç gerekiyorsa YALNIZCA şu biçimde bir json kod bloğu yaz, başka hiçbir şey yazma:',
  '```json',
  '{"name": "<araç adı>", "arguments": { ... }}',
  '```',
  'Yolları çalışma klasörüne göre yaz (ör. "src/App.tsx", kök için "."); klasör adını başa ekleme.',
  'Araç sonucunu bir sonraki iletide alırsın. Görev bitince JSON YAZMA, kullanıcıya normal metinle yanıt ver.',
  'Araçlar:',
  ...tools.map((t) => `- ${t.name}(${Object.keys(t.input_schema.properties || {}).join(', ')}): ${t.description}`)
].join('\n');

async function runBuiltin({ modelId, system, history, prompt, tools, agent, runTool, emit, signal, maxTokens }) {
  const id = MODELS[modelId] ? modelId : DEFAULT_ID;
  if (!isInstalled(id)) throw new Error('model-yok');
  const model = await getModel(id);
  const { LlamaChatSession } = await getLib();
  const context = await model.createContext({ contextSize: { min: 2048, max: MODELS[id].ctx } });
  try {
    // Küçük (hızlı) model yazma/komut araçlarını güvenilir kullanamaz: yalnız okuma ve arama
    const allowed = MODELS[id].tier === 'fast' ? tools.filter((t) => READ_ONLY.has(t.name)) : tools;
    const names = allowed.map((t) => t.name);
    const sys = agent ? `${system}\n\n${toolGuide(allowed)}` : system;
    const session = new LlamaChatSession({ contextSequence: context.getSequence(), systemPrompt: sys });
    session.setChatHistory([
      { type: 'system', text: sys },
      ...history.map((m) => (m.role === 'assistant' ? { type: 'model', response: [m.text] } : { type: 'user', text: m.text }))
    ]);
    let next = prompt;
    const seen = new Set();
    let forced = false; // 'şimdi düz metinle yanıtla' talimatı verildi mi
    let lastOut = '';
    const maxSteps = MODELS[id].tier === 'fast' ? 6 : 20;
    for (let step = 0; step < (agent ? maxSteps + 2 : 1); step++) {
      // Çıktı '{', '`' veya '<' ile başlıyorsa araç çağrısı olabilir: bitene dek tamponla; değilse akıt.
      let buf = '';
      let streaming = !agent;
      const answer = await session.prompt(next, {
        maxTokens: Math.min(Math.max(Number(maxTokens) || 2048, 256), 4096),
        temperature: 0.3,
        signal,
        stopOnAbortSignal: true,
        onTextChunk: (text) => {
          buf += text;
          if (streaming) { emit({ type: 'text', text }); return; }
          const head = buf.trimStart();
          if (head && !/^[{`<]/.test(head)) { streaming = true; emit({ type: 'text', text: buf }); }
        }
      });
      if (signal.aborted) return;
      const call = agent ? parseToolCall(answer, names) : null;
      if (!call) {
        if (!streaming && buf) emit({ type: 'text', text: buf }); // tamponlanan ama araç olmayan metin
        return;
      }
      const sig = call.name + JSON.stringify(call.args);
      if (forced) {
        // Model yine de araç istiyor: elindeki son sonucu kullanıcıya göster ve bitir
        if (lastOut) emit({ type: 'text', text: lastOut.slice(0, 1500) });
        else emit({ type: 'error', error: 'agent-stuck' });
        return;
      }
      if (seen.has(sig) || step >= maxSteps) {
        forced = true;
        next = 'Yeterli bilgin var. Şimdi YALNIZCA normal metinle yanıt ver: araç çağırma, JSON yazma. Kullanıcının sorusunu bulduklarınla yanıtla.';
        continue;
      }
      seen.add(sig);
      const callId = `b${step + 1}`;
      emit({ type: 'tool', id: callId, name: call.name, input: call.name === 'write_file' ? { path: call.args.path, bytes: String(call.args.content || '').length } : call.args });
      let out; let ok = true;
      try { out = await runTool(call.name, call.args); } catch (err) { out = 'Hata: ' + err.message; ok = false; }
      emit({ type: 'tool_result', id: callId, ok, text: String(out).slice(0, 1500) });
      if (ok) lastOut = String(out);
      next = `Araç sonucu (${call.name}):\n${String(out).slice(0, 6000)}\n\nGörev bitti mi? Bittiyse kullanıcıya normal metinle yanıt ver (JSON yazma). Bitmediyse sıradaki aracı çağır.`;
    }
    emit({ type: 'text', text: '\n\n_(Adım sınırına ulaşıldı.)_' });
  } finally {
    try { await context.dispose(); } catch { /* kapalı */ }
    scheduleIdle();
  }
}

function register({ getWindow }) {
  const send = (channel, payload) => {
    const w = getWindow();
    if (w && !w.isDestroyed()) w.webContents.send(channel, payload);
  };

  ipcMain.handle('llm:status', () => ({
    defaultId: DEFAULT_ID,
    models: Object.entries(MODELS).map(([id, m]) => ({
      id, label: m.label, tier: m.tier, size: m.size, ramGb: m.ramGb,
      installed: isInstalled(id),
      downloading: downloads.has(id),
      received: downloads.has(id) ? downloads.get(id).received : 0
    }))
  }));

  ipcMain.handle('llm:download', (_e, id) => {
    if (typeof id !== 'string' || !MODELS[id]) return { success: false, error: 'unknown-model' };
    void download(id, (p) => send('llm:progress', p));
    return { success: true };
  });

  ipcMain.handle('llm:cancel', (_e, id) => {
    const d = downloads.get(String(id));
    if (d) d.abort.abort();
    return { success: true };
  });

  ipcMain.handle('llm:delete', async (_e, id) => {
    if (typeof id !== 'string' || !MODELS[id] || downloads.has(id)) return { success: false };
    if (loaded && loaded.id === id) await disposeModel();
    try { fs.rmSync(finalPath(id), { force: true }); fs.rmSync(partPath(id), { force: true }); return { success: true }; } catch { return { success: false }; }
  });

  app.on('before-quit', () => { void disposeModel(); });
}

module.exports = { register, runBuiltin, parseToolCall, MODELS, DEFAULT_ID, isInstalled };
