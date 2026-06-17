/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Check, MapPin } from "lucide-react";

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  suggestions: string[];
}

export default function AutocompleteInput({
  label,
  value,
  onChange,
  placeholder,
  suggestions,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Collect and filter suggestions
    // Filter duplicates and empty values
    const uniqueSuggestions = Array.from(
      new Set(suggestions.filter((s) => s && s.trim() !== ""))
    );

    if (value.trim() === "") {
      setFilteredSuggestions(uniqueSuggestions);
    } else {
      const filtered = uniqueSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [value, suggestions]);

  // Close suggestion dropdown clicking elsewhere
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative font-sans text-left" ref={dropdownRef}>
      <label className="block text-slate-500 font-bold mb-1.5 uppercase text-[10px]">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none rounded-lg px-3 py-2 text-white text-xs pr-8"
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 font-bold text-sm leading-none p-1 transition-colors cursor-pointer"
            type="button"
            title="Hapus filter"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-[100] mt-1 w-full max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg shadow-2xl py-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredSuggestions.map((suggestion, idx) => {
            const isMatch = value.toLowerCase() === suggestion.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(suggestion);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-900 text-slate-300 hover:text-white transition-all text-xs flex items-center justify-between gap-2 border-b border-slate-900/40 last:border-0 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </div>
                {isMatch && (
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
