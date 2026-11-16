const fs = require('fs');
const path = require('path');

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m); };
const cfg = { delay: 450, cooldown: 600 };
const T = 1_000_000;

// TypeScript 7'nin JS API'si yok: modül, projedeki Vite'ın dönüştürücüsüyle (oxc) JS'e çevrilip yüklenir.
(async () => {
  const file = path.join(__dirname, '..', '..', 'src', 'services', 'completionSchedule.ts');
  const { transformWithOxc } = await import('vite');
  const out = await transformWithOxc(fs.readFileSync(file, 'utf8'), file, { lang: 'ts' });
  const mod = await import('data:text/javascript;base64,' + Buffer.from(out.code).toString('base64'));
  const { planRequest, onOutcome, newScheduleState, effectiveDelay, failBackoff, clearBackoff, WASTED_DECAY_MS } = mod;

  // 1) İlk istek: yalnız gecikme beklenir
  let st = newScheduleState();
  ok(planRequest(T, st, cfg).wait === 450 && !planRequest(T, st, cfg).skip, 'ilk istek: gecikme (450 ms) kadar bekler');

  // 2) Soğuma: istek az önce bitti, gecikmeden uzunsa soğuma kazanır
  st = onOutcome(st, 'ok', T);
  ok(planRequest(T + 100, st, cfg).wait === 500, 'soğuma: 600 ms - 100 ms = 500 ms (gecikmeden büyük)');
  ok(planRequest(T + 600, st, cfg).wait === 450, 'soğuma geçince yalnız gecikme kalır');
  ok(planRequest(T, st, { delay: 450, cooldown: 0 }).wait === 450, 'soğuma 0 ise kapalı');

  // 3) Uyum: boşa giden istekler gecikmeyi uzatır, öneri gelince sıfırlanır
  ok(effectiveDelay(400, 0) === 400 && effectiveDelay(400, 2) === 520 && effectiveDelay(400, 99) === 800, 'gecikme çarpanı 1 → 1,3 → üst sınır 2');
  let w = newScheduleState();
  w = onOutcome(w, 'wasted', T); w = onOutcome(w, 'wasted', T + 1000);
  ok(w.wasted === 2 && planRequest(T + 2000, w, { delay: 450, cooldown: 0 }).wait === 585, '2 boşa giden istek: 450 → 585 ms');
  ok(onOutcome(w, 'ok', T + 3000).wasted === 0, 'öneri gelince boşa giden sayacı sıfırlanır');
  ok(planRequest(T + 1000 + WASTED_DECAY_MS + 1, w, { delay: 450, cooldown: 0 }).wait === 450, '30 sn sonra eski boşa gidenler sayılmaz');
  ok(onOutcome(w, 'wasted', T + 1000 + WASTED_DECAY_MS + 1).wasted === 1, 'eski seri üstüne eklenmez, yeniden başlar');

  // 4) Zaman aşımı hata sayılmaz, duraklatmaz
  let t = onOutcome(newScheduleState(), 'timeout', T);
  ok(t.fails === 0 && t.blockedUntil === 0 && !planRequest(T + 1, t, cfg).skip, 'zaman aşımı: hata sayılmaz, duraklatmaz');

  // 5) Hata geri çekilmesi: 3 sn, 10 sn, 30 sn, 60 sn; otomatik atlanır
  ok(failBackoff(1) === 3000 && failBackoff(2) === 10000 && failBackoff(3) === 30000 && failBackoff(4) === 60000 && failBackoff(0) === 0, 'geri çekilme basamakları');
  let f = onOutcome(newScheduleState(), 'fail', T);
  ok(planRequest(T + 2999, f, cfg).skip && !planRequest(T + 3000, f, cfg).skip, 'ilk hata: 3 sn atlanır, sonra tekrar dener');
  f = onOutcome(f, 'fail', T + 3000);
  ok(f.fails === 2 && planRequest(T + 12999, f, cfg).skip && !planRequest(T + 13000, f, cfg).skip, 'ikinci hata: 10 sn');
  ok(onOutcome(f, 'ok', T + 20000).fails === 0 && onOutcome(f, 'ok', T + 20000).blockedUntil === 0, 'başarıda geri çekilme sıfırlanır');
  ok(!planRequest(T + 5000, clearBackoff(f), cfg).skip, 'ısıtma başarılı: geri çekilme kalkar (Ollama geri geldi)');

  // 6) Gecikme, soğuma bittikten sonra bile her zaman en az `delay` (son tuştan sessizlik)
  ok(planRequest(T + 10_000, st, cfg).wait === 450, 'uzun bekleyişten sonra da debounce korunur');

  console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
})();
