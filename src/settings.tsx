import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getConfig, setConfig } from './db/database';
import { Tema, temaContraste, temaPadrao } from './theme';
import { Perfil } from './types';

interface Ctx {
  perfil: Perfil;
  textoGrande: boolean;
  altoContraste: boolean;
  t: Tema;
  fs: (tamanho: number) => number;
  setPerfil: (p: Perfil) => void;
  setTextoGrande: (v: boolean) => void;
  setAltoContraste: (v: boolean) => void;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [pronto, setPronto] = useState(false);
  const [perfil, setPerfilState] = useState<Perfil>('trabalhador');
  const [textoGrande, setTextoGrandeState] = useState(false);
  const [altoContraste, setAltoContrasteState] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, tg, ac] = await Promise.all([
        getConfig('perfil'),
        getConfig('textoGrande'),
        getConfig('altoContraste'),
      ]);
      if (p) setPerfilState(p as Perfil);
      setTextoGrandeState(tg === '1');
      setAltoContrasteState(ac === '1');
      setPronto(true);
    })();
  }, []);

  const setPerfil = useCallback((p: Perfil) => {
    setPerfilState(p);
    setConfig('perfil', p);
  }, []);
  const setTextoGrande = useCallback((v: boolean) => {
    setTextoGrandeState(v);
    setConfig('textoGrande', v ? '1' : '0');
  }, []);
  const setAltoContraste = useCallback((v: boolean) => {
    setAltoContrasteState(v);
    setConfig('altoContraste', v ? '1' : '0');
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      perfil,
      textoGrande,
      altoContraste,
      t: altoContraste ? temaContraste : temaPadrao,
      fs: (n: number) => Math.round(n * (textoGrande ? 1.3 : 1)),
      setPerfil,
      setTextoGrande,
      setAltoContraste,
    }),
    [perfil, textoGrande, altoContraste, setPerfil, setTextoGrande, setAltoContraste]
  );

  if (!pronto) return null;
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings fora do SettingsProvider');
  return ctx;
}
