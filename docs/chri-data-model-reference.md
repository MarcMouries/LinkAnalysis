# CHRI / Rap Sheet Data Model — Reference

Public-standards research to ground the demo data in how real Criminal History
Record Information (CHRI) is modeled and exchanged. Nothing here is real PII —
it's used to make the *fictional* sample data structurally realistic.

## Standards landscape

- **NIEM** (National Information Exchange Model) — the federal XML standard for
  justice information exchange. The **Justice** domain (`j:`, formerly GJXDM/JXDM)
  plus **NIEM Core** (`nc:`) supply the person, charge, arrest and disposition
  structures. Code sets live in domains like **`ncic:`**.
- **NLETS** (International Justice & Public Safety Network) — the interstate
  message switch. Criminal-history transactions use message keys:
  - `IQ` / `IR` — Interstate Identification Index (III) inquiry / response
  - `FQ` / `FR` — fingerprint-based inquiry / response
  - `AQ` / `AR` — administrative / supplemental
  - `CR` — criminal-history (rap sheet) response  ← *the provided sample XML*
  - `PFR` / `PII` — newer parsed-response keys
- **Rap-sheet standardization** — the **Joint Task Force on Rapsheet
  Standardization** defined a NIEM-conformant rap-sheet schema; NLETS'
  **CHIEF** (Criminal History Information Exchange Format) and **CHRIS** projects
  transition legacy text rap sheets into that XML.
- **Authoritative transmission spec** — SEARCH's *Interstate Criminal History
  Transmission Specification (XML v3.00)* is the reference exchange format.

## Rap sheet structure (NLETS RapSheet 1.0, from the sample XML)

```
RapSheet
├─ Metadata            (Version, TripleIStatusText = "Multi-state")
├─ Introduction
│  ├─ Caveat           (RESTRICTED … / issuing authority / date)
│  └─ RapSheetRequest  (PurposeCode = C, State Fingerprint ID)
├─ RapSheetPerson      (the subject — identification segment)
│  ├─ PersonName + PersonAlternateName (aliases)
│  ├─ PersonBirthDate(s), PersonBirthLocation
│  ├─ Physical: Sex, Race, Ethnicity, Eye/Hair colour, Height, Weight,
│  │            PhysicalFeature (e.g. "TAT R ARM")
│  └─ Identifications:
│        FBIIdentification (FBI # / UCN)
│        StateFingerprintIdentification (SID)
│        CorrectionsIdentification (CDC #)
├─ Court(s) / Agency(s)   (OrganizationName + ORI)
└─ RapSheetCycle(s)       (one per arrest event)
   ├─ CycleEarliestDate
   ├─ Arrest
   │  ├─ ActivityDate, ActivityDescriptionText ("ARREST/DETAINED/CITED")
   │  ├─ ArrestAgencyRecordIdentification (agency arrest #)
   │  ├─ ArrestCharge …
   │  │   ├─ ChargeDescriptionText
   │  │   ├─ ChargeSeverityText   (Felony / Misdemeanor / Other)
   │  │   └─ ChargeStatute
   │  │       ├─ StatuteText                (e.g. "BURGLARY")
   │  │       ├─ StatuteOffenseIdentification (NCIC offense code)
   │  │       └─ StatuteCodeIdentification    (state statute citation)
   │  └─ ArrestSubject (SubjectFullName)
   ├─ CourtAction / CourtCharge → ChargeDisposition
   │       (DispositionDescriptionText, DispositionDate, Court reference)
   └─ Sentencing → Sentence (SentenceDescriptionText)
```

## Identifiers

| Identifier | What it is | Example format |
|-----------|------------|----------------|
| **FBI # / UCN** | FBI number / Universal Control Number | `665248LA9` |
| **SID** | State Identification Number (per state) | `NY 04821563 Q` |
| **ORI** | Originating Agency Identifier (9 chars) | `NY0510000` |
| **CDC #** | Corrections/inmate id | `CDC-P088888` |
| **DCN** | Document Control (message) number | `44EF12QR` |
| **PurposeCode** | why the record was requested | `C` (criminal justice) |

## Code sets

- **NCIC offense codes** (`ncic:OFFCodeSimpleType`) — 4-digit numeric, hierarchical
  (category codes end in `00`; `99` = "other/general" in a category). Verified
  public examples:

  | Code | Offense |
  |------|---------|
  | 0911 | Homicide — willful kill (gun) |
  | 1101 | Rape (gun) |
  | 1204 | Robbery — street (gun) |
  | 1304 | Aggravated assault — nonfamily (gun) |
  | 2202 | Burglary — forced entry, residential |
  | 2305 | Larceny — from auto |
  | 2404 | Vehicle theft |
  | 2610 | Identity theft |
  | 3530 | Cocaine — sell |
  | 3562 | Marijuana — possess |
  | 3571 | Amphetamine — sell |
  | 1000 | Forgery / counterfeiting (category) |
  | 1200 | Embezzlement (category) |
  | 1500 | Weapons (category) |

- **Charge severity** (`j:ChargeSeverityText`): `Felony` / `Misdemeanor` / `Other`,
  usually paired with a state **class** (NY penal-law: Felony A–E, Misdemeanor A/B).
- **Dispositions** (from the sample XML): `CONVICTED COMMITTED TO PRISON`,
  `CONVICTED-JAIL`, `CONVICTED-PROBATION`, `DISCHARGED`, `EXTRADITED`,
  `PROS REL-DET ONLY-LACK OF SUFF EVID`, `REL/DET ONLY/ADMISS EVIDENCE INSUFF`.
- **Sentences** (from the sample XML): `010 YEARS PRISON`, `365 DAYS JAIL`,
  `003 YEARS PROBATION`.

## Sources

- Provided samples: `rap-sheet-sample.xml` (NLETS RapSheet 1.0, a `CR` response),
  `Sample_NY_DCJS_RAP_Sheet.pdf` (NY DCJS layout).
- [NLETS CHRI/CCH support folder](https://service.nlets.org/support/solutions/folders/21000126455)
- [NLETS — Criminal History Parser](https://nlets.org/about/criminal-history-parser) ·
  [CHRIS Fact Sheet (2024)](https://nlets.org/sites/nlets/files/2024-10/CHRIS%20Fact%20Sheet%2007.2024.pdf)
- [SEARCH — Interstate Criminal History Transmission Specification, XML v3.00](https://www.search.org/files/pdf/CH_transmission_spec.pdf)
- [NIEM — `ncic:OFFCodeSimpleType`](https://niem.github.io/model/5.0/ncic/OFFCodeSimpleType/) ·
  [NIEM — `j:Charge`](https://niem5.org/wayfarer/j/Charge.html)
- [NCIC Code Manual (OJP)](https://www.ojp.gov/ncjrs/virtual-library/abstracts/national-crime-information-center-ncic-code-manual-second-edition)
- [JRSA — NLETS & rap-sheet standardization](https://www.jrsa.org/pubs/forum/articles/nlets.html) ·
  [WA State RAPsheet & FBI (III) overview](https://www.wsp.wa.gov/wp-content/uploads/2022/04/RAPsheet-Training-and-Reference-Manual.pdf)

> **Note on codes:** the NCIC codes above are illustrative public examples. Exact
> operational sub-codes come from the FBI **NCIC Code Manual** (law-enforcement
> distribution). Demo values are chosen to be *plausible*, not authoritative.
