# Proje durumu (otomatik üretilir)

> Bu dosya `scripts/brain.mjs` tarafından koddan üretilir; **elle düzenleme**. Yenilemek için `npm run brain`. Bkz. [[BRAIN]].

## Sürümler
- Uygulama: **1.9.4**
- Electron ^45.5.0 · React ^19.3.1 · Vite ^8.4.0 · TypeScript ~7.0.2 · Tailwind ^4.3.5
- Monaco: `@monaco-editor/react` ^4.7.0, `monaco-editor` ^0.58.0
- GitHub OAuth Client ID tanımlı: evet

## npm betikleri
| Betik | Komut |
|---|---|
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `electron:dev` | `concurrently -k "cross-env BROWSER=none vite" "wait-on tcp:5173 && cross-env NODE_ENV=development electron ."` |
| `electron:build` | `vite build && electron-builder --publish never` |
| `electron:build:mac` | `vite build && electron-builder --mac --publish never` |
| `electron:build:linux` | `vite build && electron-builder --linux --publish never` |
| `sync:server` | `node server/sync-server.mjs` |
| `analytics:server` | `node server/analytics-server.mjs` |
| `analytics:report` | `node scripts/analytics-report.mjs` |
| `test` | `node scripts/tests/git.test.cjs && node scripts/tests/sync.test.cjs && node scripts/tests/term.test.cjs && node scripts/tests/textbuffer.test.cjs && node scripts/tests/debug.test.cjs && node scripts/tests/pty.test.cjs && node scripts/tests/lsp.test.cjs && node scripts/tests/ai-tools.test.cjs && node scripts/tests/ai-complete.test.cjs && node scripts/tests/completion-schedule.test.cjs && node scripts/tests/completion-shape.test.cjs && node scripts/tests/settings-migrate.test.cjs && node scripts/tests/palettes.test.cjs && node scripts/tests/release.test.cjs && node scripts/tests/paths.test.cjs && node scripts/tests/ai-security.test.cjs && node scripts/tests/syncserver.test.cjs && node scripts/tests/services.test.cjs && node scripts/tests/i18n.test.cjs && node scripts/tests/electron-misc.test.cjs && node scripts/tests/replace.test.cjs && node scripts/tests/trust.test.cjs && node scripts/tests/preview-csp.test.cjs && node scripts/tests/history.test.cjs && node scripts/tests/snippets.test.cjs && node scripts/tests/keybindings.test.cjs && node scripts/tests/search-redos.test.cjs && node scripts/tests/ssh.test.cjs && node scripts/tests/ssh-sftp.test.cjs && node scripts/tests/deps.test.cjs && node scripts/tests/analytics.test.cjs && node scripts/tests/autocommit.test.cjs` |
| `brain` | `node scripts/brain.mjs` |
| `brain:check` | `node scripts/brain.mjs --check` |
| `audit` | `node scripts/audit-scan.mjs` |
| `audit:check` | `node scripts/audit-scan.mjs --check` |
| `health` | `node scripts/health-monitor.mjs` |
| `version:check` | `node scripts/check-version.mjs` |
| `sync` | `node scripts/auto-commit.mjs` |
| `icons:gen` | `node scripts/gen-file-icons.mjs` |

## Dosya haritası
### Ana süreç ve preload
| Dosya | Satır |
|---|---|
| `electron-ai.cjs` | 995 |
| `electron-analytics.cjs` | 152 |
| `electron-debug.cjs` | 240 |
| `electron-ext.cjs` | 341 |
| `electron-git.cjs` | 450 |
| `electron-github.cjs` | 343 |
| `electron-gitignore.cjs` | 65 |
| `electron-history.cjs` | 171 |
| `electron-lsp.cjs` | 301 |
| `electron-main.cjs` | 852 |
| `electron-paths.cjs` | 134 |
| `electron-preload.cjs` | 291 |
| `electron-preview.cjs` | 78 |
| `electron-pty.cjs` | 237 |
| `electron-search.cjs` | 289 |
| `electron-secrets.cjs` | 66 |
| `electron-snippets.cjs` | 106 |
| `electron-ssh-core.cjs` | 136 |
| `electron-ssh.cjs` | 471 |
| `electron-term.cjs` | 176 |
| `electron-textbuffer.cjs` | 309 |
| `electron-trust.cjs` | 170 |
| `electron-update.cjs` | 174 |

### Arayüz kabuğu
| Dosya | Satır |
|---|---|
| `src/App.tsx` | 2526 |
| `src/main.tsx` | 30 |
| `src/types.ts` | 519 |

### Bileşenler
| Dosya | Satır |
|---|---|
| `src/components/AIAssistant.tsx` | 768 |
| `src/components/AccordionMenu.tsx` | 187 |
| `src/components/AppDialogs.tsx` | 81 |
| `src/components/BranchPicker.tsx` | 199 |
| `src/components/ChatSessions.tsx` | 340 |
| `src/components/ChipSlider.tsx` | 58 |
| `src/components/CommandPalette.tsx` | 166 |
| `src/components/CommitHistoryMenu.tsx` | 259 |
| `src/components/CompletionIcon.tsx` | 14 |
| `src/components/CompletionMenu.tsx` | 196 |
| `src/components/DebugConsolePanel.tsx` | 89 |
| `src/components/DebugPanel.tsx` | 198 |
| `src/components/EditorArea.tsx` | 764 |
| `src/components/ErrorBoundary.tsx` | 70 |
| `src/components/ExtensionsPanel.tsx` | 303 |
| `src/components/FileTree.tsx` | 941 |
| `src/components/FileTypeIcon.tsx` | 226 |
| `src/components/GitPanel.tsx` | 883 |
| `src/components/GithubAccount.tsx` | 137 |
| `src/components/HoverTip.tsx` | 49 |
| `src/components/KeybindingsEditor.tsx` | 146 |
| `src/components/LandingPage.tsx` | 180 |
| `src/components/Logo.tsx` | 36 |
| `src/components/Markdown.tsx` | 73 |
| `src/components/Menu.tsx` | 115 |
| `src/components/MenuBar.tsx` | 103 |
| `src/components/ModelMenu.tsx` | 83 |
| `src/components/OutputPanel.tsx` | 121 |
| `src/components/Preview.tsx` | 372 |
| `src/components/ProblemsPanel.tsx` | 87 |
| `src/components/PtyView.tsx` | 122 |
| `src/components/RemoteDialog.tsx` | 313 |
| `src/components/RemoteMenu.tsx` | 159 |
| `src/components/ResizeHandle.tsx` | 69 |
| `src/components/SearchPanel.tsx` | 214 |
| `src/components/SettingsPage.tsx` | 754 |
| `src/components/SnippetsEditor.tsx` | 83 |
| `src/components/SplashScreen.tsx` | 56 |
| `src/components/StatusCursor.tsx` | 66 |
| `src/components/TaskPicker.tsx` | 80 |
| `src/components/Terminal.tsx` | 735 |
| `src/components/TestPanel.tsx` | 178 |
| `src/components/ThinkingMenu.tsx` | 146 |
| `src/components/TimelinePanel.tsx` | 151 |
| `src/components/TrustDialog.tsx` | 54 |
| `src/components/UpdateDialog.tsx` | 155 |
| `src/components/WindowControls.tsx` | 48 |

### Servisler
| Dosya | Satır |
|---|---|
| `src/services/SettingsContext.tsx` | 198 |
| `src/services/aiClient.ts` | 251 |
| `src/services/aiCompletion.ts` | 204 |
| `src/services/analytics.ts` | 72 |
| `src/services/collabRoom.ts` | 93 |
| `src/services/completionSchedule.ts` | 69 |
| `src/services/completionShape.ts` | 180 |
| `src/services/cursorStore.ts` | 15 |
| `src/services/debugEditor.ts` | 57 |
| `src/services/debugStore.ts` | 152 |
| `src/services/editorBridge.ts` | 108 |
| `src/services/editorTheme.ts` | 110 |
| `src/services/extensionsService.ts` | 220 |
| `src/services/gitExplain.ts` | 18 |
| `src/services/keybindings.ts` | 288 |
| `src/services/lang.ts` | 26 |
| `src/services/lspClient.ts` | 213 |
| `src/services/lspStore.ts` | 34 |
| `src/services/monacoShim.ts` | 28 |
| `src/services/palettes.ts` | 168 |
| `src/services/previewKind.ts` | 11 |
| `src/services/problems.ts` | 161 |
| `src/services/ptyBus.ts` | 37 |
| `src/services/recentFolders.ts` | 28 |
| `src/services/session.ts` | 103 |
| `src/services/settings.ts` | 347 |
| `src/services/splitLayout.ts` | 135 |
| `src/services/tasks.ts` | 88 |
| `src/services/terminalBridge.ts` | 54 |
| `src/services/terminalText.ts` | 148 |
| `src/services/testParse.ts` | 78 |
| `src/services/timeAgo.ts` | 23 |
| `src/services/trustService.ts` | 52 |
| `src/services/updateService.ts` | 29 |
| `src/services/useCollabToken.ts` | 67 |
| `src/services/useDictation.ts` | 68 |
| `src/services/useEvent.ts` | 13 |
| `src/services/useFocusTrap.ts` | 59 |
| `src/services/useGithubAuth.ts` | 32 |
| `src/services/userSnippets.ts` | 57 |

### i18n
| Dosya | Satır |
|---|---|
| `src/i18n/uiText.ts` | 673 |
| `src/i18n/uiTextAi.ts` | 588 |
| `src/i18n/uiTextComp.ts` | 347 |
| `src/i18n/uiTextDev.ts` | 379 |
| `src/i18n/uiTextRemote.ts` | 180 |
| `src/i18n/uiTextScm.ts` | 276 |
| `src/i18n/uiTextTheme.ts` | 1136 |

### Betikler
| Dosya | Satır |
|---|---|
| `scripts/analytics-report.mjs` | 53 |
| `scripts/audit-scan.mjs` | 205 |
| `scripts/auto-commit.mjs` | 233 |
| `scripts/backfill-overlay.mjs` | 19 |
| `scripts/brain.mjs` | 302 |
| `scripts/check-bundle.mjs` | 31 |
| `scripts/check-hygiene.mjs` | 75 |
| `scripts/check-version.mjs` | 82 |
| `scripts/dep-changelog.mjs` | 52 |
| `scripts/dep-review.mjs` | 56 |
| `scripts/dep-update.mjs` | 233 |
| `scripts/doc-sync.mjs` | 189 |
| `scripts/docker-docs.mjs` | 93 |
| `scripts/gen-file-icons.mjs` | 24 |
| `scripts/health-monitor.mjs` | 268 |
| `scripts/make-icons.cjs` | 29 |
| `scripts/release.mjs` | 293 |
| `scripts/runtime-watch.mjs` | 25 |

### Testler
| Dosya | Satır |
|---|---|
| `scripts/tests/ai-complete.test.cjs` | 205 |
| `scripts/tests/ai-security.test.cjs` | 84 |
| `scripts/tests/ai-tools.test.cjs` | 73 |
| `scripts/tests/analytics.test.cjs` | 143 |
| `scripts/tests/autocommit.test.cjs` | 42 |
| `scripts/tests/completion-schedule.test.cjs` | 53 |
| `scripts/tests/completion-shape.test.cjs` | 70 |
| `scripts/tests/debug.test.cjs` | 118 |
| `scripts/tests/deps.test.cjs` | 41 |
| `scripts/tests/electron-misc.test.cjs` | 138 |
| `scripts/tests/git.test.cjs` | 163 |
| `scripts/tests/history.test.cjs` | 66 |
| `scripts/tests/i18n.test.cjs` | 100 |
| `scripts/tests/keybindings.test.cjs` | 154 |
| `scripts/tests/lsp.test.cjs` | 104 |
| `scripts/tests/palettes.test.cjs` | 75 |
| `scripts/tests/paths.test.cjs` | 88 |
| `scripts/tests/preview-csp.test.cjs` | 66 |
| `scripts/tests/pty.test.cjs` | 114 |
| `scripts/tests/release.test.cjs` | 149 |
| `scripts/tests/replace.test.cjs` | 71 |
| `scripts/tests/search-redos.test.cjs` | 47 |
| `scripts/tests/services.test.cjs` | 140 |
| `scripts/tests/settings-migrate.test.cjs` | 70 |
| `scripts/tests/snippets.test.cjs` | 22 |
| `scripts/tests/ssh-sftp.test.cjs` | 268 |
| `scripts/tests/ssh.test.cjs` | 83 |
| `scripts/tests/sync.test.cjs` | 58 |
| `scripts/tests/syncserver.test.cjs` | 90 |
| `scripts/tests/term.test.cjs` | 74 |
| `scripts/tests/textbuffer.test.cjs` | 135 |
| `scripts/tests/trust.test.cjs` | 74 |

### Sunucu
| Dosya | Satır |
|---|---|
| `server/analytics-server.mjs` | 135 |
| `server/sync-server.mjs` | 319 |

## IPC kanalları
| Grup | Kanallar |
|---|---|
| ai | `ai:approve`, `ai:cancel`, `ai:commands`, `ai:complete`, `ai:completeCancel`, `ai:completeWarm`, `ai:ollamaModels`, `ai:run`, `ai:transcribe`, `ai:whisperModels` |
| analytics | `analytics:mark-asked`, `analytics:payload`, `analytics:set-consent`, `analytics:status` |
| app | `app:openLink`, `app:quit`, `app:reveal` |
| dbg | `dbg:evaluate`, `dbg:pause`, `dbg:properties`, `dbg:resume`, `dbg:scopes`, `dbg:setBreakpoints`, `dbg:start`, `dbg:stepInto`, `dbg:stepOut`, `dbg:stepOver`, `dbg:stop` |
| dialog | `dialog:openFiles`, `dialog:openFolder` |
| ext | `ext:checkUpdates`, `ext:details`, `ext:install`, `ext:list`, `ext:search`, `ext:uninstall` |
| fs | `fs:createFile`, `fs:createFolder`, `fs:deleteItem`, `fs:readDataUrl`, `fs:readDir`, `fs:readFile`, `fs:renameItem`, `fs:writeFile` |
| git | `git:amend`, `git:branches`, `git:checkout`, `git:checkoutRef`, `git:commit`, `git:commitFiles`, `git:createBranch`, `git:createBranchFrom`, `git:createTag`, `git:deleteBranch`, `git:deleteTag`, `git:diffFile`, `git:discard`, `git:fetch`, `git:init`, `git:log`, `git:merge`, `git:mergeAbort`, `git:mergeContinue`, `git:pull`, `git:push`, `git:pushTag`, `git:refs`, `git:resolve`, `git:stage`, `git:stageAll`, `git:stashApply`, `git:stashDrop`, `git:stashList`, `git:stashPop`, `git:stashPush`, `git:status`, `git:sync`, `git:undoCommit`, `git:unstage` |
| github | `github:cancel`, `github:copyCode`, `github:createPr`, `github:login`, `github:logout`, `github:openExternal`, `github:publishRepo`, `github:repoInfo`, `github:status` |
| history | `history:clear`, `history:config`, `history:deleted`, `history:list`, `history:read` |
| lsp | `lsp:notify`, `lsp:request`, `lsp:start`, `lsp:status` |
| preview | `preview:drop`, `preview:put` |
| pty | `pty:available`, `pty:profiles`, `pty:resize`, `pty:start`, `pty:stop`, `pty:write` |
| search | `search:cancel`, `search:files`, `search:replace`, `search:text` |
| secrets | `secrets:get`, `secrets:has`, `secrets:set` |
| snippets | `snippets:load`, `snippets:read`, `snippets:save` |
| ssh | `ssh:browse`, `ssh:close`, `ssh:connect`, `ssh:disconnect`, `ssh:forgetHostKey`, `ssh:hostKeyAnswer`, `ssh:hostRemove`, `ssh:hostSave`, `ssh:open`, `ssh:pickKey`, `ssh:status` |
| term | `term:input`, `term:start`, `term:stop` |
| trust | `trust:grant`, `trust:list`, `trust:revoke`, `trust:status` |
| ui | `ui:setTheme` |
| update | `update:check`, `update:download`, `update:install`, `update:releases`, `update:runtime-latest`, `update:state` |
| win | `win:close`, `win:is-maximized`, `win:minimize`, `win:toggle-maximize` |
| workspace | `workspace:open`, `workspace:recent` |

**Olaylar (ana süreç → arayüz):** `ai:event`, `analytics:set-lang`, `analytics:track`, `app:close-pending`, `app:close-request`, `app:close-response`, `dbg:event`, `fs:watch-change`, `git:changed`, `github:auth`, `lsp:event`, `pty:data`, `pty:exit`, `ssh:event`, `term:cwd`, `term:exit`, `term:output`, `term:ready`, `trust:changed`, `update:state`, `win:maximized`

## i18n
- 1090 anahtar; her biri 8 dilde (tr, en, de, ru, ar, es, fr, az) dolu olmalı. Denetim: `npm run brain:check`.

## Ayarlar
117 ayar, 12 kategori. Tek kaynak: `src/services/settingsSchema.json`. Ekleme kuralı: [[settings]].

| Kategori | Kimlik | Ad (tr) | Tür | Varsayılan | Aralık / seçenekler |
|---|---|---|---|---|---|
| Görünüm | `colorTheme` | Renk teması | palette | `"auto"` | auto, midnight, forest, orchid, ember, atlas, ink, paper, mist, mint, rose |
| Görünüm | `themeMode` | Tema modu | select | `"dark"` | dark, light, system |
| Görünüm | `accent` | Vurgu rengi | accent | `"indigo"` | indigo, blue, teal, green, orange, pink, violet, cyan, red, amber, lime |
| Görünüm | `uiFont` | Arayüz yazı tipi | select | `"system"` | system, segoe, bahnschrift, calibri, corbel, trebuchet, verdana, tahoma, arial, inter, roboto, ibmplex, georgia, mono |
| Görünüm | `uiZoom` | Arayüz yakınlaştırma | slider | `100` | 80–150 % |
| Görünüm | `animations` | Animasyonlar | toggle | `true` |  |
| Görünüm | `sidebarPosition` | Kenar çubuğu konumu | select | `"left"` | left, right |
| Görünüm | `activityBarVisible` | Etkinlik çubuğunu göster | toggle | `true` |  |
| Görünüm | `statusBarVisible` | Durum çubuğunu göster | toggle | `true` |  |
| Görünüm | `language` | Dil | select | `"auto"` | auto, tr, en, de, ru, ar, es, fr, az |
| Editör | `editorTheme` | Editör teması | select | `"auto"` | auto, nova-dark, nova-light, vs-dark, vs, hc-black |
| Editör | `extTheme` | Eklenti teması | text | `""` | ≤200 karakter |
| Editör | `fontFamily` | Kod yazı tipi | select | `"cascadia"` | cascadia, fira, jetbrains, sourcecode, ibmplex, hack, iosevka, dejavu, consolas, lucida, courier, monospace, custom |
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
| Editör | `showBreadcrumbs` | Dosya yolu göstergesi (breadcrumb) | toggle | `true` |  |
| Dosyalar ve kayıt | `autoSave` | Otomatik kaydet | select | `"off"` | off, afterDelay, onFocusChange |
| Dosyalar ve kayıt | `autoSaveDelay` | Otomatik kayıt gecikmesi | slider | `1000` | 500–5000 ms |
| Dosyalar ve kayıt | `formatOnSave` | Kayıtta kodu biçimlendir | toggle | `false` |  |
| Dosyalar ve kayıt | `trimTrailingWhitespace` | Kayıtta satır sonu boşluklarını sil | toggle | `false` |  |
| Dosyalar ve kayıt | `insertFinalNewline` | Kayıtta sona boş satır ekle | toggle | `false` |  |
| Dosyalar ve kayıt | `localHistory` | Yerel geçmiş | toggle | `true` |  |
| Dosyalar ve kayıt | `localHistoryMax` | Dosya başına sürüm sayısı | slider | `30` | 5–30 |
| Dosyalar ve kayıt | `welcomeOnStartup` | Açılışta karşılama sayfasını göster | toggle | `true` |  |
| Dosyalar ve kayıt | `showGitDecorations` | Dosya ağacında Git durumunu göster | toggle | `true` |  |
| Dosyalar ve kayıt | `showOpenEditors` | Gezginde "Açık düzenleyiciler" | toggle | `true` |  |
| Dosyalar ve kayıt | `treeDensity` | Ağaç satır yüksekliği | select | `"compact"` | compact, comfortable, spacious |
| Dosyalar ve kayıt | `treeIndentGuides` | Girinti kılavuz çizgileri (ağaç) | toggle | `true` |  |
| Dosyalar ve kayıt | `treeSort` | Gezgin sıralaması | select | `"foldersFirst"` | foldersFirst, filesFirst, mixed, type |
| Dosyalar ve kayıt | `treeShowHidden` | Gizli dosyaları göster | toggle | `true` |  |
| Dosyalar ve kayıt | `treeCompactFolders` | Klasörleri sıkıştır | toggle | `false` |  |
| Dosyalar ve kayıt | `treeIconStyle` | Dosya simgesi stili | select | `"color"` | color, minimal |
| Dosyalar ve kayıt | `treeAutoReveal` | Etkin dosyayı Gezgin'de göster | toggle | `true` |  |
| Çalıştır ve önizleme | `previewAutoOpen` | HTML açılınca önizlemeyi otomatik aç | toggle | `true` |  |
| Çalıştır ve önizleme | `runSaveBefore` | Çalıştırmadan önce kaydet | toggle | `true` |  |
| Çalıştır ve önizleme | `runClearTerminal` | Çalıştırmadan önce terminali temizle | toggle | `false` |  |
| Çalıştır ve önizleme | `runCommandNode` | JavaScript çalıştırma komutu | text | `""` | ≤200 karakter |
| Çalıştır ve önizleme | `runCommandTs` | TypeScript çalıştırma komutu | text | `""` | ≤200 karakter |
| Çalıştır ve önizleme | `runCommandPython` | Python çalıştırma komutu | text | `""` | ≤200 karakter |
| Çalıştır ve önizleme | `runCommandGo` | Go çalıştırma komutu | text | `""` | ≤200 karakter |
| Çalıştır ve önizleme | `runCommandPhp` | PHP çalıştırma komutu | text | `""` | ≤200 karakter |
| Eklentiler | `extAutoUpdate` | Eklentileri otomatik güncelle | toggle | `true` |  |
| Terminal | `terminalFontSize` | Terminal yazı boyutu | slider | `12` | 10–20 px |
| Editör | `lspEnabled` | Dil sunucuları (LSP) | toggle | `true` |  |
| Terminal | `terminalMode` | Terminal türü | select | `"pty"` | pty, classic |
| Terminal | `defaultShell` | Varsayılan kabuk | select | `"powershell"` | powershell, cmd, gitbash |
| Terminal | `terminalColorInput` | Komutları renklendir | toggle | `true` |  |
| Terminal | `terminalShowBranch` | İstemde Git dalını göster | toggle | `true` |  |
| Terminal | `terminalLineHeight` | Terminal satır yüksekliği | slider | `1.4` | 1–2 |
| Terminal | `terminalScrollback` | Terminal geçmiş sınırı (karakter) | select | `200000` | 50000, 100000, 200000, 500000 |
| Terminal | `terminalCursor` | Terminal imleç şekli | select | `"block"` | block, bar, underline |
| Git ve GitHub | `gitAutoFetch` | Uzak değişiklikleri otomatik getir (fetch) | toggle | `true` |  |
| Git ve GitHub | `gitStatusInterval` | Git durumu yenileme aralığı | select | `8` | 5, 8, 15, 30, 60 |
| Git ve GitHub | `gitFetchInterval` | Otomatik fetch aralığı | select | `60` | 30, 60, 120, 300 |
| Ortak düzenleme | `collabEnabled` | Ortak düzenlemeyi aç | toggle | `false` |  |
| Ortak düzenleme | `collabUrl` | Sunucu adresi | text | `""` | ≤200 karakter |
| Hakkında ve yedek | `analyticsEnabled` | Anonim kullanım istatistiklerini paylaş | toggle | `false` |  |
| Hakkında ve yedek | `updateAutoCheck` | Açılışta güncellemeleri denetle | toggle | `true` |  |
| Hakkında ve yedek | `updateAutoDownload` | Güncellemeyi otomatik indir | toggle | `true` |  |
| Yapay Zekâ | `aiCompletion` | AI kod tamamlama (hayalet metin) | toggle | `true` |  |
| Yapay Zekâ | `aiCompletionTrigger` | Öneri tetikleme | select | `"auto"` | auto, manual |
| Yapay Zekâ | `aiCompletionEffort` | Düşünme seviyesi / çaba | select | `"fast"` | instant, fast, balanced, deep |
| Yapay Zekâ | `aiCompletionModel` | Tamamlama modeli | text | `"qwen2.5-coder:0.5b"` | ≤60 karakter |
| Yapay Zekâ | `aiCompletionLength` | Öneri biçimi | select | `"block"` | line, block, long |
| Yapay Zekâ | `aiCompletionDelay` | Tamamlama süresi | slider | `100` | 0–3000 ms |
| Yapay Zekâ | `aiCompletionCooldown` | Tamamlama soğuma süresi (ms) | slider | `100` | 0–5000 |
| Yapay Zekâ | `aiCompletionMaxTokens` | Öneri uzunluğu üst sınırı (token) | slider | `32` | 16–256 |
| Yapay Zekâ | `aiCompletionPrefix` | İmleçten önceki bağlam (karakter) | slider | `2000` | 500–12000 |
| Yapay Zekâ | `aiCompletionSuffix` | İmleçten sonraki bağlam (karakter) | slider | `600` | 0–4000 |
| Yapay Zekâ | `aiCompletionTemperature` | Yaratıcılık (sıcaklık) | slider | `0.05` | 0–1 |
| Yapay Zekâ | `aiCompletionCount` | Alternatif öneri sayısı | slider | `1` | 1–3 |
| Yapay Zekâ | `aiCompletionToolbar` | Öneri araç çubuğunu göster | toggle | `true` |  |
| Yapay Zekâ | `aiAskModel` | Sohbet modeli (panelden seçilir) | text | `"qwen2.5-coder:7b"` | ≤60 karakter |
| Yapay Zekâ | `aiAgentModel` | Ajan modeli (panelden seçilir) | text | `"qwen2.5-coder:7b"` | ≤60 karakter |
| Yapay Zekâ | `aiDictationModel` | Dikte modeli (panelden seçilir) | text | `"ggml-small.bin"` | ≤60 karakter |
| Yapay Zekâ | `aiDefaultMode` | Varsayılan mod | select | `"ask"` | ask, agent |
| Yapay Zekâ | `aiAskThinking` | Sohbet: düşünme seviyesi | select | `"balanced"` | fast, balanced, deep |
| Yapay Zekâ | `aiMaxTokens` | En çok yanıt uzunluğu (token) | slider | `4096` | 1024–16000 |
| Yapay Zekâ | `aiIncludeContext` | Açık dosyayı bağlam olarak gönder | toggle | `true` |  |
| Yapay Zekâ | `aiAskInstructions` | Sohbet: özel yönerge | text | `""` | ≤600 karakter |
| Yapay Zekâ | `aiAgentThinking` | Ajan: düşünme seviyesi | select | `"deep"` | fast, balanced, deep |
| Yapay Zekâ | `aiAgentMaxTokens` | Ajan: en çok yanıt uzunluğu (token) | slider | `8192` | 1024–16000 |
| Yapay Zekâ | `aiAgentIncludeContext` | Ajan: açık dosyayı bağlam olarak gönder | toggle | `true` |  |
| Yapay Zekâ | `aiAgentMaxSteps` | Ajan: en çok adım | slider | `20` | 6–40 |
| Yapay Zekâ | `aiAgentAutonomy` | Ajan: otonomi | select | `"ask"` | ask, edits, auto |
| Yapay Zekâ | `aiAllowCommands` | Ajan komut çalıştırabilsin | toggle | `true` |  |
| Yapay Zekâ | `aiAgentInstructions` | Ajan: özel yönerge | text | `""` | ≤600 karakter |
| Yapay Zekâ | `aiDictationLang` | Dikte dili | select | `"ui"` | ui, auto |
| Yapay Zekâ | `aiDictationAutoSend` | Dikteden sonra otomatik gönder | toggle | `false` |  |

## GitHub Actions
| Dosya | Ad | İşler |
|---|---|---|
| `.github/workflows/auto-release.yml` | Otomatik sürüm hazırlığı | `prepare` (Sürümü hazırla ve PR aç) |
| `.github/workflows/backfill-desktop.yml` | Eski sürümlere macOS ve Linux paketi ekle | `plan`, `build` (${{ matrix.tag }} (${{ matrix.os }})) |
| `.github/workflows/ci-cd.yml` | CI/CD - Kalite, Güvenlik, Sürüm, Masaüstü Release | `quality` (Kalite, Güvenlik ve Performans), `version` (Otomatik Sürümleme), `desktop-smoke` (Masaüstü paketleme denetimi (${{ matrix.label }})), `build-desktop` (Paket (${{ matrix.label }})), `release-desktop` (GitHub Release (Windows, macOS, Linux)) |
| `.github/workflows/ci-failure-issue.yml` | CI hata bildirimi (otomatik issue) | `report` (Issue aç / güncelle / kapat) |
| `.github/workflows/dep-autopilot.yml` | Bağımlılık otopilotu | `autopilot` (Rapor, güncelle, PR aç) |
| `.github/workflows/dep-review.yml` | Bağımlılık PR incelemesi | `review` (Sürüm farkı raporu) |
| `.github/workflows/dependabot-automerge.yml` | Dependabot güvenli güncellemeleri otomatik birleştir | `automerge` (Patch/minor ise auto-merge) |
| `.github/workflows/docker.yml` | Docker - Derle, Test, Yayınla, Dağıt | `image` (İmaj (${{ matrix.name }})), `deploy` (Dağıt (${{ matrix.name }})), `docs` (Docker belgesi) |
| `.github/workflows/health-monitor.yml` | Sağlık ve güvenlik izleme | `monitor` (Ölç, logla, bildir) |
| `.github/workflows/release-finalize.yml` | Sürüm etiketini tamamla | `finalize` (Etiketsiz sürüm varsa etiketle ve yayınla) |
| `.github/workflows/runtime-watch.yml` | Electron, Chromium ve Node.js izleyici | `watch` (Yeni Electron varsa yükselt ve tara) |
| `.github/workflows/security.yml` | Güvenlik Taraması | `codeql` (CodeQL), `secrets` (Gizli anahtar taraması (gitleaks)), `dependency-review` (Bağımlılık incelemesi), `audit-scan` (Sürekli denetim raporu), `audit-weekly` (Haftalık npm audit) |

## Md haritası
| Ad | Yol | Amaç |
|---|---|---|
| [[AGENT]] | `AGENT.md` | AGENT.md — NovaCode Studio ajan sözleşmesi |
| [[CHANGELOG]] | `CHANGELOG.md` | Changelog |
| [[CLAUDE]] | `CLAUDE.md` | NovaCode Studio |
| [[ai-assistant]] | `docs/brain/actions/ai-assistant.md` | Yapay zekâ asistanı: çoklu sağlayıcı, Ask/Agent modları, araçlar, oturumlar, görsel girdi, sesli dikte, özel komutlar |
| [[analytics]] | `docs/brain/actions/analytics.md` | Anonim, rızaya bağlı kullanım sayacı: ne sayılır, ne gönderilir, nerede toplanır, KVKK ve geri alma |
| [[audit]] | `docs/brain/actions/audit.md` | Sürekli denetim: güvenlik açıkları, performans kayıpları, hatalar, arayüz ve özellik eksikleri |
| [[brain-maintenance]] | `docs/brain/actions/brain-maintenance.md` | Proje beynini (docs/brain) güncel ve tutarlı tutmak |
| [[ci-cd]] | `docs/brain/actions/ci-cd.md` | GitHub Actions, audit, bundle bütçesi ve yayın hattı |
| [[debugging]] | `docs/brain/actions/debugging.md` | Hata ayıklayıcı (Node/JavaScript): kesme noktası, adım adım, değişkenler, çağrı yığını |
| [[doc-sync]] | `docs/brain/actions/doc-sync.md` | Her istem ve değişiklikte proje beyninin otomatik güncel tutulması (hatırlatma, denetim, değişiklik günlüğü) |
| [[explorer]] | `docs/brain/actions/explorer.md` | Gezgin (dosya ağacı): görünüm seçenekleri, filtre, sürükle-bırak taşıma, bağlam menüsü, simge stilleri, güvenlik kuralları |
| [[extensions]] | `docs/brain/actions/extensions.md` | Eklenti mağazası (Open VSX): arama, yükleme, güncelleme, kaldırma; tema katkısı |
| [[git-github]] | `docs/brain/actions/git-github.md` | Git paneli, GitHub hesabı bağlama, PR, eşzamanlama ve canlı takip |
| [[i18n]] | `docs/brain/actions/i18n.md` | Arayüze metin eklemek (8 dil zorunlu) |
| [[lsp]] | `docs/brain/actions/lsp.md` | Dil sunucuları (LSP): Monaco'nun yerleşik desteği olmayan diller için tamamlama, üzerine gelme, tanıma git, tanılama |
| [[monitoring]] | `docs/brain/actions/monitoring.md` | Sürekli sağlık, güvenlik ve performans izleme: açık, eğilim ve servis sağlığı otomatik ölçülür, loglanır, tek issue ile bildirilir |
| [[motion]] | `docs/brain/actions/motion.md` | Geçiş, animasyon, hover, after ve gecikme efektleri; tek hareket dili |
| [[preview]] | `docs/brain/actions/preview.md` | HTML/SVG/Markdown önizleme, yerel sunucu önizleme, Çalıştır (F5) ve çalıştırma ayarları |
| [[release]] | `docs/brain/actions/release.md` | Değişiklikleri commitle, sürümü belirle, push et, CI'yı izle |
| [[remote-ssh]] | `docs/brain/actions/remote-ssh.md` | Uzak çalışma alanı (VS Code Remote-SSH benzeri): SSH ile sunucuya bağlan, uzak klasörü Gezgin'de aç/düzenle/kaydet (SFTP), uzak terminal |
| [[search-palette]] | `docs/brain/actions/search-palette.md` | Komut paleti (Ctrl+P / >), proje araması, satıra git |
| [[security-kvkk]] | `docs/brain/actions/security-kvkk.md` | IPC, dosya sistemi, token ve kişisel veriye dokunan her değişikliğin güvenlik ve KVKK kapısı |
| [[settings]] | `docs/brain/actions/settings.md` | Ayarlar sistemi: yeni ayar eklemek, tema/yazı tipi/editör davranışları, kalıcılık ve gizli değerler |
| [[source-control]] | `docs/brain/actions/source-control.md` | Kaynak denetimi: fark sekmesi, dal/etiket seçici, birleştirme, stash, geçmiş; Sorunlar (hata/uyarı) sayacı ve renkleri |
| [[sync-deploy]] | `docs/brain/actions/sync-deploy.md` | Senkron sunucusunu (Yjs) TLS/wss ile kendi sunucuna kurma paketi: Docker + Caddy, alan adsız sslip.io, token, sağlık izleme |
| [[terminal]] | `docs/brain/actions/terminal.md` | Entegre terminal: gerçek PTY (xterm.js) ve klasik boru terminali, çoklu oturum, panel davranışı |
| [[testing]] | `docs/brain/actions/testing.md` | Değişikliği doğrulamak: tip, derleme, birim ve entegrasyon testleri, uygulamayı çalıştırma |
| [[text-buffer]] | `docs/brain/actions/text-buffer.md` | Özel metin tamponu (piece table) ve ajanın edit_lines aracı |
| [[ui-design]] | `docs/brain/actions/ui-design.md` | Arayüz, tema, logo ve animasyon değişiklikleri |
| [[updates]] | `docs/brain/actions/updates.md` | Uygulama güncelleme sistemi: denetle, indir (yüzde), yeniden başlat ve kur; sürüm notları; yayın hattı |
| [[versioning]] | `docs/brain/actions/versioning.md` | SemVer sürümleme otomasyonu: patch/minor/major kararı, sürüm notları, sürüm geçmişi, etiket ve GitHub Release |
| [[AUDIT]] | `docs/brain/AUDIT.md` | Denetim raporu (otomatik) |
| [[BACKLOG]] | `docs/brain/BACKLOG.md` | Denetim yapılacaklar listesi (doğrulanmış bulgular) |
| [[BRAIN]] | `docs/brain/BRAIN.md` | NovaCode Studio — Proje Beyni |
| [[DECISIONS]] | `docs/brain/DECISIONS.md` | Karar günlüğü |
| [[DOCKER]] | `docs/brain/DOCKER.md` | Docker (otomatik üretilir) |
| [[LOG]] | `docs/brain/LOG.md` | Değişiklik günlüğü (otomatik) |
| [[PROJECT]] | `docs/brain/PROJECT.md` | Proje: NovaCode Studio |
| [[STATE]] | `docs/brain/STATE.md` | Proje durumu (otomatik üretilir) |
| [[VERSIONS]] | `docs/brain/VERSIONS.md` | Sürüm geçmişi (otomatik) |
| [[README]] | `README.md` | NovaCode Studio |
| [[SECURITY]] | `SECURITY.md` | Güvenlik Politikası / Security Policy |

