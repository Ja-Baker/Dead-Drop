import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Vault {
  id: string;
  name: string;
  emoji: string;
  contentCount: number;
  triggerDays: number;
  createdAt: Date;
  contents: VaultContent[];
}

interface VaultContent {
  id: string;
  type: 'image' | 'text' | 'video' | 'audio';
  name: string;
  data?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  lastCheckIn: Date;
}

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (email: string, password: string, name: string) => void;
  logout: () => void;

  // Proof of Life
  lastCheckIn: Date | null;
  checkIn: () => void;
  getDaysSinceCheckIn: () => number;

  // Vaults
  vaults: Vault[];
  addVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'contents'>) => void;
  deleteVault: (id: string) => void;
  getVault: (id: string) => Vault | undefined;
  addContentToVault: (vaultId: string, content: Omit<VaultContent, 'id'>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial User State
      user: null,
      isAuthenticated: false,
      lastCheckIn: null,

      // Initial Vaults
      vaults: [],

      // Auth Actions
      login: (email: string, _password: string) => {
        // Mock login - just create a user
        set({
          user: {
            id: '1',
            email,
            name: email.split('@')[0],
            lastCheckIn: new Date(),
          },
          isAuthenticated: true,
          lastCheckIn: new Date(),
        });
      },

      signup: (email: string, _password: string, name: string) => {
        // Mock signup
        set({
          user: {
            id: '1',
            email,
            name,
            lastCheckIn: new Date(),
          },
          isAuthenticated: true,
          lastCheckIn: new Date(),
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // Proof of Life Actions
      checkIn: () => {
        const now = new Date();
        set({ lastCheckIn: now });
        if (get().user) {
          set({
            user: {
              ...get().user!,
              lastCheckIn: now,
            },
          });
        }
      },

      getDaysSinceCheckIn: () => {
        const lastCheckIn = get().lastCheckIn;
        if (!lastCheckIn) return 0;
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - new Date(lastCheckIn).getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      },

      // Vault Actions
      addVault: (vault) => {
        const newVault: Vault = {
          ...vault,
          id: Date.now().toString(),
          createdAt: new Date(),
          contents: [],
        };
        set({ vaults: [...get().vaults, newVault] });
      },

      deleteVault: (id) => {
        set({ vaults: get().vaults.filter((v) => v.id !== id) });
      },

      getVault: (id) => {
        return get().vaults.find((v) => v.id === id);
      },

      addContentToVault: (vaultId, content) => {
        const vaults = get().vaults;
        const vaultIndex = vaults.findIndex((v) => v.id === vaultId);
        if (vaultIndex === -1) return;

        const newContent: VaultContent = {
          ...content,
          id: Date.now().toString(),
        };

        const updatedVault = {
          ...vaults[vaultIndex],
          contents: [...vaults[vaultIndex].contents, newContent],
          contentCount: vaults[vaultIndex].contentCount + 1,
        };

        const updatedVaults = [...vaults];
        updatedVaults[vaultIndex] = updatedVault;
        set({ vaults: updatedVaults });
      },
    }),
    {
      name: 'dead-drop-storage',
    }
  )
);
