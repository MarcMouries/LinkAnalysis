# Command Center — Investigation Scenario

Reference brief for the scenario built into `command-center.html` (the flagship
POLE link-analysis console). Use it to review or extend the demo dataset.

## Premise

Two criminal crews — the **Fox** crew and the **Reed** crew — read like two
separate cases. They share **no direct tie**. Link analysis exposes that they are
one network, connected through **shared resources, a shared lawyer, and a broker
who launders money through a shell company**.

The console makes the analyst *earn* that finding: it opens with only the subject
(**Eric Fox**) visible, and the connection to **Marcus Reed** is revealed only
once the analyst's own expansions complete a path between them.

- **29 entities**, **42 relationships**, **6 POLE classes** (Person, Location,
  Vehicle, Record, Case, Org/Account).
- **Primary subject:** Eric Fox · **Secondary POI:** Marcus Reed · **Broker:** Vic Sloan.

---

## Cast (entities)

### People (12)
| ID | Name | Role |
|----|------|------|
| S | **Eric Fox** | Primary subject |
| jane | Jane Fox | Spouse |
| sam | Sam Fox | Sibling |
| rick | Rick Vale | Crew · Fox |
| dana | Dana Cole | Crew · Fox |
| leo | Leo Marsh | Crew · Fox |
| vic | **Vic Sloan** | Broker (bridge) |
| marcus | **Marcus Reed** | POI · 2nd crew |
| omar | Omar Diaz | Crew · Reed |
| priya | Priya Nair | Crew · Reed |
| karen | Karen Webb | Counsel (bridge) |
| neil | Neil Dunn | Informant |

### Locations (7)
| ID | Name | Note |
|----|------|------|
| home | 3260 Jay St | Fox residence |
| nova | Nova Motel | **Shared meet point (Rick + Omar)** |
| pier | Pier 42 Whse | Reed operations |
| harbor | 88 Harbor Rd | Sloan residence |
| yard | Rust Yard | Shared meet point (Fox crew + Sloan) |
| store | Bay Storage 14 | Van storage |
| club | The Blue Room | Shared haunt (Sloan + Reed crew) |

### Vehicles (3)
| ID | Name | Note |
|----|------|------|
| car | Plate ABC-123 | Fox vehicle |
| boat | MV Kingfisher | Reed vessel |
| van | Van XJ-7741 | **Shared use (Rick + Omar)** |

### Records / events (4)
| ID | Name | Note |
|----|------|------|
| ar20 | Arrest 2020-01 | Fox + Rick, co-defendants |
| ar19 | Arrest 2019-07 | Reed + Omar, co-defendants |
| bk21 | Booking 2021 | Sloan |
| sz22 | Seizure 2022 | At Pier 42 |

### Cases / orgs (3)
| ID | Name | Note |
|----|------|------|
| case | Case #4471 | Primary case |
| hh | Harbor Holdings | **Shell company (Sloan + Reed directors)** |
| acct | Account 7731 | Financial account funneling money |

---

## Relationships (42 edges)

**Fox family & crew**
- Eric → Jane *(family, Wife)*, Eric → Sam *(family, Brother)*, Sam → 3260 Jay St *(address)*
- Eric → Rick / Dana / Leo *(associate, Crew)*, Rick → Dana *(associate)*, Leo → Rust Yard *(address)*

**Fox resources & records**
- Eric → 3260 Jay St *(address)*, Eric → Plate ABC-123 *(vehicle)*, Eric → Rust Yard *(address)*
- Eric → Arrest 2020-01 *(arrest)*, **Rick → Arrest 2020-01 *(co-defendant)***, Eric → Case #4471

**Bridges (the reveal)**
- **Rick → Nova Motel** & **Omar → Nova Motel** *(shared motel)*
- **Rick → Van XJ-7741** & **Omar → Van XJ-7741** *(shared van)* → Van → Bay Storage 14
- **Karen Webb → Eric** & **Karen Webb → Marcus** *(shared counsel)*

**Broker (Vic Sloan)**
- Vic → Rust Yard, Vic → Rick *(payments)*, Vic → Marcus *(handler)*
- Vic → Harbor Holdings *(director)* & Marcus → Harbor Holdings *(director)*
- Vic → 88 Harbor Rd, Vic → Booking 2021, Vic → Account 7731 *(controls)*, Vic → The Blue Room

**Money trail**
- Harbor Holdings → Account 7731 *(funds)* → Account 7731 → Case #4471 *(flagged in)*

**Reed crew**
- Marcus → Omar / Priya *(associate)*, Marcus → Pier 42, Marcus → MV Kingfisher
- Marcus → Arrest 2019-07, **Omar → Arrest 2019-07 *(co-defendant)***, Marcus → Seizure 2022
- Marcus → The Blue Room, Priya → The Blue Room, Neil → Omar *(informant)*

---

## Cross-referenced (shared) resources

A non-person entity linked to **2+ distinct people** is a shared resource — the
console flags these with a dashed ring and a "Cross-referenced" dossier callout.

| Entity | Shared by |
|--------|-----------|
| Rust Yard | Eric, Leo, Vic *(3)* |
| The Blue Room | Vic, Marcus, Priya *(3)* |
| Nova Motel | Rick, Omar *(2)* |
| Van XJ-7741 | Rick, Omar *(2)* |
| Harbor Holdings | Vic, Marcus *(2)* |
| 3260 Jay St | Eric, Sam *(2)* |
| Arrest 2020-01 | Eric, Rick *(2)* |
| Arrest 2019-07 | Marcus, Omar *(2)* |

---

## The hidden link: Eric Fox ⟷ Marcus Reed

No direct edge. Multiple discoverable paths, shortest wins in the reveal:

| Path | Hops | Bridge |
|------|-----:|--------|
| Eric → **Karen Webb** → Marcus | 2 | Shared counsel |
| Eric → Rick → **Vic Sloan** → Marcus | 3 | Broker |
| Eric → Rick → **Nova Motel** → Omar → Marcus | 4 | Shared motel |
| Eric → Rick → **Van XJ-7741** → Omar → Marcus | 4 | Shared vehicle |
| Eric → Case #4471 → Account 7731 → Harbor Holdings → Marcus | 4 | Money / shell |

---

## Intended investigation flow

1. **Open** — only Eric Fox is visible. Objective: *prove or rule out a link to
   Marcus Reed.*
2. **Expand Eric** (right-click → Expand) — uncovers his 1st-degree circle
   (family, crew, home, vehicle, arrest, case, meeting yard, and **counsel**).
   Reed is still hidden — no premature reveal.
3. **Read the leads** — shared counsel (Karen), a crew member (Rick) tied to a
   shared motel/van, broker payments (Vic). Cross-referenced resources surface
   in the feed as they appear.
4. **Expand a bridge** — e.g. expand **Karen Webb** to uncover **Marcus Reed**
   (2-hop link), or work the **Rick → Nova Motel → Omar** trail, or follow **Vic
   → Harbor Holdings** and the money.
5. **Reveal** — the completed discovered path fires the *Connection Established*
   banner: it spotlights the chain, names the bridges, flags the broker, and the
   objective flips to **✓ PROVEN**.

---

## What it demonstrates

Link analysis is not a gimmick: it surfaces **non-obvious connections between
parties who share no direct tie** — through shared resources, intermediaries
(brokers/lawyers), and financial structures — turning two apparently separate
cases into a single network. The interactive discovery model mirrors real
analytical work: start from a subject, pull threads, and let the graph reveal
the structure.

## Console mechanics referenced

- **Expand** (right-click node) — reveal a node's real neighbours.
- **Trace / reveal spotlight** — highlight a path to the subject, dim the rest.
- **Cross-reference detection** — auto-flag shared resources.
- **Objective tracker** — uncovered N/total, Reed located, Fox⟷Reed proven.
- **POLE filters, dossier (centrality / threat / connections), telemetry feed.**
