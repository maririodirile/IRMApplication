# Application data format

Reference for anyone maintaining the form or the hub's importer.

## Submission payload (version 2)

Sent to `SUBMIT_URL` as JSON (`Content-Type: text/plain;charset=utf-8`, `no-cors`), and offered as a downloaded `.json` file when no URL is set. The hub imports this format directly. The POST adds a `code` field holding the short code.

| Field | Meaning |
| --- | --- |
| `v` | Format version, currently `2` |
| `i` | Unique application id |
| `at` | ISO timestamp of submission |
| `n`, `o` | Business name, owner name |
| `em`, `ph` | Email, phone |
| `g` | Gender: `F`, `M` or `O` (from pronouns) |
| `y` | Youth owner (35 or under): `1` or `0` |
| `a` | Area: Newcastle, Madadeni, Osizweni or Other Majuba |
| `tr` | Main trade (Plumbing, Electrical, Carpentry or Other) |
| `e` | Seven eligibility gates, one character each: `1` yes, `0` no |
| `t` | 54 enterprising tendency answers: `A` agree, `D` disagree |
| `r` | 12 grit answers: `1` to `5` |
| `irl` | Readiness levels 1 to 9: `crl`, `trl`, `brl`, `iprl`, `tmrl`, `frl`, plus `gap` (highest minus lowest) |
| `bd` | 24 business diagnostic answers, one digit each: `0` None, `1` Ad hoc, `2` Partly in place, `3` Documented & used |
| `f` | All answered form fields, keyed by question id (for example `P4`, `B1`) |

## Short code (`IRM3.`)

A compact, human-pasteable summary, about 400 characters. Fields are percent-encoded and joined with `|`, in this order after the `IRM3.` prefix:

`i`, date (`at`, first 10 characters), `n`, `o`, `em`, `ph`, `g`, `y`, `a`, `tr`, `e`, `t`, `r`, the six IRL levels as one string (`crl trl brl iprl tmrl frl`), `bd`, `B5` (operating start date), `O9` (employees), `O11` (youth employees), `B20` (turnover band), `O5` (revenue band), `B21` (employee band).

The encoder is `mkCode` in `public/index.html`. The decoder is `decV3` in `internal/selection-diagnostic-hub.html`. Change both together.

The hub also reads older codes (`IRM1.`, `IRM2.`, `IRM2U.`) and full `.json` files.

## Where each part of the code is used in the hub

- `e` fills the seven eligibility gates.
- `t` and `r` fill the enterprising tendency and grit scores (not used in ranking).
- `bd` fills the six diagnostic areas and the priority areas for the Enterprise Development Plan.
- `irl` fills the readiness radar. The levels are self-rated by the applicant and can be adjusted by NBI.
- Turnover, total assets and the full/part-time split arrive as bands or blank; verify them at onboarding.
