# Proje durumu (otomatik üretilir)

> Bu dosya `scripts/brain.mjs` tarafından koddan üretilir; **elle düzenleme**. Yenilemek için `npm run brain`. Bkz. [[BRAIN]].

## Sürümler
- Uygulama: **1.2.0**
- Electron ^45.2.1 · React ^19.3.1 · Vite ^8.3.5 · TypeScript ~7.0.2 · Tailwind ^4.3.4
- Monaco: `@monaco-editor/react` ^4.7.0, `monaco-editor` ^0.57.0
- GitHub OAuth Client ID tanımlı: evet

## npm betikleri
| Betik | Komut |
|---|---|
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `electron:dev` | `concurrently -k "cross-env BROWSER=none vite" "wait-on tcp:5173 && cross-env NODE_ENV=development electron ."` |
| `electron:build` | `vite build && electron-builder` |
| `sync:server` | `node server/sync-server.mjs` |
| `test` | `node scripts/tests/git.test.cjs && node scripts/tests/sync.test.cjs` |
| `brain` | `node scripts/brain.mjs` |
| `brain:check` | `node scripts/brain.mjs --check` |

## Dosya haritası
### Ana süreç ve preload
| Dosya | Satır |
|---|---|
| `electron-git.cjs` | 214 |
| `electron-github.cjs` | 329 |
| `electron-main.cjs` | 562 |
| `electron-preload.cjs` | 85 |
| `electron-secrets.cjs` | 46 |

### Arayüz kabuğu
| Dosya | Satır |
|---|---|
| `src/App.tsx` | 926 |
| `src/main.tsx` | 21 |
| `src/types.ts` | 164 |

### Bileşenler
| Dosya | Satır |
|---|---|
| `src/components/AIAssistant.tsx` | 157 |
| `src/components/EditorArea.tsx` | 319 |
| `src/components/FileTree.tsx` | 244 |
| `src/components/GitPanel.tsx` | 608 |
| `src/components/GithubAccount.tsx` | 132 |
| `src/components/LandingPage.tsx` | 135 |
| `src/components/Logo.tsx` | 34 |
| `src/components/Preview.tsx` | 97 |
| `src/components/ResizeHandle.tsx` | 64 |
| `src/components/SettingsPage.tsx` | 573 |
| `src/components/SnippetsPanel.tsx` | 97 |
| `src/components/SplashScreen.tsx` | 38 |
| `src/components/Terminal.tsx` | 287 |

### Servisler
| Dosya | Satır |
|---|---|
| `src/services/SettingsContext.tsx` | 137 |
| `src/services/editorTheme.ts` | 96 |
| `src/services/monacoShim.ts` | 28 |
| `src/services/settings.ts` | 271 |
| `src/services/snippetProvider.ts` | 58 |
| `src/services/terminalText.ts` | 148 |
| `src/services/useCollabToken.ts` | 67 |
| `src/services/useGithubAuth.ts` | 32 |

### i18n
| Dosya | Satır |
|---|---|
| `src/i18n/uiText.ts` | 862 |

### Betikler
| Dosya | Satır |
|---|---|
| `scripts/auto-commit.mjs` | 116 |
| `scripts/brain.mjs` | 294 |
| `scripts/bump-version.mjs` | 130 |
| `scripts/check-bundle.mjs` | 31 |
| `scripts/check-hygiene.mjs` | 75 |
| `scripts/make-icons.cjs` | 29 |

### Testler
| Dosya | Satır |
|---|---|
| `scripts/tests/git.test.cjs` | 84 |
| `scripts/tests/sync.test.cjs` | 58 |

### Sunucu
| Dosya | Satır |
|---|---|
| `server/sync-server.mjs` | 144 |

## IPC kanalları
| Grup | Kanallar |
|---|---|
| app | `app:quit` |
| dialog | `dialog:openFiles`, `dialog:openFolder` |
| fs | `fs:createFile`, `fs:createFolder`, `fs:deleteItem`, `fs:readDir`, `fs:readFile`, `fs:renameItem`, `fs:writeFile` |
| git | `git:branches`, `git:checkout`, `git:commit`, `git:createBranch`, `git:discard`, `git:fetch`, `git:init`, `git:log`, `git:pull`, `git:push`, `git:stage`, `git:stageAll`, `git:status`, `git:sync`, `git:unstage` |
| github | `github:cancel`, `github:createPr`, `github:login`, `github:logout`, `github:openExternal`, `github:publishRepo`, `github:repoInfo`, `github:status` |
| secrets | `secrets:get`, `secrets:set` |
| term | `term:input`, `term:start`, `term:stop` |
| ui | `ui:setTheme` |
| workspace | `workspace:open`, `workspace:recent` |

**Olaylar (ana süreç → arayüz):** `fs:watch-change`, `git:changed`, `github:auth`, `term:cwd`, `term:exit`, `term:output`

## i18n
- 269 anahtar; her biri 8 dilde (tr, en, de, ru, ar, es, fr, az) dolu olmalı. Denetim: `npm run brain:check`.

## Ayarlar
55 ayar, 9 kategori. Tek kaynak: `src/services/settingsSchema.json`. Ekleme kuralı: [[settings]].

| Kategori | Kimlik | Ad (tr) | Tür | Varsayılan | Aralık / seçenekler |
|---|---|---|---|---|---|
| Görünüm | `themeMode` | Tema modu | select | `"dark"` | dark, light, system |
| Görünüm | `accent` | Vurgu rengi | accent | `"indigo"` | indigo, blue, teal, green, orange, pink |
| Görünüm | `uiFont` | Arayüz yazı tipi | select | `"system"` | system, segoe, arial, verdana, tahoma, mono |
| Görünüm | `uiZoom` | Arayüz yakınlaştırma | slider | `100` | 80–150 % |
| Görünüm | `animations` | Animasyonlar | toggle | `true` |  |
| Görünüm | `language` | Dil | select | `"auto"` | auto, tr, en, de, ru, ar, es, fr, az |
| Editör | `editorTheme` | Editör teması | select | `"auto"` | auto, nova-dark, nova-light, vs-dark, vs, hc-black |
| Editör | `fontFamily` | Kod yazı tipi | select | `"cascadia"` | cascadia, fira, jetbrains, consolas, courier, monospace, custom |
| Editör | `fontFamilyCustom` | Özel yazı tipi | text | `""` | ≤120 karakter |
| Editör | `fontSize` | Yazı boyutu | slider | `14` | 10–32 px |
| Editör | `lineHeight` | Satır yüksekliği | slider | `0` | 0–2.4 |
| Editör | `fontWeight` | Yazı kalınlığı | select | `"normal"` | normal, 300, 400, 500, 600, bold |
| Editör | `letterSpacing` | Harf aralığı | slider | `0` | -1–4 px |
| Editör | `fontLigatures` | Yazı tipi ligatürleri | toggle | `true` |  |
| Editör | `tabSize` | Sekme boşluğu | select | `2` | 2, 3, 4, 8 |
| Editör | `insertSpaces` | Sekme yerine boşluk kullan | toggle | `true` |  |
| Editör | `wordWrap` | Satır kaydırma | select | `"off"` | off, on, bounded |
| Editör | `lineNumbers` | Satır numaraları | select | `"on"` | on, off, relative |
| Editör | `minimap` | Mini harita | toggle | `true` |  |
| Editör | `renderWhitespace` | Boşlukları göster | select | `"selection"` | none, boundary, selection, trailing, all |
| Editör | `cursorStyle` | İmleç stili | select | `"line"` | line, block, underline, line-thin, block-outline, underline-thin |
| Editör | `cursorBlinking` | İmleç yanıp sönmesi | select | `"smooth"` | blink, smooth, phase, expand, solid |
| Editör | `smoothCaret` | Yumuşak imleç animasyonu | toggle | `true` |  |
| Editör | `smoothScrolling` | Yumuşak kaydırma | toggle | `true` |  |
| Editör | `bracketColorization` | Parantez çiftlerini renklendir | toggle | `true` |  |
| Editör | `indentGuides` | Girinti kılavuzları | toggle | `true` |  |
| Editör | `renderLineHighlight` | Etkin satırı vurgula | select | `"all"` | none, gutter, line, all |
| Editör | `folding` | Kod katlama | toggle | `true` |  |
| Editör | `stickyScroll` | Yapışkan kaydırma (üstte bağlam) | toggle | `false` |  |
| Editör | `scrollBeyondLastLine` | Son satırın ötesine kaydır | toggle | `false` |  |
| Editör | `formatOnPaste` | Yapıştırırken biçimlendir | toggle | `true` |  |
| Editör | `formatOnType` | Yazarken biçimlendir | toggle | `false` |  |
| Editör | `autoClosingBrackets` | Parantezleri otomatik kapat | select | `"languageDefined"` | languageDefined, always, beforeWhitespace, never |
| Editör | `quickSuggestions` | Yazarken öneri göster | toggle | `true` |  |
| Editör | `suggestOnTriggerCharacters` | Tetikleyici karakterlerde öner | toggle | `true` |  |
| Editör | `parameterHints` | Parametre ipuçları | toggle | `true` |  |
| Editör | `hover` | Üzerine gelince bilgi | toggle | `true` |  |
| Editör | `rulers` | Cetvel sütunları | text | `""` | ≤40 karakter |
| Snippet ve tamamlama | `defaultSnippetsInEditor` | Hazır snippet'leri otomatik tamamlamada göster | toggle | `true` |  |
| Snippet ve tamamlama | `snippetSuggestions` | Snippet önerilerinin konumu | select | `"inline"` | top, inline, bottom, none |
| Dosyalar ve kayıt | `autoSave` | Otomatik kaydet | select | `"off"` | off, afterDelay, onFocusChange |
| Dosyalar ve kayıt | `autoSaveDelay` | Otomatik kayıt gecikmesi | slider | `1000` | 500–5000 ms |
| Dosyalar ve kayıt | `trimTrailingWhitespace` | Kayıtta satır sonu boşluklarını sil | toggle | `false` |  |
| Dosyalar ve kayıt | `insertFinalNewline` | Kayıtta sona boş satır ekle | toggle | `false` |  |
| Dosyalar ve kayıt | `welcomeOnStartup` | Açılışta karşılama sayfasını göster | toggle | `true` |  |
| Dosyalar ve kayıt | `showGitDecorations` | Dosya ağacında Git durumunu göster | toggle | `true` |  |
| Terminal | `terminalFontSize` | Terminal yazı boyutu | slider | `12` | 10–20 px |
| Terminal | `defaultShell` | Varsayılan kabuk | select | `"powershell"` | powershell, cmd |
| Terminal | `terminalColorInput` | Komutları renklendir | toggle | `true` |  |
| Terminal | `terminalShowBranch` | İstemde Git dalını göster | toggle | `true` |  |
| Git ve GitHub | `gitAutoFetch` | Uzak değişiklikleri otomatik getir (fetch) | toggle | `true` |  |
| Git ve GitHub | `gitStatusInterval` | Git durumu yenileme aralığı | select | `8` | 5, 8, 15, 30, 60 |
| Git ve GitHub | `gitFetchInterval` | Otomatik fetch aralığı | select | `60` | 30, 60, 120, 300 |
| Ortak düzenleme | `collabEnabled` | Ortak düzenlemeyi aç | toggle | `false` |  |
| Ortak düzenleme | `collabUrl` | Sunucu adresi | text | `""` | ≤200 karakter |

## GitHub Actions
| Dosya | Ad | İşler |
|---|---|---|
| `.github/workflows/ci-cd.yml` | CI/CD - Kalite, Güvenlik, Sürüm, Masaüstü Release | `quality` (Kalite, Güvenlik ve Performans), `version` (Otomatik Sürümleme), `release-desktop` (Windows Kurulum (.exe) ve Release) |
| `.github/workflows/security.yml` | Güvenlik Taraması | `codeql` (CodeQL), `secrets` (Gizli anahtar taraması (gitleaks)), `dependency-review` (Bağımlılık incelemesi), `audit-weekly` (Haftalık npm audit) |

## Md haritası
| Ad | Yol | Amaç |
|---|---|---|
| [[AGENT]] | `AGENT.md` | AGENT.md — NovaCode Studio ajan sözleşmesi |
| [[CHANGELOG]] | `CHANGELOG.md` | Changelog |
| [[CLAUDE]] | `CLAUDE.md` | NovaCode Studio |
| [[brain-maintenance]] | `docs/brain/actions/brain-maintenance.md` | Proje beynini (docs/brain) güncel ve tutarlı tutmak |
| [[ci-cd]] | `docs/brain/actions/ci-cd.md` | GitHub Actions, audit, bundle bütçesi ve yayın hattı |
| [[git-github]] | `docs/brain/actions/git-github.md` | Git paneli, GitHub hesabı bağlama, PR, eşzamanlama ve canlı takip |
| [[i18n]] | `docs/brain/actions/i18n.md` | Arayüze metin eklemek (8 dil zorunlu) |
| [[release]] | `docs/brain/actions/release.md` | Değişiklikleri commitle, sürümü belirle, push et, CI'yı izle |
| [[security-kvkk]] | `docs/brain/actions/security-kvkk.md` | IPC, dosya sistemi, token ve kişisel veriye dokunan her değişikliğin güvenlik ve KVKK kapısı |
| [[settings]] | `docs/brain/actions/settings.md` | Ayarlar sistemi: yeni ayar eklemek, tema/yazı tipi/editör/snippet davranışları, kalıcılık ve gizli değerler |
| [[terminal]] | `docs/brain/actions/terminal.md` | Entegre terminal (PowerShell/CMD) davranışı, istem ve renklendirme |
| [[testing]] | `docs/brain/actions/testing.md` | Değişikliği doğrulamak: tip, derleme, birim ve entegrasyon testleri, uygulamayı çalıştırma |
| [[ui-design]] | `docs/brain/actions/ui-design.md` | Arayüz, tema, logo ve animasyon değişiklikleri |
| [[BRAIN]] | `docs/brain/BRAIN.md` | NovaCode Studio — Proje Beyni |
| [[DECISIONS]] | `docs/brain/DECISIONS.md` | Karar günlüğü |
| [[PROJECT]] | `docs/brain/PROJECT.md` | Proje: NovaCode Studio |
| [[STATE]] | `docs/brain/STATE.md` | Proje durumu (otomatik üretilir) |
| [[README]] | `README.md` | NovaCode Studio |
| [[SECURITY]] | `SECURITY.md` | Güvenlik Politikası / Security Policy |

