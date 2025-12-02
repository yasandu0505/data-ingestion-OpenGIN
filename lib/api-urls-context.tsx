"use client";
import { createContext, useContext, useState, ReactNode } from "react";

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

export function ApiUrlsProvider({ children }: { children: ReactNode }) {
  const [readApiUrl, setReadApiUrl] = useState("");
  const [updateApiUrl, setUpdateApiUrl] = useState("");
  const [kindPairs, setKindPairs] = useState<IKindPair[]>([]);

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

