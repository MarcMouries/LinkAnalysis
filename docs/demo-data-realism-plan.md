# Demo Data — Realism Audit & Plan

Audit of the sample data in the Command Center against the CHRI / NIEM / NLETS
model (see [`chri-data-model-reference.md`](chri-data-model-reference.md)), and a
prioritized plan to make it more realistic. Sample data lives in:
`command-center.html` (POLE graph `RAW` + rap sheets `RAP`), `examples/pole-graph.js`,
`src/data-adapter.js` (POLE vocabularies), `src/pole-presets.js` (icons/styling).

## Audit — current vs. standard

### Rap sheet (`RAP`)
| Segment | Current | Standard (NIEM/NLETS) | Gap |
|---------|---------|-----------------------|-----|
| Identification | name, aka, dob, sex, race, ht, wt, eyes, hair, marks, **sid**, **fbi** | + UCN, CDC#, birthplace, ethnicity, DCN, PurposeCode | missing UCN/DCN/purpose/birthplace |
| Cycle | date, agency (name), arrest **no** | + agency **ORI**, **CourtAction** (court, docket, **disposition date**) | no ORI, no court/docket/disp-date |
| Charge | `stat` (desc), `sev`, `cls`, `disp`, `sent` | + **NCIC offense code**, **statute citation**, counts | no NCIC code, no statute cite |

`cls` values (`F/C`, `M/A`) are actually plausible NY penal-law classes — keep, but
pair each charge with an NCIC code + statute citation.

### POLE graph (`RAW`)
| Class | Current | Gap |
|-------|---------|-----|
| person | id, name, is_subject, rel | no SID/FBI/DOB on the node |
| location | free-text name ("3260 Jay St") | no structured street/city/state/ZIP |
| vehicle | "Plate ABC-123", "MV Kingfisher" | no plate-state / VIN / year-make-model |
| org/account | name only | no account #, EIN, routing |
| edges | family/associate/address/arrest/other | coarse — no spouse/sibling, co-defendant, registered-owner qualifiers |

### Adapter (`src/data-adapter.js`)
- `POLE_NODE_TYPES` = person, location, rap_sheet, vehicle, case (showcase adds `org`).
- `POLE_EDGE_TYPES` = family, associate, address, arrest, other.
- `rap_sheet` is modeled as a *node type* (an event); NIEM models arrests as
  Arrest/Charge events and the rap sheet as the person's aggregated cycles.

## Plan (prioritized)

**P1 — Rap sheet realism (document-grounded, highest value) — _implemented in this pass_**
- Per charge: add `ncic` (NCIC offense code) + `statute` (state citation); keep
  `stat`/`sev`/`cls`/`disp`/`sent`.
- Per agency: add `ori` (9-char). Per cycle: add `court`, `docket`, `dispDate`.
- Identification: add `ucn`, `dcn`, `purpose`, `pob` (birthplace).
- Render all of it in the rap-sheet viewer (both Console and Document modes).

**P2 — Node identifiers — _implemented_**
- Every object/location node carries a structured `info` block, shown as an
  **Identifiers** panel in the dossier: vehicle `{plate, VIN, year, make/model}`,
  weapon `{type, serial}`, phone `{MSISDN, IMEI, carrier}`, account `{acct#, bank,
  routing}`, organization `{form, EIN, agent}`, address `{street, city, state, ZIP}`,
  premises `{type, street, city}`, events `{date, agency, arr#}`, case `{docket, court}`.
- Person nodes link to their rap sheet — their `SID / FBI / DOB` show in the dossier.

**P-taxonomy — richer POLE classes — _implemented_**
- The graph and the "Entity Classes" rail are now grouped by the POLE model with
  multiple sub-classes each: **People** (Person); **Objects** (Vehicle, Weapon,
  Phone, Account, Organization); **Locations** (Address, Premises); **Events**
  (Arrest, Seizure, Court Case). Added weapon/phone entities so each class is populated.

**P-codes — real NCIC charge codes — _implemented_**
- All charges use verified NCIC offense codes (see
  [`ncic-offense-codes.md`](ncic-offense-codes.md)); corrected the earlier guesses —
  weapons → **5212** (52xx), forgery → **2589** (25xx), money-laundering → **6300** (63xx).

**P3 — Relationship vocabulary**
- Edge sub-qualifiers: family→{spouse, sibling, parent, child}; associate→{known-associate, co-defendant}; other→{registered-owner, frequents, named-in}. Display the qualifier on the edge label / dossier.

**P4 — Adapter alignment**
- Extend `validatePOLEData` to accept (and lightly validate) the richer fields; add
  a `POLE_NODE_TYPES` note mapping each type to its NIEM element
  (person→`nc:Person`, location→`nc:Location`, vehicle→`nc:Vehicle`,
  rap_sheet→`rap:RapSheetCycle`/`j:Arrest`, case→`j:Case`, org→`nc:Organization`).

**P5 — Provenance / message header**
- Carry a `table`/source per entity (adapter already has `table`), and a rap-sheet
  message header (originating/destination ORI, DCN, purpose, III status, caveat).

## NCIC / statute mapping used in the sample

| Offense (desc) | NCIC | NY statute (illustrative) | Severity |
|----------------|------|---------------------------|----------|
| Burglary (forced entry, resid.) | 2202 | PL 140.25 | Felony C |
| Robbery (street) | 1204 | PL 160.10 / 160.15 | Felony B/C |
| Larceny — from auto | 2305 | PL 155.30 | Felony E |
| Cocaine — sell | 3530 | PL 220.39 | Felony B |
| Marijuana — possess | 3562 | PL 221.10 | Misd A |
| Weapons (possession) | 1500 | PL 265.03 | Felony C |
| Forgery | 1000 | PL 170.10 | Felony D |
| Fraud / money-laundering | 2600 | PL 470.10 | Felony C |

(Codes are public illustrative values — see the reference note on NCIC sub-codes.)
