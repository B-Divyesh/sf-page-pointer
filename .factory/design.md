# Page Pointer — visual thesis

## Direction: blueprint drafting sheet

Page Pointer should feel like a calm, precise instrument laid over a physical page: the useful marks of a drafter's desk, not a generic camera app. Pale cyan paper, a fine 8 px construction grid, measurement ticks, registration marks, and clipped annotation labels explain how the guide works while keeping the photographed book dominant. The interface is deliberately single-mode (light): it is used beside printed paper, often under uneven household light, and the stable pale field makes controls predictable while the live camera surface remains dark.

## Tokens

- Paper / background `#EAF6F4`; sheet / surface `#F8FCF9`; raised surface `#FFFFFF`.
- Ink `#102D35`; muted ink `#49636A`; blueprint rule `#7FAEB2`; hairline `#B9D6D4`.
- Action blue `#075D73` with white text; focus yellow `#F7C948` with dark ink; success `#176B52`; warning `#8A4B08`; danger `#9D2B35`.
- Camera surround `#071C22`; camera labels `#D9EFEB`.
- All text/control combinations meet WCAG AA. State is always carried by words or symbols as well as color.

## Typography

- Interface and reading copy: `Atkinson Hyperlegible Next`, self-hosted WOFF2, because the product serves emerging readers and the letterforms stay distinct at small sizes.
- Draft annotations and measurements: `IBM Plex Mono`, self-hosted WOFF2, uppercase with modest tracking. It makes status and calibration feel instrumental rather than decorative.
- Scale: 12 annotation / 16 body / 18 control / 22 section / clamp(36–56) display. Body leading is 1.55 and copy measure stays under 68 characters.

## Space and shape

An 8 px base rhythm with 4 px for optical adjustments. Controls are at least 48 px high and separated by at least 8 px. Corners are clipped or only slightly rounded (2–12 px), echoing drafting stencils rather than soft card stacks. Independent tools may sit on white plates; related content groups by proximity first. The phone view drops long explanatory copy once the camera starts and pins no content behind unsafe edges.

## Interaction grammar

- The primary verb is **Open camera**. Permission state is stated before the browser prompt.
- A crosshair and coordinate readout make a tap feel like placing a drafting point. The chosen baseline becomes a yellow ruler; the current word becomes a translucent yellow aperture.
- Tap the printed word to orient. Previous/Next, arrow keys, and Space provide deterministic fallback. Line mode widens the same instrument rather than changing screens.
- Detection is explicitly local and approximate. Users can drag/re-tap or use step controls; nothing implies OCR or reading assessment.
- Loading, permission denial, no-camera, and offline states each explain the next action. The offline badge confirms readiness rather than alarming the user.

## Motion

Controls and overlays settle over 180–240 ms using opacity and transform only, with motion following the tapped point. The focus aperture does not pulse or loop. Under `prefers-reduced-motion`, transitions and smooth scrolling become instant; state is still visible through line weight, shape, and text.

## Asset plan and provenance

- Hero: an original editorial still-life showing an open children's book on a cyan drafting mat with a phone acting as a precise yellow reading guide. It explains the physical-book relationship without pretending to show live OCR. Served as responsive WebP with explicit dimensions; mobile variant is ≤300 KB.
- Social preview: `page-pointer-social-1200x630.jpg`, a deterministic center crop of the approved original hero. It adds no generated content and preserves the same prompt provenance.
- Icons, crosshairs, grid, word aperture, and PWA marks are hand-authored SVG/CSS so they remain sharp and match the instrument language.
- Generated imagery disclosure appears in the footer.

### Prompt sheet

Use case: `product-mockup`. Asset type: landing-page instructional hero. Subject: a modern unbranded smartphone held just above an open illustrated children's book, viewed from a close oblique top-down angle; on the phone screen, a simple bright yellow horizontal reading ruler aligned with one printed line, with no legible interface text. World: quiet family reading table treated like an architect's drafting station. Materials: pale cyan gridded cutting mat, cream paper, graphite pencil, translucent amber ruler. Light: soft late-afternoon window light, precise gentle shadows. Lens/composition: 4:3 editorial product photograph, phone and book centered-right, clear negative space at upper-left, believable hand-free arrangement. Palette words: blueprint cyan, cream paper, deep petrol ink, signal yellow. Avoid: people, hands, faces, brands, logos, watermarks, readable text, gibberish lettering, scanning beams, futuristic holograms, medical symbolism, clutter, distorted phone or book.

Generated with the factory `factory-image` deployment on 2026-08-28. The final image is original project artwork; prompt sidecar is kept in `assets/src/`.
