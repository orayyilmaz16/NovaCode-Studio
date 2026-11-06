// y-monaco, Monaco'yu npm'den ikinci kez paketlemesin diye Vite'ta bu dosyaya yönlendirilir (vite.config.ts).
// Uygulama Monaco'yu zaten yerel ./vs dosyalarından yükler ve global `monaco` nesnesi oluşur.
// Burada yalnız y-monaco'nun çalışma zamanında kullandığı üyeler, o global nesneye yönlendirilir.
type MonacoGlobal = {
  Range: new (...args: unknown[]) => unknown;
  Selection: { createWithDirection: (...args: unknown[]) => unknown };
  SelectionDirection: { RTL: unknown };
};

const monaco = (): MonacoGlobal => {
  const m = (globalThis as unknown as { monaco?: MonacoGlobal }).monaco;
  if (!m) throw new Error('Monaco henüz yüklenmedi.');
  return m;
};

export const Range = function (...args: unknown[]) {
  return new (monaco().Range)(...args);
} as unknown as new (...args: unknown[]) => unknown;

export const Selection = {
  createWithDirection: (...args: unknown[]) => monaco().Selection.createWithDirection(...args)
};

export const SelectionDirection = {
  get RTL() {
    return monaco().SelectionDirection.RTL;
  }
};
