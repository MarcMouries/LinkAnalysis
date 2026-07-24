# Relationship (Edge) Vocabulary

Link analysis is only as good as its *relationships*. This is the controlled
vocabulary the demo uses for edges — a small set of **relationship types** (which
drive colour/style and the "Relationships" filter) each with finer **qualifiers**
(the specific tie shown on the edge label and in the dossier as *Type · Qualifier*).

Roughly mapped to NIEM association concepts (`nc:*Association`, `j:*`).

| Type | Colour / style | Qualifiers (used in the demo) | NIEM analogue |
|------|----------------|-------------------------------|---------------|
| **Family** | blue, solid | Spouse (Wife), Sibling (Brother), Parent, Child | `nc:PersonKinAssociation` / `nc:FamilyMember` |
| **Associate** | green, solid | Known associate (Crew), Co-defendant, Handler, Counsel, Contact, Payments, Informant | `nc:PersonAssociation` |
| **Located at** *(address)* | amber, solid | Residence (Home / Lived at), Frequents, Meets at, Operates, Stays at / Sighted, Stored, Seen at | `nc:PersonResidenceAssociation`, `nc:Location` |
| **Charge tie** *(arrest)* | red, dashed | Arrested, Co-defendant, Booking, Seizure, Charge | `j:Arrest`, `rap:ArrestSubject` |
| **Other** | grey, dotted | Registered owner / Owner, Uses, Director, Controls, Funds, Named in, Flagged in, Recovered, Phone, Vehicle | `nc:PropertyOwnershipAssociation`, `j:*` |

## Notes

- **Type vs. entity class.** "Located at" and "Charge tie" are *relationship* types;
  they are deliberately named differently from the *entity* classes **Address** and
  **Arrest** (People / Objects / Locations / Events) so the two filter lists don't
  read as duplicates. See [`demo-data-realism-plan.md`](demo-data-realism-plan.md).
- **Qualifier is the fine grain.** The edge `type` gives the coarse class (colour +
  filter); the edge `label` carries the precise qualifier ("Co-defendant", "Wife",
  "Registered owner"). The dossier shows both: **Family · Wife**, **Charge tie ·
  Co-defendant**.
- **Directionality.** Edges are drawn undirected for layout, but qualifiers imply
  direction (a *person* is *registered owner of* a *vehicle*; a *person* is
  *co-defendant with* another on an *arrest*). A future pass could store an explicit
  direction on each edge.
- **Filtering.** The console's **Relationships** rail toggles each type on/off — e.g.
  isolate only *Family* ties, or hide everything but *Charge tie* to see the arrest
  network. This is the edge analogue of the POLE entity-class filter.

## Analyst use

Combining the two filters answers real questions:
- *Family* only → the kinship core around the subject.
- *Charge tie* only → who is co-charged with whom (arrest/seizure network).
- *Located at* only → the shared-premises pattern (which parties frequent the same
  places — a common bridge between otherwise-separate groups).
- *Associate* only → the crew/handler/counsel structure and brokers.
