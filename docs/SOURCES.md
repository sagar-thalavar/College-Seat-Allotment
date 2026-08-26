# Sources & Verification

Every URL below was fetched live on **27 August 2026** and returned HTTP 200. Every quoted
string was confirmed to exist in the raw bytes the server sent, not in a summary of the page.
Open any link and Ctrl+F the quoted text.

This is not a literature review. It is the exact set of endpoints and documents this product
reads from, plus the exact paperwork that stands between the demo and a live system.

---

## The headline number

**213 pages of PDF.** That is what a DCET lateral-entry candidate must cross-reference today to
answer one question: *which college can I actually get?*

| Document | Pages | Colleges | Category columns |
|---|---|---|---|
| DCET-2026 cut-off ranks, Rest of Karnataka | 64 | 226 | 37 |
| DCET-2026 cut-off ranks, 371(J) Kalyana Karnataka | 61 | - | 37 |
| DCET-2026 engineering lateral entry seat matrix | 88 | 229 | - |

The 37 columns are `1G 1K 1R 2AG 2AK 2AR 2BG 2BK 2BR 3AG 3AK 3AR 3BG 3BK 3BR GM GMK GMP GMR
NRI OPN OTH S1G S1K S1R S2G S2K S2R S3G S3K S3R S4G S4K S4R STG STK STR` - verbatim from page 1
of the cut-off PDF. The `G`/`K`/`R` suffixes are General, Kannada-medium and Rural.

**Why this matters for us:** it is the entire justification for the product. Four taps
(category, Kannada, rural, 371J) replace a 213-page manual cross-reference. Nothing here is a
guess about the problem - it is measured.

---

## A. What KEA already asks a candidate for

| Source | What it proves | Why it matters for us |
|---|---|---|
| [DCET provisional result](https://cetonline.karnataka.gov.in/ugcetrank2025/dcetcheckresult.aspx) | Fields are `Enter Appln Number` and `Enter Date of Birth`. Header: `DCET DAY/EVENING 2026 PROVISIONAL RESULT` | KEA itself resolves a full rank card from two identifiers. Our 2-field form is not a shortcut we invented - it is KEA's own minimum |
| [DCET option entry login](https://keaonline.karnataka.gov.in/dcet_opt_etry_2026_v1/main/index.php) | `ADMISSION TO DCET PROFESSIONAL COURSES- 2026`, `Option Entry CET No`, `Face Verify`, and `CET No are on your verification slip` | The real bottleneck. A candidate cannot start until they hold a physical verification slip. This is the step that sends students to the cyber centre |
| [DCET seat allotment result](https://keaonline.karnataka.gov.in/dcet_opt_etry_2026_v1/main/checkresult.php) | `DCET-2026 FIRST ROUND FINAL SEAT ALLOTMENT RESULTS` behind CET No + DOB + captcha | Confirms results are already keyed on the same two identifiers we ask for |
| [KEA UGCET rank portal](https://cetonline.karnataka.gov.in/kearank2026app/ugcet2026-rank/) | Modern React app whose bundle calls `POST /kearank2026api/api/v1/result/candidate-result` with `{applicationNumber, dateOfBirth}` and returns discipline-wise rank, subject marks and QE marks | KEA has already built the API this product needs. We are not asking them to build anything new - we are asking for permission to call what exists |
| [KEA DCET 2026 hub](https://cetonline.karnataka.gov.in/kea/dcet2026.aspx) | One page, 40+ portal and PDF links, no guided path | This is the page that sends people to YouTube. It is the before-picture |
| [DCET 2026 application portal](https://cetonline.karnataka.gov.in/dcet2026app/login) | Separate login, separate app, separate credentials | Fragmentation is the product problem. Five portals, five logins, one student |

## B. The data we have to parse ourselves

| Source | What it proves | Why it matters for us |
|---|---|---|
| [DCET cut-off ranks, Rest of Karnataka](https://cetonline.karnataka.gov.in/keawebentry456/dcet2026/DCET_CUTOFF_R_18082026kannada.pdf) | 64 pages. Header reads `DCET-2026 PROVISIONAL ALLOTMENT CUT-OFF RANKS FOR Engineering`. Text-extractable, not scanned | Parseable today with no permission at all. This is the one piece of the pipeline we can build immediately |
| [DCET cut-off ranks, 371(J)](https://cetonline.karnataka.gov.in/keawebentry456/dcet2026/DCET_CUTOFF_H_18082026kannada.pdf) | 61 separate pages. `Seat Type: 371(j) Kalyana karnataka Cut-Off Ranks` | 371J is published as an entirely separate document. A Kalyana Karnataka student has to know to go find a second PDF. Most do not |
| [DCET seat matrix](https://cetonline.karnataka.gov.in/keawebentry456/dcet2026/ENG_SEAT_DIP_2026_19082026kannada.pdf) | 88 pages, 229 colleges. `DCET - ENGINEERING LATERAL ENTRY 1ST ROUND PROVISIONAL SEAT MATRIX - 2026 (REGULAR)`, split into `GRNERAL` / `KANNADA` / `RURAL` blocks with `HK` / `RK` rows | The seat grid is literally indexed by our four toggles. Our input design is a direct read of the government's own data model |
| [Year-wise cut-off archive](https://cetonline.karnataka.gov.in/kea/cutoff.aspx) | Historical cut-offs, PDF only | Source for multi-year trend scoring. No API exists, so we host our own parsed copy |
| [DCET information bulletin 2026](https://cetonline.karnataka.gov.in/keawebentry456/dcet2026/info_bulletin_diploma_2026_17032026kannada.pdf) | Official rules for eligibility, reservation and the allotment rounds | The rulebook our allotment simulator must match. Ground truth for correctness, not vibes |

## C. The path to permission

| Source | What it proves | Why it matters for us |
|---|---|---|
| [API Setu DigiLocker resources](https://apisetu.gov.in/digilocker) | Government's own integration hub. Note: content sits behind tabs, so Ctrl+F only works after clicking the right tab | The front door. Everything below is linked from here |
| [DigiLocker Requester API Specification v1.12](https://cf-media.api-setu.in/resources/Requester-APISpecification-V1_12.pdf) | The actual spec for pulling a citizen's documents with their consent | This is how category, caste, income and 371J stop being toggles and become fetched facts |
| [DigiLocker Terms of Use for Requester](https://cf-media.api-setu.in/resources/DigiLocker-Terms-of-User-Requester-june-2025.pdf) | `Terms of Service agreement to be signed by 'Requestor Organization' before proceeding for Integration` | Names the blocker honestly. It is a signature, not an API key. This is the ask |
| [DigiLocker Partner Onboarding SOP](https://cf-media.api-setu.in/resources/Partners-SOP.pdf) | Step-by-step onboarding process for partner organisations | The checklist we would work through on day one with the right introduction |
| [API Setu directory](https://directory.apisetu.gov.in/) | Government's stated education use case: `Transform admission process, get access to crores of educational awards.` | The government already frames this exact problem as a target use case. We are asking to be let in, not to invent a new lane |
| [Nadakacheri, Karnataka](https://nadakacheri.karnataka.gov.in/ajsk/) | `Digilocker(Pull Service) Facility Has Been Enabled` | Karnataka's caste, income and residence certificates are **already** in DigiLocker. The state has done its half of the work |
| [Nadakacheri status lookup](https://ajsk.karnataka.gov.in/NK_Status) | Lookup by mobile number + OTP, returning district, taluk, hobli and village | Village decides rural and 371J eligibility. A student should never have to type an RD number they have never memorised |

## D. What does not exist, and we checked

| Source | What we found | Why it matters for us |
|---|---|---|
| [data.gov.in API listing](https://www.data.gov.in/apis) | `The portal is undergoing maintenance` and `No Result Found` - zero APIs listed | We are not building on India's open data portal because right now there is nothing there to build on. Stated up front rather than discovered in month three |
| [AISHE](https://aishe.gov.in/aishe/home) | Browsable institution directory, no public API | College metadata has to be assembled and maintained by us |

---

## Method

Each page was fetched with `curl`, and each quoted string confirmed present in the response
bytes with `grep -F`. PDFs were downloaded and parsed with `pdftotext` before any claim about
page counts or column headers was made. Nothing in this document is quoted from a search
result or a model summary.

```bash
# reproduce any row
curl -s https://keaonline.karnataka.gov.in/dcet_opt_etry_2026_v1/main/index.php \
  | grep -o 'Option Entry CET No'
```

## Standing disclosure

This is a demonstration build on mock data. It is not affiliated with, endorsed by, or operated
by the Karnataka Examinations Authority. No government endpoint is called in production, and no
candidate data is stored. The sources above describe what a permitted implementation would read
from, and what permission it would need first.
