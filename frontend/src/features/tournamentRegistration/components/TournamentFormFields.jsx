// +------------------------------------------------------------------+
// |                  TournamentFormFields.jsx                         |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * TournamentFormFields.jsx - Versenyregisztrációs űrlap mezők
 * =====================================================================
 *
 * Funkcio:
 * - Versenyregisztrációs űrlap mezőinek megjelenítése
 * - Feltételes mezők logikája (cégnév, adószám)
 *
 * Felelosseg:
 * - Form mezők renderelése
 * - Validációs hibák megjelenítése
 * - Help textek kezelése
 */

import React, { useState } from "react";
import TournamentField from "./TournamentField.jsx";

export default function TournamentFormFields({
  teamName,
  setTeamName,
  email,
  setEmail,
  telNumber,
  setTelNumber,
  companyName,
  setCompanyName,
  taxNumber,
  setTaxNumber,
  address,
  setAddress,
  billingName,
  setBillingName,
}) {
  const [registrationType, setRegistrationType] = useState("personal");

  const isCompany = registrationType === "company";
  const isAssociation = registrationType === "association";

  return (
    <div className="space-y-6">
      {/* Alap mezők */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TournamentField
          label="Csapatnév"
          value={teamName}
          onChange={setTeamName}
          placeholder="pl. SMASH Duo"
        />

        <TournamentField
          label="Email *"
          value={email}
          onChange={setEmail}
          placeholder="pl. valaki@gmail.com"
          required
        />

        <TournamentField
          label="Telefonszám *"
          value={telNumber}
          onChange={setTelNumber}
          placeholder="pl. +36 30 123 4567"
          required
        />
      </div>

      {/* Számlázási típus választó */}
      <div className="space-y-3">
        <label className="block text-sm font-extrabold text-slate-700">
          Nevezés típusa *
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setRegistrationType("personal")}
            className={`px-4 py-3 text-sm font-extrabold rounded-2xl border-2 transition-all ${
              registrationType === "personal"
                ? "border-lightBlue bg-lightBlue text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            🧑‍💼 Személyes
          </button>
          <button
            type="button"
            onClick={() => setRegistrationType("company")}
            className={`px-4 py-3 text-sm font-extrabold rounded-2xl border-2 transition-all ${
              registrationType === "company"
                ? "border-lightBlue bg-lightBlue text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            🏢 Cég
          </button>
          <button
            type="button"
            onClick={() => setRegistrationType("association")}
            className={`px-4 py-3 text-sm font-extrabold rounded-2xl border-2 transition-all ${
              registrationType === "association"
                ? "border-lightBlue bg-lightBlue text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            🏛️ Egyesület
          </button>
        </div>
      </div>

      {/* Számlázási információk */}
      <div className="space-y-4">
        <label className="block text-sm font-extrabold text-slate-700">
          Számlázási adatok
        </label>
        
        {/* Számlázási név - mindig kötelező */}
        <TournamentField
          label="Számlázási név *"
          value={billingName}
          onChange={setBillingName}
          placeholder={
            isCompany 
              ? "pl. Sport Kft." 
              : isAssociation 
              ? "pl. Strand Sport Egyesület"
              : "pl. Kovács János"
          }
          required
          helpText={
            !isCompany && !isAssociation 
              ? "A nevezéshez szükséges a teljes név a számlázáshoz"
              : "A számlázáshoz szükséges név"
          }
        />

        {/* Céges/Egyesületi mezők */}
        {(isCompany || isAssociation) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TournamentField
              label={isCompany ? "Cégnév *" : "Egyesület neve *"}
              value={companyName}
              onChange={setCompanyName}
              placeholder={isCompany ? "pl. Sport Kft." : "pl. Strand Sport Egyesület"}
              required={isCompany || isAssociation}
            />

            <TournamentField
              label="Adószám *"
              value={taxNumber}
              onChange={setTaxNumber}
              placeholder="pl. 12345678-1-42"
              required={isCompany || isAssociation}
              helpText="Cégek és egyesületek számára kötelező"
            />
          </div>
        )}

        {/* Cím - mindig kötelező */}
        <TournamentField
          label="Számlázási cím *"
          value={address}
          onChange={setAddress}
          placeholder="pl. 1111 Budapest, Fő utca 1."
          required
          helpText="A számlázáshoz szükséges cím"
        />
      </div>

      {/* Info box */}
      <div className="p-4 text-sm font-extrabold border border-slate-200 rounded-2xl bg-slate-50 text-slate-700">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="font-semibold">Számlázási információk</p>
            <p className="mt-1 text-xs text-slate-600">
              A megadott adatok alapján állítjuk ki a számlát a nevezési díjról. 
              Kérjük, gondosan ellenőrizd a megadott információkat!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}