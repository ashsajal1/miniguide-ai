---
name: MiniGuide AI
description: A short-course catalogue on morning paper, printed in green-black ink with one pharmacy green.
colors:
  pharmacy-green: "oklch(50% 0.13 160)"
  pharmacy-green-deep: "oklch(42% 0.11 162)"
  pharmacy-green-soft: "oklch(88% 0.08 160)"
  chalk: "oklch(99% 0.006 160)"
  morning-paper: "oklch(97.6% 0.011 88)"
  second-page: "oklch(96.5% 0.02 160)"
  label-stock: "oklch(96.8% 0.014 88)"
  green-black-ink: "oklch(21% 0.025 170)"
  ink-grey: "oklch(31% 0.02 170)"
  hairline: "oklch(86.5% 0.022 140)"
  quiet-text: "oklch(49% 0.024 165)"
  focus-green: "oklch(45% 0.14 160)"
  alert-rust: "oklch(47% 0.16 27)"
  tint-tuesday: "oklch(87.5% 0.058 64)"
  tint-wednesday: "oklch(91.5% 0.064 98)"
  tint-thursday: "oklch(86.5% 0.075 160)"
  night-plastic: "oklch(13% 0.01 170)"
  night-page: "oklch(18% 0.014 170)"
  night-band: "oklch(9.5% 0.012 170)"
typography:
  display:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(3rem, 5.2vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "DM Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  card: "14px"
  control: "10px"
  stamp: "6px"
  pill: "999px"
spacing:
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
  "24": "96px"
components:
  button-primary:
    backgroundColor: "{colors.pharmacy-green}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.control}"
    padding: "0 1.125rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.pharmacy-green-deep}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.control}"
    padding: "0 1.125rem"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.green-black-ink}"
    rounded: "{rounded.control}"
    padding: "0 1.125rem"
    height: "44px"
  paper-label:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.green-black-ink}"
    rounded: "{rounded.control}"
    padding: "1.5rem"
  ink-band:
    backgroundColor: "{colors.green-black-ink}"
    textColor: "{colors.morning-paper}"
    rounded: "0"
    padding: "4rem 0"
  input:
    backgroundColor: "{colors.label-stock}"
    textColor: "{colors.green-black-ink}"
    rounded: "{rounded.control}"
    padding: "0 0.9rem"
    height: "52px"
---

# Design System: MiniGuide AI

## Overview

**Creative North Star: "The Daylight Dispensary"**

MiniGuide reads as a pharmacy counter in morning light: a printed catalogue of small, labelled doses of learning, set on warm paper in green-black ink. The surface is calm and legible rather than clinical; the only saturated voice is one pharmacy green, and it appears where something can be acted on or verified. Everything else is paper, hairline, and ink, organised like a publication with a masthead, contents, numbered entries, and a shelf.

The system is tactile but not skeuomorphic. Paper is flat warm stock, labels are labels, plastic is translucent and tinted, and actions are stamped objects with a pressed lip. Depth is ambient and soft, never a hard offset costume. Photography, when present, is daylight and slightly muted. Motion is scarce: the window light drifts almost imperceptibly, and one entrance settles the featured label onto its stack; nothing else moves on its own.

The voice in type is a bold grotesk for headlines, a quiet humanist sans for reading, and a monospaced face reserved for the catalogue's numerals and labels. The result should feel printed, revised, and handled, not generated.

**Key Characteristics:**
- One green, one paper family, one ink.
- Publication structure: masthead, contents, entries, shelf, departments.
- Labelled objects: paper labels, stamps, translucent plastic, tabular numerals.
- Hairline rules and 2px ink breaks instead of card grids.
- Daylight, with a night mode that keeps paper labels lit.

## Colors

The palette is warm paper and green-black ink with a single pharmacy green; tinted plastics carry hue without becoming accents.

### Primary

- **Pharmacy Green**: the action colour. Primary buttons, links, focus borders, the stamp outline, and the brand mark. It is the only saturated colour on a page and should stay rare.
- **Deep Pharmacy Green**: the pressed and hover state of the green, plus the lip under primary actions.
- **Pharmacy Green Soft**: the tint inside circular check marks, selection background, and focus halos. Never used for text.
- **Chalk**: the foreground on green and on ink. A near-white with a faint green cast, never pure white.

### Neutral

- **Morning Paper**: the page ground. Warm, light, slightly yellow, and the colour a full-page screenshot should sample at the margin.
- **Second Page**: the alternating section ground, a cooler paper that reads as the next spread.
- **Label Stock**: the paper of the prescription label and the first page of cards; stays paper in night mode.
- **Green-Black Ink**: headings, body emphasis, the ink band ground, and the marker under every primary rule.
- **Ink Grey**: long-form secondary text and module rows.
- **Quiet Text**: captions, metadata, and placeholder text, still above 4.5:1 on paper.
- **Hairline**: all 1px rules, dividers, shelf boundaries, and input borders at rest.

### Secondary

- **Day Tints** (`tint-tuesday`, `tint-wednesday`, `tint-thursday`): the translucent plastic family. Tuesday is warm sand, Wednesday is old gold-green, Thursday is mint. They back physical objects — a fanned stack, a scenario panel — never whole sections.

### State

- **Alert Rust**: failure text, invalid field borders, and the icon in an error block. A desaturated rust that belongs to the paper world; it never appears on a happy path, and green is never used to mean "failed".

### Night

- **Night Plastic**: the night page ground, a deep green-black.
- **Night Page**: raised surfaces and cards at night.
- **Night Band**: the ink band, which sinks below the page rather than inverting to light.

### Named Rules

**The One Green Rule.** There is a single action green and a single deep state. A second accent hue is a different product. Tints are paper colours, not accents.

**The Label Stays Paper Rule.** At night the ground goes dark but paper labels remain paper: a lit slip on dark plastic. Never tint the label with the night ground.

## Typography

**Display Font:** Schibsted Grotesk (fallback sans-serif)  
**Body Font:** Instrument Sans (fallback sans-serif)  
**Label/Mono Font:** DM Mono (fallback monospace)

**Character:** A confident, slightly condensed grotesk for display, a workmanlike humanist sans for reading, and a mono for the catalogue's equipment: numbers, times, stamps, issue lines. The pairing reads as printed matter that takes the work seriously.

### Hierarchy

- **Display** (700, `clamp(3rem, 5.2vw, 4.5rem)`, 0.94, -0.04em): the landing cover headline only. Three lines maximum, never more than nine characters wide per line.
- **Headline** (700, `clamp(2rem, 3.4vw, 3rem)`, 1.04, -0.03em): section and department headings. Left aligned, sentence case, no kicker above.
- **Title** (700, 17–19px, 1.1, -0.02em): shelf entries, feature rows, use-case card headings.
- **Body** (400, 15–17px, 1.7): reading copy. Measure 42–62ch on the landing page; never set a long paragraph wider than 75ch.
- **Label** (400–500, 9–10px, 0.1–0.2em uppercase, tabular): masthead lines, module minutes, entry numbers, scenario provenance, stamps.

### Named Rules

**The Stamped Label Rule.** If it is a label, a number, a time, a stamp, or an issue line, it is DM Mono, uppercase where it is a caption, tracked, and tabular. Prose is never mono and labels are never set in the body face.

**The No Kicker Rule.** A heading carries its own weight. Nothing sits above it to announce what it is; masthead and contents lines belong to their own structures, not to the heading below.

## Layout

The shell is a capped and centred 1240px container with 20px gutters on phones and 32px from `sm` upward; at wide viewports the gutters grow while the measure and grids stay put. The sticky paper navigation and footer share that width.

Sections are separated by 1px hairlines, with a 2px green-black rule reserved for major breaks (the catalogue shelf, the closing action). Vertical rhythm is 64px of padding on phones and 96px from `lg`, with more space above a heading than below it. The landing cover is a three-column grid at `lg`: 200px contents rail, a flexible offer column, and a 400px featured entry, widening to 220/1fr/440 at `xl`; below `lg` it stacks in the order offer, featured entry, contents rail.

Headings are left aligned. The page never centres a heading group. Grids use `minmax(0, 1fr)` tracks wherever content can overflow, and long words break rather than push the page wider.

Breakpoints: `sm` 640px, `lg` 1024px, `xl` 1280px. Anchor targets carry `scroll-mt-28` to clear the sticky bar.

### Named Rules

**The Department Rule.** A SaaS section must be composed as a department of the catalogue — a rail, a shelf, a hairline table, a labelled panel — and never as a grid of same-size icon-heading-text cards.

## Elevation & Depth

Depth is a hybrid of flat printed layers and one soft ambient shadow. The page itself is flat. Paper labels and cards lift off the page with a long, low shadow; translucent plastic panels carry a glint along the top edge and a soft inner shade at the bottom. Buttons and the brand mark are stamped objects: a 3px lip below the face, pressed down 3px on `:active`. There are no hard offset block shadows anywhere else.

### Shadow Vocabulary

- **Label lift** (`--shadow-card: 0 1px 2px oklch(30% 0.03 165 / 0.08), 0 24px 48px -24px oklch(40% 0.08 165 / 0.35)`): paper labels and ordinary cards.
- **Lifted panel** (`--shadow-lift: 0 1px 1px oklch(30% 0.03 165 / 0.1), 8px 18px 28px -14px oklch(36% 0.06 165 / 0.32), 18px 40px 60px -30px oklch(40% 0.08 165 / 0.3)`): mobile sheets and objects that temporarily float.
- **Stamped action** (`0 0 0 1px var(--color-accent-deep), 0 3px 0 var(--color-accent-deep), inset 0 1px 0 color-mix(in oklab, var(--color-glint) 45%, transparent)`): primary buttons and the brand mark.
- **Plastic** (`inset 0 1.5px 0 var(--color-glint), inset 0 -24px 36px -28px color-mix(in oklab, var(--t) 45%, var(--color-shade))`): tinted scenario panels.

### Named Rules

**The Pressed-Paper Rule.** Only actions and stamps carry a hard lip. Everything else lifts with a soft, long shadow. A block shadow on a card is a costume.

## Shapes

Corners are gently curved and consistent by nesting level: 14px for cards and plastic panels, 10px for controls, labels, and the brand mark, 6px for the stamp, and a full pill only for small status dots and badges. Borders are 1px hairlines at rest; 2px green-black rules mark structure and 2px green outlines the stamp. Nothing is beveled, embossed, or drawn as a browser window.

### Named Rules

**The One Radius Rule.** One radius per nesting level. A card at 14px contains controls at 10px and never another 14px card.

## Components

### Buttons

- **Shape:** 10px radius, 44px tall by default, 36px small, 52px large.
- **Primary:** pharmacy green with a 1px deep-green outline, a 3px deep-green lip, and a top glint; chalk text; 500 weight.
- **Hover / Focus:** hover deepens to the deep green; `:active` presses down 3px and removes the lip; focus is the global 2px focus-green outline at 2px offset.
- **Outline:** label-stock face, hairline border, green-black text, same lip as the default button.
- **Ghost:** transparent ground and border until hover, then second-page paper; never used as the sole action on a page.

### Paper label (`dose-label`)

The signature object. A label-stock panel with a 10px radius, hairline border, soft label lift, DM Mono throughout, tabular numerals. A dashed rule appears above a stamp when one is present. In night mode the label redefines the local paper tokens so it stays paper against the dark page.

### Stamp (`dose-stamp`)

A 2px green double border with a 6px radius, inset card-coloured keyline, deep-green mono text, rotated -2deg. Used for provenance and status ("Sample entry"), never for decoration.

### Plastic panel

A translucent tinted rectangle at 14px radius with a glint along the top, a soft inner shade at the bottom, and 62% tint over the page (76% at night). Backs a scenario or a single feature object; never two photograph-led or plastic-led sections in a row.

### Inputs

- **Style:** 52px tall, 1px quiet-text border, 10px radius, label-stock ground, body face at 16px.
- **Focus:** border turns focus-green with a 3px soft-green halo; no outline.
- **Placeholder:** quiet text, never lighter than the contrast floor.

### Navigation

A sticky paper bar, full width, with the 1240px container inside. The wordmark pairs a 36px green mark at 10px radius (with a 2px lip) with 19px display text. Links are body-face, 14–15px, with a 2px green underline on the active route. A ghost theme control sits before the stamped actions, matching the mobile menu trigger at 36px square; it shows the appearance the click will switch to. On phones the menu opens as a 320px sheet from the right with the lifted-panel shadow.

### Ink band

A full-bleed green-black band with paper text and paper focus rings. It closes the argument of a page — three pledges, one headline — and uses a paper/15 hairline above its columns. At night the band sinks to `night-band` rather than inverting to light.

### Window light

Four blurred, skewed panes of light drift across the hero over 90 seconds, alternating direction, at 30–55% opacity. At night the same panes dim to a green lamp. Reduced motion stops the drift and shortens all transitions.

## Do's and Don'ts

### Do:

- **Do** spend the page on paper, ink, and one green; add a tint only when it backs a physical object.
- **Do** set every numeral, time, stamp, issue line, and metadata caption in DM Mono with tabular numerals.
- **Do** separate sections with 1px hairlines and reserve the 2px green-black rule for structural breaks.
- **Do** leave headings unannounced and left aligned.
- **Do** label synthetic data at the object it describes ("Sample entry", "Sample scenario").
- **Do** keep the paper label paper in night mode.
- **Do** use soft, long shadows for paper and a 3px lip only for stamped actions.
- **Do** keep one authored motion moment per page and ship a reduced-motion fallback.

### Don't:

- **Don't** introduce a second accent hue, a purple-to-blue gradient, or gradient text.
- **Don't** put a card inside a card or build the page from same-size icon-heading-text cards.
- **Don't** use hard offset block shadows on cards, panels, or list items.
- **Don't** set prose in DM Mono or labels in the body face.
- **Don't** use emoji, Unicode glyphs, or drawn browser windows as icons; use the icon library at one stroke weight.
- **Don't** add a kicker or eyebrow above a heading.
- **Don't** centre heading groups or section numbers where the sequence carries no information.
- **Don't** invent metrics, testimonials, customer logos, or future pricing promises.
