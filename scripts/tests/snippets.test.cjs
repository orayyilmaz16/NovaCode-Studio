// Kullanıcı snippet'leri doğrulama testleri (electron-snippets.cjs: parseSnippets).
// Çalıştırma: node scripts/tests/snippets.test.cjs
const path = require('path');
const { parseSnippets, MAX_BYTES, MAX_SNIPPETS } = require(path.join(__dirname, '..', '..', 'electron-snippets.cjs'));
const ok = (c, m) => { if (!c) process.exitCode = 1; console.log(c ? 'ok  ' : 'FAIL', m); };

let r = parseSnippets('{"Log":{"prefix":"clg","body":["console.log($1);","$0"],"description":"d","language":"JS"}}');
ok(r.errors.length === 0 && r.snippets.length === 1, 'geçerli snippet kabul edilir');
ok(r.snippets[0].body === 'console.log($1);\n$0' && r.snippets[0].language === 'js' && r.snippets[0].prefix[0] === 'clg', 'gövde birleşir, dil küçülür');
r = parseSnippets('{"A":{"prefix":["a","b"],"body":"x"}}');
ok(r.snippets[0].prefix.length === 2, 'prefix dizisi');
ok(parseSnippets('').snippets.length === 0 && parseSnippets('  ').errors.length === 0, 'boş metin hata değil');
ok(parseSnippets('{bozuk').errors[0] === 'invalid-json', 'bozuk JSON');
ok(parseSnippets('[]').errors[0] === 'not-object', 'nesne olmayan kök');
ok(parseSnippets('{"A":{"prefix":"a b","body":"x"}}').errors.length === 1, 'boşluklu prefix reddedilir');
ok(parseSnippets('{"A":{"prefix":"a"}}').errors.length === 1, 'gövdesiz snippet reddedilir');
ok(parseSnippets('{"A":{"prefix":"a","body":[1]}}').errors.length === 1, 'dize olmayan gövde satırı reddedilir');
ok(parseSnippets('{"A":{"prefix":"a","body":"x","language":"a b!"}}').errors.length === 1, 'geçersiz dil reddedilir');
ok(parseSnippets('x'.repeat(MAX_BYTES + 1)).errors[0] === 'too-large', 'boyut sınırı');
const many = {}; for (let i = 0; i < MAX_SNIPPETS + 5; i++) many['s' + i] = { prefix: 'p' + i, body: 'x' };
ok(parseSnippets(JSON.stringify(many)).errors.includes('too-many'), 'adet sınırı');
ok(parseSnippets('{"__proto__":{"prefix":"a","body":"x"}}').snippets.length === 0, '__proto__ adı reddedilir');
