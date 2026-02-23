import { create } from 'zustand';

export interface Keyword {
  word: string;
  wikiSlug?: string;
}

export interface Fact {
  id: string;
  title: string;
  text: string;
  textHash?: string | null;
  category: string;
  source: string | null;
  imageUrl: string | null;
  keywords: Keyword[] | null;
  createdAt: string;
  author?: {
    username: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FactsState {
  facts: Fact[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  currentCategory: string | null;
  setFacts: (facts: Fact[]) => void;
  addFacts: (facts: Fact[]) => void;
  setPagination: (pagination: Pagination) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCategory: (category: string | null) => void;
  reset: () => void;
}

export const useFactsStore = create<FactsState>((set) => ({
  facts: [],
  pagination: null,
  isLoading: false,
  error: null,
  currentCategory: null,
  setFacts: (facts) => set({ facts }),
  addFacts: (newFacts) => set((state) => ({ facts: [...state.facts, ...newFacts] })),
  setPagination: (pagination) => set({ pagination }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCategory: (currentCategory) => set({ currentCategory, facts: [], pagination: null }),
  reset: () => set({ facts: [], pagination: null, error: null, currentCategory: null }),
}));
