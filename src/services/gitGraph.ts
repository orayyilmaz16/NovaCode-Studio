// Git geçmişi grafı: commit listesinden (üst commit bilgisiyle) şerit düzeni hesaplar (VS Code "Source Control Graph" benzeri).
// Girdi topolojik sırada (yeniden eskiye) gelir; her satır için üstten gelen/alta giden şeritler ve düğümün şeridi döner.
export interface GraphCommit { hash: string; parents?: string[] }

export interface GraphRow {
  /** Düğümün şeridi */
  lane: number;
  /** Satıra üstten giren şeritler (karma ya da boş) */
  top: (string | null)[];
  /** Satırdan alta çıkan şeritler */
  bottom: (string | null)[];
  /** Düğümden alta bağlanan üst commit şeritleri (birleştirme/dal ayrılması) */
  parentLanes: number[];
}

export interface GraphLayout { rows: GraphRow[]; laneCount: number }

export function layoutGraph(commits: GraphCommit[]): GraphLayout {
  let lanes: (string | null)[] = [];
  const rows: GraphRow[] = [];
  let maxLanes = 1;
  for (const c of commits) {
    const top = lanes.slice();
    let idx = lanes.indexOf(c.hash);
    if (idx === -1) {
      idx = lanes.indexOf(null);
      if (idx === -1) { idx = lanes.length; lanes.push(c.hash); } else lanes[idx] = c.hash;
    }
    // Aynı commit'e giden diğer şeritler düğümde birleşir
    for (let i = 0; i < lanes.length; i++) if (i !== idx && lanes[i] === c.hash) lanes[i] = null;

    const parents = c.parents ?? [];
    const parentLanes: number[] = [];
    if (parents.length === 0) {
      lanes[idx] = null;
    } else {
      const first = parents[0];
      const existing = lanes.findIndex((h, i) => i !== idx && h === first);
      if (existing >= 0) { lanes[idx] = null; parentLanes.push(existing); } else { lanes[idx] = first; parentLanes.push(idx); }
      for (const p of parents.slice(1)) {
        let j = lanes.indexOf(p);
        if (j === -1) {
          j = lanes.indexOf(null);
          if (j === -1) { j = lanes.length; lanes.push(p); } else lanes[j] = p;
        }
        parentLanes.push(j);
      }
    }
    while (lanes.length && lanes[lanes.length - 1] === null) lanes.pop();
    rows.push({ lane: idx, top, bottom: lanes.slice(), parentLanes });
    maxLanes = Math.max(maxLanes, idx + 1, top.length, lanes.length);
  }
  return { rows, laneCount: maxLanes };
}

/** Şerit rengi (8'li döngü): tek vurgu kuralı yerine ayırt edilebilirlik için dal renkleri */
export const LANE_COLORS = ['#f97316', '#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#facc15', '#fb7185', '#2dd4bf'];
export const laneColor = (i: number) => LANE_COLORS[i % LANE_COLORS.length];
