# Homepage Trust-First Redesign Plan

## Goal
Redesign the public homepage to build trust for a new business selling curated enterprise-grade refurbished computers. Replace marketing fluff with verifiable evidence at every touchpoint.

---

## Scope
**Files to modify:**
- `app/(public)/HomeClient.tsx` — Main homepage component (1033 lines)
- `app/(public)/page.tsx` — Server component with SEO metadata
- `lib/translations.ts` — Add new trust section copy (VN + EN)
- `lib/productsData.ts` — Add `isFeatured`, `testDuration`, `grade` fields
- `components/` — New `TrustBadge.tsx`, `TrustEvidenceSection.tsx`, `FeaturedProductCard.tsx`

**New files:**
- `components/TrustBadge.tsx`
- `components/TrustEvidenceSection.tsx`
- `components/FeaturedProductCard.tsx`

---

## Design Decisions (Resolved)

| Decision | Resolution |
|----------|------------|
| Hero headline | "MÁY TÍNH ĐỒNG BỘ DELL, HP, THINKPAD — BO MẠCH NGUYÊN BẢN, WINDOWS SẠCH, BẢO HÀNH THEO S/N" |
| Hero subhead | 4 inline trust badges (bo mạch gốc, Windows sạch, test FurMark, S/N bảo hành) |
| Primary CTA | Single: "Xem máy sẵn kho" (brand red) |
| Secondary CTA | "Đặt lịch kỹ thuật" (outline) |
| Warranty search | Move to sticky announcement bar (not in hero) |
| Trust evidence section | 3 columns: QC Process, Component Transparency, S/N Warranty |
| Featured products | Admin-curated 3 (`isFeatured` flag), each with trust badges |
| FAQ style | Objection-handling: 4 fears → evidence-based answers |
| Social proof | Segment by persona (Business/Student/Officer) with model + warranty |
| S/N wording | "Mỗi máy có số S/N của nhà sản xuất. Tôi bảo hành dựa trên số này." |

---

## Implementation Tasks

### Phase 1: Data & Translations (Foundation)
- [ ] **1.1** Add `isFeatured: boolean`, `testDuration: number`, `grade: string` to product type in `lib/productsData.ts`
- [ ] **1.2** Update `getShowcaseProducts()` to filter/sort by `isFeatured` first
- [ ] **1.3** Add trust section translations to `lib/translations.ts` (VN + EN):
  - `trustEvidence`: { process, components, warranty }
  - `faqObjections`: 4 fear-based Q&A pairs
  - `socialProofSegments`: 3 persona reviews with model/warranty
  - `footerTrustSignals`: 6 inline trust badges

### Phase 2: Reusable Components
- [ ] **2.1** Create `components/TrustBadge.tsx`
  - Props: `label`, `variant` ('grade' | 'warranty' | 'test' | 'os' | 'support')
  - Consistent styling: small pill, icon + text, semantic colors
- [ ] **2.2** Create `components/TrustEvidenceSection.tsx`
  - 3-column grid (responsive: 1-col mobile, 3-col desktop)
  - Each column: icon, title, 4 bullet facts, CTA (warranty column only)
  - Uses translations from `trustEvidence`
- [ ] **2.3** Create `components/FeaturedProductCard.tsx`
  - Props: product data + trust badges array
  - Real photo (priority), specs grid, trust badge row, dual CTA
  - Replaces inline product card markup in HomeClient

### Phase 3: Homepage Restructure
- [ ] **3.1** Rewrite Hero section in `HomeClient.tsx`:
  - New headline + subhead + 4 inline trust badges
  - Single primary CTA, secondary outline CTA
  - Remove warranty search form from hero
- [ ] **3.2** Insert `TrustEvidenceSection` immediately after Hero
- [ ] **3.3** Replace product grid with `FeaturedProductCard` × 3 (from `isFeatured`)
- [ ] **3.4** Add "Xem toàn bộ kho" CTA button after featured grid
- [ ] **3.5** Rewrite FAQ section using `faqObjections` translations
- [ ] **3.6** Restructure reviews section: 3 persona cards with model + warranty
- [ ] **3.7** Update footer with `footerTrustSignals` inline badges
- [ ] **3.8** Add sticky announcement bar component for warranty search (top of page)

### Phase 4: Admin Integration (Curated Featured Products)
- [ ] **4.1** Add `isFeatured` toggle to admin product/inventory management UI
- [ ] **4.2** Add `testDuration` input (FurMark minutes) + `grade` select (Grade A/B/C, % original)
- [ ] **4.3** Ensure 3 featured products exist in DB for launch

### Phase 5: SEO & Polish
- [ ] **5.1** Update `page.tsx` metadata: title/description reflect trust-first positioning
- [ ] **5.2** Add FAQPage JSON-LD using new objection-handling FAQs (auto-generate from translations)
- [ ] **5.3** Verify color contrast: `#A93226` for text on light backgrounds (WCAG AA)
- [ ] **5.4** Test mobile: hero image above headline, trust badges stack, CTAs full-width

---

## Acceptance Criteria

| Criterion | Verification |
|-----------|--------------|
| Hero loads < 2.5s LCP | Lighthouse audit |
| 4 trust badges visible above fold | Visual check |
| Featured products = admin-curated 3 | CMS check |
| Each product card shows: grade, warranty, test duration | Visual check |
| FAQ answers reference specific evidence (FurMark, S/N, Digital License) | Content review |
| Reviews show persona + model + warranty | Visual check |
| Warranty search accessible from sticky bar | Interaction test |
| VN/EN parity for all new copy | Translation audit |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| No featured products in DB at launch | Seed 3 default featured in migration; admin UI ready day 1 |
| Translations incomplete for EN | Copy EN from VN structure; refine post-launch |
| Product images not "real photos" yet | Use `placeholder="blur"` with blurDataURL; prioritize photo shoot |
| Admin UI for `isFeatured` delayed | Hardcode 3 product IDs in `getShowcaseProducts` as temporary fallback |

---

## Rollout
1. Deploy Phase 1-3 (frontend only) → visual review
2. Deploy Phase 4 (admin) → curate 3 featured
3. Deploy Phase 5 (SEO/polish) → Lighthouse audit

---

## Out of Scope
- Admin dashboard redesign (separate effort)
- Warranty lookup page changes
- Booking flow changes
- Performance optimization beyond image loading