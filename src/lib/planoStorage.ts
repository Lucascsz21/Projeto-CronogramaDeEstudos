export interface Atividade {
  conteudo: string;
  subtopico?: string;
  tipo: "estudo" | "revisão";
  duracao_horas: number;
  dificuldade: number;
  concluida?: boolean;
}

export interface DiaCronograma {
  data: string;
  total_horas: number;
  atividades: Atividade[];
}

export interface Trilha {
  materia: string;
  subtopicos: string[];
}

export interface Plano {
  resumo_geral: string;
  trilhas?: Trilha[];
  cronograma: DiaCronograma[];
  dicas: string[];
}

export interface StoredPlanoEntry {
  id: string;
  criadoEm: string;
  plano: Plano;
}

export interface UserPlanoStorage {
  activeId: string;
  planos: StoredPlanoEntry[];
}

const PLANO_KEY_PREFIX = "studysprint:plano";
const MAX_PLANOS = 2;

const getPlanoStorageKey = (userId: string) => `${PLANO_KEY_PREFIX}:${userId}`;

function isLegacyPlano(data: unknown): data is Plano {
  return (
    typeof data === "object" &&
    data !== null &&
    "cronograma" in data &&
    !("planos" in data)
  );
}

function migrateLegacy(data: unknown): UserPlanoStorage | null {
  if (!isLegacyPlano(data)) return null;

  const entry: StoredPlanoEntry = {
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    plano: data,
  };

  return { activeId: entry.id, planos: [entry] };
}

function persistUserPlanos(userId: string, storage: UserPlanoStorage) {
  localStorage.setItem(getPlanoStorageKey(userId), JSON.stringify(storage));
}

export function loadUserPlanos(userId: string): UserPlanoStorage | null {
  try {
    const saved = localStorage.getItem(getPlanoStorageKey(userId));
    if (!saved) return null;

    const parsed = JSON.parse(saved) as unknown;
    const storage = isLegacyPlano(parsed)
      ? migrateLegacy(parsed)
      : (parsed as UserPlanoStorage);

    if (!storage || storage.planos.length === 0) return null;

    if (isLegacyPlano(parsed)) {
      persistUserPlanos(userId, storage);
    }

    return storage;
  } catch {
    return null;
  }
}

export function loadPlano(userId: string): Plano | null {
  const storage = loadUserPlanos(userId);
  if (!storage) return null;

  const active = storage.planos.find((entry) => entry.id === storage.activeId);
  return active?.plano ?? storage.planos[0]?.plano ?? null;
}

export function addPlano(userId: string, plano: Plano): StoredPlanoEntry {
  const storage = loadUserPlanos(userId);
  const entry: StoredPlanoEntry = {
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
    plano,
  };

  const planos = [entry, ...(storage?.planos ?? [])].slice(0, MAX_PLANOS);
  persistUserPlanos(userId, { activeId: entry.id, planos });
  return entry;
}

export function updateActivePlano(userId: string, plano: Plano) {
  const storage = loadUserPlanos(userId);
  if (!storage) return;

  const index = storage.planos.findIndex((entry) => entry.id === storage.activeId);
  if (index === -1) return;

  storage.planos[index] = { ...storage.planos[index], plano };
  persistUserPlanos(userId, storage);
}

/** @deprecated Use updateActivePlano */
export const savePlano = updateActivePlano;

export function setActivePlano(userId: string, planoId: string): Plano | null {
  const storage = loadUserPlanos(userId);
  if (!storage) return null;

  const entry = storage.planos.find((item) => item.id === planoId);
  if (!entry) return null;

  persistUserPlanos(userId, { ...storage, activeId: planoId });
  return entry.plano;
}

export function removeAllPlanos(userId: string) {
  localStorage.removeItem(getPlanoStorageKey(userId));
}

/** @deprecated Use removeAllPlanos */
export const removePlano = removeAllPlanos;

export function getPlanoProgress(plano: Plano): number {
  const atividades = plano.cronograma.flatMap((dia) => dia.atividades);
  const totalHoras = atividades.reduce((acc, atividade) => acc + atividade.duracao_horas, 0);
  const horasConcluidas = atividades.reduce(
    (acc, atividade) => acc + (atividade.concluida ? atividade.duracao_horas : 0),
    0
  );

  return totalHoras > 0 ? Math.round((horasConcluidas / totalHoras) * 100) : 0;
}

export function getPlanoResumo(entry: StoredPlanoEntry) {
  const materias =
    entry.plano.trilhas?.map((trilha) => trilha.materia).join(", ") ||
    entry.plano.cronograma[0]?.atividades[0]?.conteudo ||
    "Cronograma de estudos";

  const ultimoDia = entry.plano.cronograma[entry.plano.cronograma.length - 1]?.data;

  return {
    titulo: materias.length > 42 ? `${materias.slice(0, 42)}…` : materias,
    progresso: getPlanoProgress(entry.plano),
    dias: entry.plano.cronograma.length,
    prova: ultimoDia,
    criadoEm: entry.criadoEm,
  };
}
