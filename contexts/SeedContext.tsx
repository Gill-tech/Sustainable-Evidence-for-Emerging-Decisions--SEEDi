import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DecisionProject,
  UserContext,
  Innovation,
  MOCK_INNOVATIONS,
  STAGE_NAMES,
} from "@/constants/data";

export interface UserProfile {
  name: string;
  role: string;
}

interface SeedContextValue {
  projects: DecisionProject[];
  currentProject: DecisionProject | null;
  innovations: Innovation[];
  filteredInnovations: Innovation[];
  isLoading: boolean;
  userProfile: UserProfile | null;
  isOnboarded: boolean;
  setUserProfile: (profile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  createProject: (title: string) => Promise<DecisionProject>;
  updateProjectContext: (projectId: string, context: UserContext) => Promise<void>;
  setCurrentProject: (project: DecisionProject | null) => void;
  advanceStage: (projectId: string) => Promise<void>;
  toggleInnovation: (projectId: string, innovationId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  completeProject: (projectId: string) => Promise<void>;
}

const SeedContext = createContext<SeedContextValue | null>(null);

const PROJECTS_KEY = "@seedi_projects";
const PROFILE_KEY = "@seedi_profile";

export function SeedProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<DecisionProject[]>([]);
  const [currentProject, setCurrentProject] = useState<DecisionProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedProjects, storedProfile] = await Promise.all([
        AsyncStorage.getItem(PROJECTS_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
      ]);
      if (storedProjects) setProjects(JSON.parse(storedProjects));
      if (storedProfile) setUserProfileState(JSON.parse(storedProfile));
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      setUserProfileState(profile);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_KEY);
      setUserProfileState(null);
    } catch (e) {
      console.error("Failed to logout:", e);
    }
  };

  const isOnboarded = !!userProfile;

  const saveProjects = async (updated: DecisionProject[]) => {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
      setProjects(updated);
    } catch (e) {
      console.error("Failed to save projects:", e);
    }
  };

  const createProject = async (title: string): Promise<DecisionProject> => {
    const project: DecisionProject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      currentStage: 1,
      stageName: STAGE_NAMES[0],
      innovationCount: 0,
      selectedInnovations: [],
      status: "active",
    };
    const updated = [project, ...projects];
    await saveProjects(updated);
    setCurrentProject(project);
    return project;
  };

  const updateProjectContext = async (projectId: string, context: UserContext) => {
    const updated = projects.map((p) =>
      p.id === projectId
        ? { ...p, context, updatedAt: new Date().toISOString().split("T")[0] }
        : p
    );
    await saveProjects(updated);
    const proj = updated.find((p) => p.id === projectId);
    if (proj) setCurrentProject(proj);
  };

  const advanceStage = async (projectId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId && p.currentStage < 4) {
        const nextStage = p.currentStage + 1;
        return {
          ...p,
          currentStage: nextStage,
          stageName: STAGE_NAMES[nextStage - 1],
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    });
    await saveProjects(updated);
    const proj = updated.find((p) => p.id === projectId);
    if (proj) setCurrentProject(proj);
  };

  const toggleInnovation = async (projectId: string, innovationId: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const selected = p.selectedInnovations.includes(innovationId)
          ? p.selectedInnovations.filter((id) => id !== innovationId)
          : [...p.selectedInnovations, innovationId];
        return {
          ...p,
          selectedInnovations: selected,
          innovationCount: selected.length,
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
      return p;
    });
    await saveProjects(updated);
    const proj = updated.find((p) => p.id === projectId);
    if (proj) setCurrentProject(proj);
  };

  const deleteProject = async (projectId: string) => {
    const updated = projects.filter((p) => p.id !== projectId);
    await saveProjects(updated);
    if (currentProject?.id === projectId) setCurrentProject(null);
  };

  const completeProject = async (projectId: string) => {
    const updated = projects.map((p) =>
      p.id === projectId
        ? { ...p, status: "completed" as const, updatedAt: new Date().toISOString().split("T")[0] }
        : p
    );
    await saveProjects(updated);
  };

  const filteredInnovations = useMemo(() => {
    if (!currentProject?.context) return MOCK_INNOVATIONS;
    const ctx = currentProject.context;
    return MOCK_INNOVATIONS.filter((inn) => {
      if (ctx.region && inn.region !== ctx.region && inn.region !== "All") return false;
      return true;
    });
  }, [currentProject?.context]);

  const value = useMemo(
    () => ({
      projects,
      currentProject,
      innovations: MOCK_INNOVATIONS,
      filteredInnovations,
      isLoading,
      userProfile,
      isOnboarded,
      setUserProfile,
      logout,
      createProject,
      updateProjectContext,
      setCurrentProject,
      advanceStage,
      toggleInnovation,
      deleteProject,
      completeProject,
    }),
    [projects, currentProject, filteredInnovations, isLoading, userProfile, isOnboarded]
  );

  return <SeedContext.Provider value={value}>{children}</SeedContext.Provider>;
}

export function useSeed() {
  const context = useContext(SeedContext);
  if (!context) {
    throw new Error("useSeed must be used within a SeedProvider");
  }
  return context;
}
