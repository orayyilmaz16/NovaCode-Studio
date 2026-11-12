// Material Icon Theme SVG yükleyicileri. Ana pakete girmesin diye FileTypeIcon bunu gecikmeli (dynamic import) yükler.
const loaders = import.meta.glob('../../node_modules/material-icon-theme/icons/*.svg', { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;
export const loaderFor = (icon: string): (() => Promise<string>) | undefined =>
  loaders[`../../node_modules/material-icon-theme/icons/${icon}.svg`];
