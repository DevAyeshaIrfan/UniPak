import React, { createContext, useState, useEffect } from 'react';

export const SavedContext = createContext({
  savedUniversities: [],
  savedResults: [],
  toggleSaveUniversity: () => {},
  saveResult: () => {},
  removeResult: () => {},
  clearAll: () => {},
  isUniversitySaved: () => false,
});

export function SavedProvider({ children }) {
  const [savedUniversities, setSavedUniversities] = useState(() => {
    try {
      const item = localStorage.getItem('unipak-saved-universities');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Failed to parse saved universities', error);
      return [];
    }
  });

  const [savedResults, setSavedResults] = useState(() => {
    try {
      const item = localStorage.getItem('unipak-saved-results');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Failed to parse saved results', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('unipak-saved-universities', JSON.stringify(savedUniversities));
  }, [savedUniversities]);

  useEffect(() => {
    localStorage.setItem('unipak-saved-results', JSON.stringify(savedResults));
  }, [savedResults]);

  const toggleSaveUniversity = (uni) => {
    setSavedUniversities((prev) => {
      const exists = prev.find((u) => u.id === uni.id);
      if (exists) {
        return prev.filter((u) => u.id !== uni.id);
      }
      return [...prev, uni];
    });
  };

  const isUniversitySaved = (id) => {
    return savedUniversities.some((u) => u.id === id);
  };

  const saveResult = (result) => {
    setSavedResults((prev) => {
      const exists = prev.findIndex((r) => r.id === result.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = result;
        return updated;
      }
      return [...prev, result];
    });
  };

  const removeResult = (id) => {
    setSavedResults((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => {
    setSavedUniversities([]);
    setSavedResults([]);
  };

  return (
    <SavedContext.Provider
      value={{
        savedUniversities,
        savedResults,
        toggleSaveUniversity,
        saveResult,
        removeResult,
        clearAll,
        isUniversitySaved,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}
