// AI tamamlama öneri şekillendirme testleri (dil kuralları: girinti, kapsam sonu, çakışan kapanışlar, biçim).
// Çalıştırma: node scripts/tests/completion-shape.test.cjs
const fs = require('fs');
const path = require('path');

let fails = 0;
const ok = (c, m, extra) => { if (!c) { fails++; process.exitCode = 1; } console.log(c ? 'ok  ' : 'FAIL', m, c ? '' : (extra || '')); };

(async () => {
  // TypeScript 7'nin JS API'si yok: modül, projedeki Vite'ın dönüştürücüsüyle (oxc) JS'e çevrilip yüklenir.
  const file = path.join(__dirname, '..', '..', 'src', 'services', 'completionShape.ts');
  const { transformWithOxc } = await import('vite');
  const out = await transformWithOxc(fs.readFileSync(file, 'utf8'), file, { lang: 'ts' });
  const m = await import('data:text/javascript;base64,' + Buffer.from(out.code).toString('base64'));
  const { shapeSuggestion, normalizeIndent, cutAtScopeEnd, cutAtDedent, trimSuffixOverlap, indentWidth } = m;
  const eq = (a, b, msg) => ok(a === b, msg, `\n   beklenen: ${JSON.stringify(b)}\n   gelen   : ${JSON.stringify(a)}`);

  // 1) Girinti: editörün ayarına çevrilir (ilk satır dokunulmaz)
  eq(normalizeIndent('x\n\ty\n\t\tz', 4, true), 'x\n    y\n        z', 'sekme → boşluk (insertSpaces=true)');
  eq(normalizeIndent('x\n    y\n        z\n  w', 4, false), 'x\n\ty\n\t\tz\n  w', 'boşluk → sekme (insertSpaces=false), kalan boşluk korunur');
  eq(normalizeIndent('\tilk\n\tikinci', 2, true), '\tilk\n  ikinci', 'ilk satır (imleçten devam) değişmez');
  eq(indentWidth('\t  x', 4), 6, 'girinti genişliği: sekme=tabSize');

  // 2) Süslü parantez dilleri: kapsam kapanınca biter, dize içindeki parantez sayılmaz
  eq(cutAtScopeEnd('return a;\n}\n\nfunction b() {\n  return 1;\n}'), 'return a;\n}', 'kapsam kapanınca sonraki fonksiyona taşmaz');
  eq(cutAtScopeEnd('foo(a, b);\nbar();'), 'foo(a, b);\nbar();', 'dengeli kodda kesme yok');
  eq(cutAtScopeEnd('log(")");\nnext();'), 'log(")");\nnext();', 'dize içindeki ")" kapsamı kapatmaz');
  eq(cutAtScopeEnd("let a = 'x';\n});\nmore()"), "let a = 'x';\n});", '`});` satırı dahil kesilir');
  eq(cutAtScopeEnd("fn f<'a>(x: &'a str) {\n  x\n}\nfn g() {}", 'rust'), "fn f<'a>(x: &'a str) {\n  x\n}\nfn g() {}", "Rust ömrü 'a dize sayılmaz: dengeli kod kesilmez");
  eq(cutAtScopeEnd("fn f<'a>(x: &'a str) {\n  x\n}\n}\nextra", 'rust'), "fn f<'a>(x: &'a str) {\n  x\n}\n}", "Rust ömrü 'a varken de eşsiz '}' doğru yerde kesilir");
  eq(cutAtScopeEnd("let c = '}';\nlet d = 1;\n}\nextra", 'rust'), "let c = '}';\nlet d = 1;\n}", 'Rust: karakter sabiti \'}\' kapsamı kapatmaz');
  eq(cutAtScopeEnd("const s = '}';\nrun();\n}\nextra", 'javascript'), "const s = '}';\nrun();\n}", "JS: tek tırnaklı dizedeki '}' sayılmaz");
  eq(cutAtScopeEnd('const t = `a ${x} }`;\nrun();\n}\nextra', 'typescript'), 'const t = `a ${x} }`;\nrun();\n}', 'TS: şablon dizesindeki parantezler sayılmaz');

  // 3) Girinti dilleri (Python): imleç satırının girintisinin altına inince biter
  eq(cutAtDedent('return n % 2 == 0\n\ndef main():\n    pass', 4, 4), 'return n % 2 == 0\n', 'Python: dedent (üst kapsam) öncesinde kesilir');
  eq(cutAtDedent('x = 1\n    y = 2', 4, 4), 'x = 1\n    y = 2', 'aynı/derin girinti korunur');

  // 4) Sonraki kodla çakışan kapanışlar kırpılır
  eq(trimSuffixOverlap('a, b)', ')', ''), 'a, b', 'satır ortası: imleçten sonra ")" varsa tekrar edilmez');
  eq(trimSuffixOverlap('merhaba"', '"', ''), 'merhaba', 'satır ortası: kapanmamış tırnak, imleçten sonraki tırnakla tekrar edilmez');
  eq(trimSuffixOverlap('"merhaba"', '"', ''), '"merhaba"', 'kendi içinde kapanmış tırnak çifti kırpılmaz');
  eq(trimSuffixOverlap('x + 1', ')', ''), 'x + 1', 'kapanışla bitmeyen öneri değişmez');
  eq(trimSuffixOverlap('reduce((a, b) => a + b, 0);', ');', ''), 'reduce((a, b) => a + b, 0);', 'önerinin KENDİ eşli ")" parantezi kırpılmaz (eşsiz kapanış yok)');
  eq(trimSuffixOverlap('f(a), b)', ')', ''), 'f(a), b', 'yalnız eşsiz (dıştaki) ")" kırpılır');
  eq(trimSuffixOverlap('"a" + "b"', '"', ''), '"a" + "b"', 'kapanmış tırnaklar (çift sayıda) kırpılmaz');
  eq(trimSuffixOverlap('return 1;\n}', '', '}'), 'return 1;', 'satır sonu: sonraki satır zaten "}" ise son "}" atılır');
  eq(trimSuffixOverlap('return 1;\n}', '', 'x()'), 'return 1;\n}', 'sonraki satır farklıysa "}" korunur (kapsamı kapatıyor)');

  // 5) Uçtan uca şekillendirme
  const js = { languageId: 'javascript', tabSize: 2, insertSpaces: true, baseIndent: 2, nextLine: '}' };
  eq(shapeSuggestion('return a + b;\n}', 'block', '', js), 'return a + b;', 'JS: fazladan "}" tekrar edilmez');
  eq(shapeSuggestion('x();\n}\n\nfunction y() {}', 'long', '', { ...js, nextLine: '' }), 'x();\n}', 'JS: uzun modda bile sonraki fonksiyona taşmaz');
  eq(shapeSuggestion('reduce((a, b) => a + b, 0);\nconsole.log(1);', 'block', ');', js), 'reduce((a, b) => a + b, 0);', 'satır ortası: yalnız ilk satır');
  eq(shapeSuggestion('```js\nconst a = 1;\n```', 'block', '', js), 'const a = 1;', 'kod çiti temizlenir');
  eq(shapeSuggestion('\n  return 1;\n}', 'line', '', { ...js, nextLine: '' }), '\n  return 1;', 'tek satır modu: yeni satırda başlayan öneriyi bir satırla sınırlar');
  eq(shapeSuggestion('a();\n\nb();', 'block', '', { languageId: 'plaintext' }), 'a();', 'blok: ilk boş satırda biter');
  const py = { languageId: 'python', tabSize: 4, insertSpaces: true, baseIndent: 4, nextLine: '' };
  eq(shapeSuggestion('return n % 2 == 0\ndef main():\n    pass', 'long', '', py), 'return n % 2 == 0', 'Python: dedent sonrası kesilir');
  eq(shapeSuggestion('if x:\n\treturn 1', 'block', '', { ...py, baseIndent: 0 }), 'if x:\n    return 1', 'Python: model sekme verdiyse editörün boşluk ayarına çevrilir');
  eq(shapeSuggestion('fmt.Println("a")\n}\n```', 'block', '', { languageId: 'go', tabSize: 4, insertSpaces: false, baseIndent: 4, nextLine: '}' }), 'fmt.Println("a")', 'Go: kod çiti ve kapanış temizlenir');
  eq(shapeSuggestion('   \n  ', 'block', '', js), '', 'boşluk önerisi boş döner');

  // 6) Token sınırında kesilen yanıt: çok satırlıda yarım son satır atılır, tek satırlıda korunur
  eq(shapeSuggestion('const a = 1;\nconst b = foo(', 'block', '', { ...js, truncated: true }), 'const a = 1;', 'kesilmiş çok satırlı öneri: yarım son satır atılır');
  eq(shapeSuggestion('const b = foo(x, y', 'block', '', { ...js, truncated: true }), 'const b = foo(x, y', 'kesilmiş tek satırlı öneri korunur (atılacak tam satır yok)');
  eq(shapeSuggestion('const a = 1;\nconst b = 2;', 'block', '', { ...js, truncated: false }), 'const a = 1;\nconst b = 2;', 'kesilmemiş öneride satır atılmaz');

  console.log(fails ? `\n${fails} test başarısız` : '\ntüm testler geçti');
})();
