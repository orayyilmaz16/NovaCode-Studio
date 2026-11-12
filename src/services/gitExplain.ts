import type { GitResult } from '../types';
import { t } from '../i18n/uiText';
import '../i18n/uiTextScm';

/** Git/GitHub hata kodlarını kullanıcı diline çevirir; bilinmeyenlerde git'in kendi mesajı gösterilir. */
export function explainGit(res: Pick<GitResult, 'stderr'>): string {
  const e = res.stderr || '';
  if (e === 'diverged') return t('gitDiverged');
  if (e === 'github-required') return t('gitLocked');
  if (e === 'merge-conflict') return t('scmMergeConflictMsg');
  return e && e.length < 400 ? e : t('gitFailed');
}

/** Dosya yolunun son parçası ve üst klasörü (liste satırları için). */
export function splitPath(p: string) {
  const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return i < 0 ? { dir: '', name: p } : { dir: p.slice(0, i + 1), name: p.slice(i + 1) };
}
