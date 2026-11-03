# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Working professionals are the primary audience. They arrive with a specific skill gap and a short window between work tasks, and they want to leave with something finished rather than a longer reading list. Course creators are a confirmed secondary audience: they turn their own sources into public or private courses.

## Product Purpose

MiniGuide AI turns a long source into a short, structured course. A learner can browse published mini courses, enrol, work through modules, answer practice questions, keep progress and XP, save courses for later, and rate what they finish. A creator can paste a documentation link, a blog post, or upload a document, then edit the AI-drafted modules, lessons, and questions before publishing.

## Positioning

The product is a source-to-course converter, not a course marketplace. The AI draft is editable, the result is intentionally short, and progress is kept across sessions. A competitor can copy a catalogue; it cannot truthfully copy the source-to-short-course workflow and the finishability it is built around.

## Operating Context

- Creators start from a URL to documentation or a blog, an uploaded document, or a manual outline. AI drafts modules, lessons, and practice questions.
- Creators review and edit the outline, slides, and questions, choose public or private, then publish.
- Learners browse a public catalogue, enrol, complete modules, and see progress and XP on their profile. Saved courses form a next-up queue.
- Authentication is handled by Clerk. Ratings and written reviews live on course detail pages.
- The home route must ship as a static landing page with no database query.

## Capabilities and Constraints

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Prisma 7 with Neon Postgres, Clerk authentication.
- Catalogue, course detail, learning, profile, saved courses, rating, and admin screens already exist.
- Courses can be public or private. Modules contain slides and questions.
- Landing page claims must stay within the facts recorded here. There are no customer logos, named case studies, or testimonials on hand.
- The product is free during its beta. Browsing, enrolling, and learning are free; no paid plan exists yet.

## Brand Commitments

- Name: MiniGuide AI (wordmark "MiniGuide" in the shell).
- Voice: plain, concise, warm, and specific. No hype, no growth-speak, no invented urgency.
- The Dose design system (warm paper, green-black ink, pharmacy-label motif, Schibsted Grotesk / Instrument Sans / DM Mono) is committed and inherited by this landing page.
- Primary conversion action: start free / create an account. Browsing courses is the secondary action.

## Evidence on Hand

- Product workflow, screens, and course content structure exist in the repository and may be demonstrated.
- The About page carries these figures and the user confirmed them for use: 1000+ active students, 50+ expert instructors, 100+ courses available, 98% satisfaction rate.
- No real testimonials, customer logos, press mentions, or measured benchmarks exist. Do not fabricate them.
- The catalogue itself is database-backed; the landing page must not depend on it.

## Product Principles

1. Finish something small today. Every choice favours completion over accumulation.
2. The source is the starting point, not the product. The short course is.
3. Show the mechanism. Demonstrate the workflow rather than claiming outcomes.
4. Keep the tool out of the way. Quiet craft, readable structure, no noise.
5. Say only what is true. No invented proof, customers, or prices.
