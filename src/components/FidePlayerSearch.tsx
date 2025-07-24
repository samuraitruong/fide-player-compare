import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFideData } from "@/hooks/useFideData";
import React, { useState, useEffect } from "react";


interface FidePlayerSearchProps {
  onSelect: (player: { fideId: string; name: string }) => void;
  inputClassName?: string;
  dropdownClassName?: string;
  itemClassName?: string;
}


export function FidePlayerSearch({ onSelect, inputClassName = '', dropdownClassName = '', itemClassName = '' }: FidePlayerSearchProps) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedInput = useDebouncedValue(input, 400);
  const { fideData, loading, error, search } = useFideData(debouncedInput);

  useEffect(() => {
    if (debouncedInput) {
      search(debouncedInput);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [debouncedInput, search]);

  const handleSelect = (player: { fideId: string; name: string }) => {
    onSelect(player);
    setInput("");
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        placeholder="Search FIDE player..."
        onChange={e => setInput(e.target.value)}
        className={inputClassName}
        onFocus={() => { if (debouncedInput) setShowDropdown(true); }}
      />
      {loading && <div className="mt-2 text-sm text-gray-500">Searching...</div>}
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      {showDropdown && debouncedInput && fideData.length > 0 && (
        <ul className={dropdownClassName}>
          {fideData.map((p) => (
            <li
              key={p.fideId}
              className={itemClassName}
              onClick={() => handleSelect({ fideId: p.fideId, name: p.name })}
            >
              {p.name} ({p.fideId}) {p.federation && `[${p.federation}]`}
            </li>
          ))}
        </ul>
      )}
      {showDropdown && debouncedInput && !loading && fideData.length === 0 && (
        <div className="mt-2 px-4 py-2 text-gray-400">No players found</div>
      )}
    </div>
  );
}
