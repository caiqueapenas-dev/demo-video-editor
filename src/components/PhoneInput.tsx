import { useState, useEffect } from "react";
import { IMaskInput } from "react-imask";
import { getCode, getNames } from "country-list";

interface PhoneInputProps {
  value: { ddi: string; number: string };
  onChange: (value: { ddi: string; number: string }) => void;
}

// Mapeamento manual para códigos de DDI. A biblioteca 'country-list' não fornece isso.
// Esta é uma lista reduzida. Idealmente, isso viria de uma biblioteca mais completa.
const ddiMap: Record<string, string> = {
  BR: "55",
  US: "1",
  PT: "351",
  GB: "44",
  DE: "49",
  FR: "33",
  ES: "34",
  IT: "39",
  JP: "81",
  // Adicione mais países conforme necessário
};

// Gerar lista de países para o dropdown
const countryOptions = getNames()
  .map((name: string) => {
    const code = getCode(name);
    if (code && ddiMap[code]) {
      return {
        name: `${name} (+${ddiMap[code]})`,
        value: ddiMap[code],
        code: code,
      };
    }
    return null;
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (!a || !b) return 0; // Trata valores nulos
    return a.name.localeCompare(b.name);
  });

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [ddi, setDdi] = useState(value.ddi || "55"); // Default to Brazil
  const [number, setNumber] = useState(value.number || "");

  useEffect(() => {
    onChange({ ddi, number });
  }, [ddi, number]);

  const handleNumberChange = (val: string) => {
    // Remove a máscara antes de salvar no estado
    const unmaskedValue = val.replace(/\D/g, "");
    setNumber(unmaskedValue);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={ddi}
        onChange={(e) => setDdi(e.target.value)}
        className="px-4 py-2 border rounded-lg bg-white"
      >
        {countryOptions.map((option) => {
          if (!option) return null; // Trata valores nulos
          return (
            <option key={option.code} value={option.value}>
              {option.name}
            </option>
          );
        })}
      </select>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          +{ddi}
        </span>
        <IMaskInput
          mask="00 00000-0000"
          value={number}
          onAccept={handleNumberChange}
          placeholder="11 91234-5678"
          className="w-full px-4 py-2 border rounded-lg pl-12" // Padding left para o DDI
        />
      </div>
    </div>
  );
}
