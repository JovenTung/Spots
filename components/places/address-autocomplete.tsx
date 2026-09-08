"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, CircleNotch } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  retrieveAddress,
  suggestAddresses,
  type AddressSuggestion,
  type ResolvedAddress,
} from "@/lib/mapbox";

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onResolve: (resolved: ResolvedAddress) => void;
  placeholder?: string;
};

/** Debounced Mapbox Search Box autocomplete (finds POIs by name too). */
export const AddressAutocomplete = ({
  value,
  onChange,
  onResolve,
  placeholder = "Search a place or address…",
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sessionToken = useRef<string>(crypto.randomUUID());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only clears the pending debounce on unmount — searching is driven by
  // the input's onChange, not by an effect, so programmatic value changes
  // (e.g. prefill from the Instagram import) never trigger a search.
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const handleInputChange = (next: string) => {
    onChange(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const results = await suggestAddresses(next, sessionToken.current);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setIsLoading(false);
    }, 300);
  };

  const handleSelect = async (suggestion: AddressSuggestion) => {
    setIsOpen(false);
    setIsLoading(true);
    const resolved = await retrieveAddress(
      suggestion.mapboxId,
      sessionToken.current,
    );
    setIsLoading(false);
    // A retrieve ends the Search Box billing session; start a fresh one.
    sessionToken.current = crypto.randomUUID();
    if (resolved) {
      onResolve(resolved);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-12 pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isLoading ? (
            <CircleNotch size={18} className="animate-spin" />
          ) : (
            <MapPin size={18} />
          )}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md"
          >
            {suggestions.map((suggestion) => (
              <li key={suggestion.mapboxId}>
                <button
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors active:bg-muted"
                >
                  <MapPin
                    size={16}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {suggestion.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {suggestion.fullAddress}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
