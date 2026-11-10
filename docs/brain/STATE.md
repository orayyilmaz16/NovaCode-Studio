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
| `electron-main.cjs` | 541 |
| `electron-preload.cjs` | 75 |

### Arayüz kabuğu
| Dosya | Satır |
|---|---|
| `src/App.tsx` | 943 |
| `src/main.tsx` | 18 |
| `src/types.ts` | 158 |

### Bileşenler
| Dosya | Satır |
|---|---|
| `src/components/AIAssistant.tsx` | 157 |
| `src/components/EditorArea.tsx` | 327 |
| `src/components/FileTree.tsx` | 244 |
| `src/components/GitPanel.tsx` | 603 |
| `src/components/GithubAccount.tsx` | 132 |
| `src/components/LandingPage.tsx` | 135 |
| `src/components/Logo.tsx` | 34 |
| `src/components/Preview.tsx` | 97 |
| `src/components/ResizeHandle.tsx` | 64 |
| `src/components/SnippetsPanel.tsx` | 95 |
| `src/components/SplashScreen.tsx` | 38 |
| `src/components/Terminal.tsx` | 277 |

### Servisler
| Dosya | Satır |
|---|---|
| `src/services/editorTheme.ts` | 53 |
| `src/services/monacoShim.ts` | 28 |
| `src/services/terminalText.ts` | 142 |
| `src/services/useGithubAuth.ts` | 32 |

### i18n
| Dosya | Satır |
|---|---|
| `src/i18n/uiText.ts` | 421 |

### Betikler
| Dosya | Satır |
|---|---|
| `scripts/auto-commit.mjs` | 116 |
| `scripts/brain.mjs` | 247 |
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
| term | `term:input`, `term:start`, `term:stop` |
| workspace | `workspace:open`, `workspace:recent` |

**Olaylar (ana süreç → arayüz):** `fs:watch-change`, `git:changed`, `github:auth`, `term:cwd`, `term:exit`, `term:output`

## i18n
- 125 anahtar; her biri 8 dilde (tr, en, de, ru, ar, es, fr, az) dolu olmalı. Denetim: `npm run brain:check`.

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
| [[terminal]] | `docs/brain/actions/terminal.md` | Entegre terminal (PowerShell/CMD) davranışı, istem ve renklendirme |
| [[testing]] | `docs/brain/actions/testing.md` | Değişikliği doğrulamak: tip, derleme, birim ve entegrasyon testleri, uygulamayı çalıştırma |
| [[ui-design]] | `docs/brain/actions/ui-design.md` | Arayüz, tema, logo ve animasyon değişiklikleri |
| [[BRAIN]] | `docs/brain/BRAIN.md` | NovaCode Studio — Proje Beyni |
| [[DECISIONS]] | `docs/brain/DECISIONS.md` | Karar günlüğü |
| [[PROJECT]] | `docs/brain/PROJECT.md` | Proje: NovaCode Studio |
| [[STATE]] | `docs/brain/STATE.md` | Proje durumu (otomatik üretilir) |
| [[README]] | `README.md` | 🚀 NovaCode Studio - Modern Masaüstü & Web Tabanlı IDE |
| [[SECURITY]] | `SECURITY.md` | Güvenlik Politikası / Security Policy |

