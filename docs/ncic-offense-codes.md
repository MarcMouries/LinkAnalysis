# NCIC Offense (Charge) Codes — Reference

The FBI **NCIC offense codes** (`ncic:OFFCodeSimpleType` in NIEM) are the 4-digit
uniform charge codes used on criminal-history records. They are **hierarchical**:
the first two digits are the category; a code ending in **`99`** is the generic
"other/unspecified" for that category. Every charge in the demo data uses a code
from this table paired with an (illustrative) NY Penal Law citation.

> Codes below are verified against public sources (see **Sources**). Exact
> operational sub-codes are published in the FBI **NCIC Code Manual**
> (law-enforcement distribution); the demo uses plausible public values.

## Official documentation — where the charge codes come from

There are three levels of authority:

1. **The official source — FBI CJIS *NCIC Code Manual*** (the "Uniform Offense
   Classifications" / **OFF** field). This is the authoritative register, maintained
   by the FBI Criminal Justice Information Services (CJIS) Division. It is **CJIS /
   law-enforcement restricted** — not freely published in full. Agencies obtain it
   through their CJIS Systems Agency (CSA); see the FBI CJIS NCIC page
   (<https://le.fbi.gov/informational-tools/ncic>) and the OJP abstract linked below.

2. **The official *public* machine-readable version — NIEM `ncic:OFFCodeSimpleType`.**
   NIEM is the federally-governed exchange model; its `ncic` domain publishes the
   NCIC offense-code enumeration derived from the manual. This is the authoritative
   source that *is* public, and it is what this reference and the demo use:
   <https://niem.github.io/model/5.0/ncic/OFFCodeSimpleType/>
   (also browsable via the NCSC Wayfarer code tables).

3. **Public mirrors — state "Uniform Offense Code" lists.** State agencies (e.g.
   Oregon State Police, Sacramento PD) republish the NCIC codes as public PDFs; handy
   for cross-checking. Linked under **Sources**.

The rap-sheet *exchange format* (how these codes travel between states) is defined by
NLETS/NIEM and SEARCH's *Interstate Criminal History Transmission Specification* —
see [`chri-data-model-reference.md`](chri-data-model-reference.md).

## Codes used in the demo

| NCIC | Offense | NY statute (illustrative) | Used by |
|------|---------|---------------------------|---------|
| **2202** | Burglary — forced entry, residential | PL 140.25 | Fox (2020) |
| **2305** | Larceny — from auto | PL 155.25 / 155.30 | Fox (2020), Vale (2018) |
| **1204** | Robbery — street (gun) | PL 160.10 / 160.15 | Vale (2020), Reed (2011) |
| **3530** | Cocaine — sell | PL 220.39 | Reed (2019), Diaz (2019) |
| **3562** | Marijuana — possess | PL 221.10 | Fox (2016) |
| **5212** | Weapon — possession | PL 265.03 | Reed (2022) |
| **2589** | Forgery | PL 170.05 | Sloan (2004) |
| **6300** | Money laundering | PL 470.10 | Sloan (2021) |

## Reference — categories & codes (verified)

| Category | Codes |
|----------|-------|
| Homicide (09) | 0911 willful kill–gun |
| **Robbery (12)** | 1201 business–gun · 1202 business–weapon · 1204 street–gun · 1205 street–weapon · 1207 resid–gun · 1208 resid–weapon · 1299 robbery |
| Assault (13) | 1304 aggrav assault, nonfamily–gun |
| Arson (20) | 2001 arson–business |
| **Burglary (22)** | 2202 forced entry, resid · 2299 burglary |
| **Larceny (23)** | 2303 shoplifting · 2305 from auto · 2399 larceny |
| **Stolen vehicle (24)** | 2404 vehicle theft · 2409 interstate transport · 2499 stolen vehicle |
| **Forgery / counterfeiting (25)** | 2501 forgery of checks · 2502 forgery of · 2503 counterfeiting of · 2589 forgery · 2599 counterfeiting |
| **Fraud (26)** | 2601 confidence game · 2609 computer fraud/abuse · 2610 identity theft · 2699 fraud |
| **Dangerous drugs (35)** | 3510 heroin–sell · 3512 heroin–possess · 3530 cocaine–sell · 3532 cocaine–possess · 3560 marijuana–sell · 3562 marijuana–possess · 3571 amphetamine–sell |
| Perjury (50) | 5003 perjury |
| **Weapons (52)** | 5202 carrying concealed · 5203 carrying prohibited · 5212 possession · 5214 selling · 5217 trafficking · 5299 weapon offense |
| **Trespass (57)** | 5707 trespassing |
| **Money laundering (63)** | 6300 money laundering |
| Human trafficking (64) | 6411 human trafficking |

## Related code sets

- **Charge severity** (`j:ChargeSeverityText`): Felony / Misdemeanor / Other, paired
  with a state class (NY: Felony A–E, Misdemeanor A/B).
- **Disposition** (from the NLETS RapSheet XML): CONVICTED COMMITTED TO PRISON,
  CONVICTED-JAIL, CONVICTED-PROBATION, DISCHARGED, EXTRADITED,
  PROS REL-DET ONLY-LACK OF SUFF EVID, REL/DET ONLY/ADMISS EVIDENCE INSUFF.
- **Sentence**: 010 YEARS PRISON, 365 DAYS JAIL, 003 YEARS PROBATION.

## Sources

- [NIEM — `ncic:OFFCodeSimpleType`](https://niem.github.io/model/5.0/ncic/OFFCodeSimpleType/) (the code enumeration)
- [NCSC Wayfarer — `ncic:OFFType`](https://apps.ncsc.org/wayfarer1.9/codetables/OFFType.asp)
- [FBI NCIC Code Manual (OJP abstract)](https://www.ojp.gov/ncjrs/virtual-library/abstracts/national-crime-information-center-ncic-code-manual-second-edition)
- [City of Sacramento — Uniform Offense Codes (public list)](https://www.cityofsacramento.gov/content/dam/portal/police/crime---safety/ucrcodes.pdf)
- [Oregon State Police — Uniform Offense Data Codes](https://www.oregon.gov/osp/Docs/UniformOffenseCodes_Codes.pdf)
- [ICAOS — NCIC offense codes in ICOTS](https://support.interstatecompact.org/hc/en-us/articles/360046201293-What-NCIC-Offense-Codes-are-used-in-ICOTS)
