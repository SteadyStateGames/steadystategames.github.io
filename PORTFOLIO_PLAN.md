# Shawn Crook-Cocagne portfolio plan

The site should feel like a creative professional's body of work: strong typography, large project visuals, short explanations of decisions, and direct access to the things Shawn made. Recruiters should be able to choose the relevant discipline quickly, while visitors can see the connection between teaching, games, engineering, and systems.

## What is available now

- `/` remains the playable game gallery, with a Teaching navigation link and an introduction to the teaching portfolio.
- `/teaching/` is the first portfolio chapter: an editorial page with a large serif headline, numbered projects, illustrated workflows, credentials and a short personal introduction.
- The teaching page includes the current one-page résumé as PDF and editable Word, plus a public copy of the three-page ETS Praxis report. The report verifies General Science (5436), 193 on a 100–200 scale, a test date of April 3, 2026, and a passing result for Colorado as recorded on that report. No percentile or percentage-correct claim is made.
- Candidate ID, Social Security digits and date of birth were removed from the public PDF's text and visually marked as redacted. The original report is not in the repository.
- Three starting projects connect the work: Google Forms assessment creation, chemical inventory/safety systems, and Blooket creation with game-development context.
- `/teaching/resume/` routes earlier résumé links to the documents section.

## Visual direction

Use a warm paper background, dark green type, lime accents inherited from the games page, and restrained lavender and ochre project panels. Large Georgia headlines, small monospace captions, generous margins and visible section rules make the page feel closer to an artist's editorial portfolio than a corporate landing page. Keep body copy readable and mobile layouts simple.

The current CSS diagrams are clearly illustrations of workflows. As real work samples become available, replace or pair them with photographs, screenshots, diagrams and working demonstrations. Do not fabricate classroom photographs, student results, testimonials or screenshots of systems that were never built.

Each case study should answer: What was the problem? What did I design? What choices did I make? What can a visitor inspect? What changed, and what would I improve? Lead with the artifact rather than a long skills list.

## Next evidence to collect

| Project | Artifact to share | Story to tell | Useful evidence |
| --- | --- | --- | --- |
| Google Forms test creation | A fresh, shareable example using original questions and fictional responses; screenshots of question structure and the review flow | Designing within the available technology, automatic scoring plus written-response review, reuse for study practice | A short screen recording, an annotated diagram, and a copy of the template |
| Blooket creation | New review sets on Shawn's personal account, with public links when ready | How questions are organized around a learning goal and how feedback supports practice | One curated set, a question-design example, and notes on what would be revised |
| Chemical cabinet system | A blank logbook template, fictional inventory sample and labeled workflow diagram | Taking ownership of an unmaintained system, connecting records to storage organization, and handling legacy hazards | Redacted artifacts or photos that Shawn is authorized to share; no operational chemical-disposal tutorial |
| Individualized and asynchronous work | A self-contained lesson or small project with a schedule, checkpoints and alternative supports | Keeping expectations clear when students work at different speeds | A student-facing brief, progress-check template and one example of adapting instruction |
| Digital simulations | An original simulation or a lesson using an appropriately credited simulation | Turning a scientific idea into something a student can test and explain | A playable demo, an explanation of variables and an accompanying task sheet |

The former work-account Blooket collection is inaccessible. New personal-account sets are a future milestone, not a live portfolio link. Do not try to retrieve school-account materials without authorized access. Public examples should not include real student names, grades, IEP/504 records, responses or school-account credentials.

## Build in this order

1. **Evidence first:** curate one public assessment example and one new Blooket set. Write a short account of the learning goal and design choices. Add screenshots only when they show actual work and can be shared.
2. **Two strong case studies:** give assessments and the chemical logbook their own pages under `/teaching/projects/`. Use a large opening artifact, a brief project summary and two or three annotated details. Add outcomes only when they can be supported; qualitative results are acceptable.
3. **A unified home:** move the game catalog to `/games/` while retaining all existing game URLs. Use the homepage for a selected-work gallery with Teaching, Games, Systems and Engineering filters. A project can appear in more than one discipline; there is one canonical case-study page per project.
4. **Role chapters:** add `/systems/` and `/engineering/` once there are specific artifacts and enough project detail. Each chapter gets its matching one-page résumé and a curated selection of work. Keep unsupported AI project claims out of the site.
5. **Professional development:** add a dated learning log under `/teaching/development/` for CU ASPIRE reflections, completed training and teaching experiments. Distinguish enrollment, participation and completed credentials. Each entry should connect learning to something Shawn changed in practice.

## A case-study template

```text
Project title
One-sentence problem and result
Role / tools / dates, when known
Large real artifact or clearly labeled diagram
The constraint
The choices I made
How the system works
Evidence and limitations
What I would improve next
Try it / inspect it / download it
```

For Blooket, the description should focus on question and activity design. For test creation, emphasize the assessment workflow rather than the software brand alone. For chemical safety, the inventory and logging system is the shareable design artifact; hazardous-material procedures are not a public tutorial.

## Technical and publishing approach

Keep GitHub Pages and plain HTML/CSS. The present page has no build step and no required JavaScript. Use native `<details>` for extra context, semantic headings, descriptive links, keyboard focus styles, reduced-motion support and readable mobile layouts. The documents should remain downloadable without a login or embedded third-party viewer.

Later, use a small content index only if the project collection becomes large enough to need filtering. Avoid adding a framework or CMS simply to publish three more case studies. Serve visual assets locally, compress new photography, provide meaningful captions and keep the homepage lightweight.

Before each publication, check mobile and desktop layouts, all navigation/download links, PDF privacy, factual claims and keyboard access. Keep the editable résumé in the local Job Project as the source of truth; update the website PDF and Word download together after changes. The full unredacted score report should only be shared through the appropriate private application process.
