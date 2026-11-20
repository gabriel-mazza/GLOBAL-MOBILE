import { useCallback, useEffect, useState } from 'react';
import { getLinhas } from './api/client';
import { Linha } from './types';

export function useLinhas() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [origem, setOrigem] = useState<'api' | 'mock'>('mock');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const r = await getLinhas();
      setLinhas(r.linhas);
      setOrigem(r.origem);
    } catch {
      setErro('Não foi possível carregar as linhas. Puxe a tela para tentar de novo.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { linhas, origem, carregando, erro, recarregar: carregar };
}
