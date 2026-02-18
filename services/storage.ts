
import { UserProgress, QuizScore, Roadmap } from '../types';

const STORAGE_KEY = 'rasineni_companion_profiles_v2';

const getProfiles = (): Record<string, UserProgress> => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

const saveProfiles = (profiles: Record<string, UserProgress>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

export const getProfileNames = (): string[] => {
  return Object.keys(getProfiles());
};

export const loadUserProgress = (name: string): UserProgress => {
  const profiles = getProfiles();
  if (profiles[name]) return profiles[name];
  
  const newProfile: UserProgress = {
    name,
    roadmaps: {},
    quizHistory: [],
    lastActive: Date.now()
  };
  profiles[name] = newProfile;
  saveProfiles(profiles);
  return newProfile;
};

export const saveUserProgress = (progress: UserProgress) => {
  const profiles = getProfiles();
  profiles[progress.name] = { ...progress, lastActive: Date.now() };
  saveProfiles(profiles);
};

export const addQuizScoreForUser = (userName: string, score: QuizScore) => {
  const p = loadUserProgress(userName);
  p.quizHistory = [score, ...p.quizHistory].slice(0, 20);
  saveUserProgress(p);
};

export const saveRoadmapForUser = (userName: string, roadmap: Roadmap) => {
  const p = loadUserProgress(userName);
  p.roadmaps[roadmap.topic] = {
    roadmap,
    completedDays: []
  };
  saveUserProgress(p);
};

export const toggleDayCompletionForUser = (userName: string, topic: string, day: number) => {
  const p = loadUserProgress(userName);
  if (!p.roadmaps[topic]) return;
  
  const days = p.roadmaps[topic].completedDays;
  if (days.includes(day)) {
    p.roadmaps[topic].completedDays = days.filter(d => d !== day);
  } else {
    p.roadmaps[topic].completedDays = [...days, day];
  }
  saveUserProgress(p);
};

export const deleteUser = (name: string) => {
  const profiles = getProfiles();
  delete profiles[name];
  saveProfiles(profiles);
};
