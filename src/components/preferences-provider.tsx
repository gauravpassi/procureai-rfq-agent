"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Density = "compact" | "balanced" | "spacious";
export type AgentProminence = "invisible" | "subtle" | "prominent";

interface Preferences {
  density: Density;
  agentProminence: AgentProminence;
  /** CSS hex (e.g. "#1ca7e0") — defaults to brand cyan */
  accent: string;
  setDensity: (d: Density) => void;
  setAgentProminence: (p: AgentProminence) => void;
  setAccent: (hex: string) => void;
}

const Ctx = createContext<Preferences | null>(null);

const STORAGE_KEY = "procureai.preferences";
const DEFAULTS = { density: "balanced" as Density, agentProminence: "subtle" as AgentProminence, accent: "#1ca7e0" };

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensity] = useState<Density>(DEFAULTS.density);
  const [agentProminence, setAgentProminence] = useState<AgentProminence>(DEFAULTS.agentProminence);
  const [accent, setAccent] = useState<string>(DEFAULTS.accent);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.density) setDensity(parsed.density);
      if (parsed.agentProminence) setAgentProminence(parsed.agentProminence);
      if (parsed.accent) setAccent(parsed.accent);
    } catch {}
  }, []);

  // Persist + apply to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = density;
    root.dataset.agentProminence = agentProminence;
    root.style.setProperty("--accent", accent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ density, agentProminence, accent }));
    } catch {}
  }, [density, agentProminence, accent]);

  return (
    <Ctx.Provider value={{ density, agentProminence, accent, setDensity, setAgentProminence, setAccent }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePreferences = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return v;
};
