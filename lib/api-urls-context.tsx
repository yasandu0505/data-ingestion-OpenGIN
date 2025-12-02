"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface IKindPair {
  majorKind: string;
  minorKind: string;
}

interface ApiUrlsContextType {
  readApiUrl: string;
  updateApiUrl: string;
  kindPairs: IKindPair[];
  setApiUrls: (readApiUrl: string, updateApiUrl: string, kindPairs: IKindPair[]) => void;
}

const ApiUrlsContext = createContext<ApiUrlsContextType | undefined>(undefined);

const STORAGE_KEY = 'opengin_api_urls';

export function ApiUrlsProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or defaults
  const [readApiUrl, setReadApiUrl] = useState<string>("");
  const [updateApiUrl, setUpdateApiUrl] = useState<string>("");
  const [kindPairs, setKindPairs] = useState<IKindPair[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setReadApiUrl(parsed.readApiUrl || "");
        setUpdateApiUrl(parsed.updateApiUrl || "");
        setKindPairs(parsed.kindPairs || []);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever data changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          readApiUrl,
          updateApiUrl,
          kindPairs,
        }));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [readApiUrl, updateApiUrl, kindPairs, isInitialized]);

  const setApiUrls = (read: string, update: string, pairs: IKindPair[]) => {
    setReadApiUrl(read);
    setUpdateApiUrl(update);
    setKindPairs(pairs);
  };

  return (
    <ApiUrlsContext.Provider value={{ readApiUrl, updateApiUrl, kindPairs, setApiUrls }}>
      {children}
    </ApiUrlsContext.Provider>
  );
}

export function useApiUrls() {
  const context = useContext(ApiUrlsContext);
  if (context === undefined) {
    throw new Error("useApiUrls must be used within an ApiUrlsProvider");
  }
  return context;
}

