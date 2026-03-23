# Agent Hiring Standard (AHS) — Complete Field Specification v2

> **What this document is:** The complete reference spec for the AHS online intake form. Every field is defined with its type, helper text, placeholder, validation rules, UI behavior, and — where it matters — examples of good vs bad answers. This document is the source of truth for building the web form, the Filler prompt, and the Converter prompt.

> **Who fills this form:** Anyone with business context about the role being hired. The person filling this understands the job, the team, and the workflows. They may not know anything about AI, agents, or the platform that will run the employee.

> **Target audience for THIS document:** Anyone building a form or interface from this spec, or using it as a reference for the Filler and Converter prompts. Every field spec is written to be directly implementable. When the type says "Dropdown," build a dropdown. When it says "Repeatable block," build a block the user can duplicate. UI notes are included where behavior isn't obvious.

> **Design principles:**
> - Hiring language, not tech language. Zero technical jargon in user-facing copy.
> - Choices where possible (dropdowns, chips, checkboxes). Free text where nuance is needed.
> - Rich helper text on every field — explain WHY we're asking, not just WHAT.
> - Placeholders that model good answers, not just label the field.
> - File uploads in one place: per-skill reference documents (field 4.8). Everything else is text.
> - No technical fields anywhere (no connection methods, auth types, env vars, API configs).
> - All sections can be saved independently (save-per-section, not a single giant form submit).
> - Progress indicator visible at all times showing section completion status.

> **OpenClaw Implementation Note:** These limits are specific to the OpenClaw runtime and may vary by platform. They are not part of the AHS standard.
>
> **Internal — Token Budget Note (not displayed to user):**
> OpenClaw truncates bootstrap files at 20,000 chars per file and 150,000 chars total across all workspace files. The Converter must respect these limits:
> - SOUL.md: ≤ 2,000 words (~8,000 chars)
> - AGENTS.md: ≤ 1,200 words (~5,000 chars)
> - Each SKILL.md: ≤ 1,500 words (~6,000 chars)
> - HEARTBEAT.md: 3–6 items, ≤ 800 chars
> - USER.md, IDENTITY.md, TOOLS.md, MEMORY.md: ≤ 500 words each
> - SETUP.md: No limit (read by installing agent, not injected into bootstrap)
> - Total bootstrap injection: aim for ≤ 100,000 chars to leave headroom

---

## Form Header

Before any fields, the form opens with this context block. **This is static — not editable. Display it as a banner or introductory card.**

> **You're hiring an AI agent.**
>
> This form captures everything your new employee needs to know to do their job well. Think of it exactly like onboarding a new hire: who they are, what they do, what your business looks like, what "good work" means, and what mistakes to avoid.
>
> Be specific. The more detail you give here, the better your employee performs from day one.
>
> **Estimated time:** 30–60 minutes. You can save and return anytime.

**Dev note:** Show a progress sidebar/stepper with all 6 section names. Mark each section as: Empty, In Progress, or Complete based on required field validation. The user should be able to jump to any section at any time.

---

## Section 1 — Role Definition

*Section intro shown to user (display as a section header card):*
> Describe the job. What does this employee do, and what should they never do?

---

### 1.1 Job Title
| Property | Value |
|----------|-------|
| **Type** | Text input (single line) |
| **Required** | Yes |
| **Validation** | 3–80 characters |
| **Helper text** | What would this role be called if you were posting it on a job board? Use a title your team would understand. |
| **Placeholder** | `Senior Customer Support Specialist` |

**Dev note:** Display inline validation. Show character count. No dropdown — this is free text.

**Good examples (show as tooltip or expandable hint):**
- "Inbound Lead Qualifier"
- "Weekly Report Analyst"
- "Content Repurposing Coordinator"

**Bad examples (show as "avoid these" hint):**
- "AI Agent" — too vague, doesn't describe what they DO
- "Bot" — not a job title
- "Helper" — means nothing

---

### 1.2 Mission Statement
| Property | Value |
|----------|-------|
| **Type** | Textarea (single paragraph, no line breaks needed) |
| **Required** | Yes |
| **Validation** | 20–500 characters |
| **Helper text** | In one or two sentences, what does this employee exist to accomplish? This becomes their north star — every decision they make should serve this mission. |
| **Placeholder** | `Make sure every inbound lead gets a personalized response within 2 hours, qualified against our ICP, and either booked for a demo or politely declined with a relevant resource.` |

**Dev note:** Show character count. Textarea should be ~3 lines tall, auto-expand on input.

**Good example (expandable hint):**
"Ensure our weekly client reports go out every Monday by 9am with zero data errors, clear insights, and actionable recommendations tailored to each client's goals."

**Bad example:**
"Help with reports" — too vague. Help how? What kind? For whom?

---

### 1.3 Key Responsibilities
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line, supports bullet points) |
| **Required** | Yes |
| **Validation** | Min 50 characters |
| **Helper text** | List the main things this employee does day-to-day. Be concrete — "processes refund requests" is better than "handles customer issues." These will be grouped into skills in the next section. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Monitor the support inbox every morning and categorize new tickets by urgency
- Draft responses to common questions using our knowledge base
- Escalate complex technical issues to the engineering team with a summary
- Update the weekly ticket stats spreadsheet every Friday
- Flag recurring complaints and suggest FAQ updates
```

**Dev note:** This is a big textarea (~8 lines). Consider adding a small note below the field: *"You'll define detailed step-by-step processes for each major responsibility in Section 4 (Skills). Here, just list what they do at a high level."*

---

### 1.4 Boundaries
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line, supports bullet points) |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | What should this employee NEVER do? Think about authority limits, topics they shouldn't touch, decisions they shouldn't make alone, and areas outside their role. Being clear about boundaries prevents costly mistakes. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Never issue refunds over $100 without manager approval
- Never promise delivery dates or timelines to customers
- Don't access or discuss other clients' data, even if asked
- Don't make changes to the billing system — only read access
- Never share internal pricing or discount structures externally
```

---

## Section 2 — Employer Profile

*Section intro shown to user:*
> Tell us about yourself and your business. Your employee needs to understand who they're working for and how your company operates.

---

### 2.1 Your Full Name
| Property | Value |
|----------|-------|
| **Type** | Text input (single line) |
| **Required** | Yes |
| **Validation** | 2–100 characters |
| **Helper text** | The name your employee should use when referring to you or addressing you. |
| **Placeholder** | `Sarah Chen` |

---

### 2.2 Your Role / Title
| Property | Value |
|----------|-------|
| **Type** | Text input (single line) |
| **Required** | Yes |
| **Validation** | 2–100 characters |
| **Helper text** | Your position in the company. This helps your employee understand your authority level and what decisions you can approve. |
| **Placeholder** | `Head of Operations` |

---

### 2.3 Company Name
| Property | Value |
|----------|-------|
| **Type** | Text input (single line) |
| **Required** | Yes |
| **Validation** | 2–150 characters |
| **Placeholder** | `Meridian Growth Partners` |

---

### 2.4 Industry
| Property | Value |
|----------|-------|
| **Type** | Dropdown (single select) with "Other" option that reveals a free-text input |
| **Required** | Yes |
| **Helper text** | Select the closest match. This helps your employee understand industry-specific language, norms, and expectations. |

**Options (alphabetical):**
1. Accounting & Finance
2. Advertising & Marketing
3. Agriculture
4. Architecture & Design
5. Automotive
6. Banking
7. Biotechnology
8. Construction
9. Consulting
10. E-commerce & Retail
11. Education
12. Energy & Utilities
13. Engineering
14. Entertainment & Media
15. Environmental Services
16. Fashion & Apparel
17. Food & Beverage
18. Government
19. Healthcare
20. Hospitality & Tourism
21. Human Resources
22. Insurance
23. IT & Software
24. Legal
25. Logistics & Supply Chain
26. Manufacturing
27. Mining
28. Nonprofit
29. Pharmaceuticals
30. Real Estate
31. Recruiting & Staffing
32. Research
33. SaaS
34. Sports & Recreation
35. Telecommunications
36. Transportation
37. Venture Capital & Private Equity
38. Other → **reveals:** text input, placeholder: `Describe your industry`, validation: 2–100 chars

**Dev note:** When "Other" is selected, show a text input inline below the dropdown. The free-text value replaces the dropdown value in the submitted data.

---

### 2.5 Company Size
| Property | Value |
|----------|-------|
| **Type** | Dropdown (single select) |
| **Required** | Yes |
| **Helper text** | Approximate headcount. This gives context for formality, process complexity, and decision-making speed. |

**Options (in this order — NOT alphabetical):**
1. Just me
2. 2–10 employees
3. 11–50 employees
4. 51–200 employees
5. 201–1000 employees
6. 1000+ employees

---

### 2.6 Business Context
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line) |
| **Required** | Yes |
| **Validation** | Min 50 characters |
| **Helper text** | In a few sentences, describe what your company does, who your customers are, and what stage you're at. Imagine you're explaining your business to a sharp new hire at lunch on their first day. |
| **Placeholder** | `We're a B2B SaaS company selling project management tools to mid-size construction firms. About 200 customers, $3M ARR, 15-person team. We're in a growth phase — just raised Series A and hiring aggressively. Our customers are not tech-savvy and need a lot of hand-holding during onboarding.` |

**Dev note:** Textarea ~5 lines tall. Show character count.

---

### 2.7 Timezone
| Property | Value |
|----------|-------|
| **Type** | Dropdown (single select), auto-detected from browser with manual override |
| **Required** | Yes |
| **Helper text** | Your working timezone. Your employee will schedule their work around this. |
| **Default** | Auto-detect from browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`) |

**Options:** All IANA timezones, grouped by region. Show common ones at top:
- US/Eastern (New York)
- US/Central (Chicago)
- US/Mountain (Denver)
- US/Pacific (Los Angeles)
- Europe/London
- Europe/Paris
- Europe/Berlin
- Asia/Dubai
- Asia/Kolkata
- Asia/Singapore
- Asia/Tokyo
- Australia/Sydney
- *Then full list grouped: Americas, Europe, Africa, Asia, Pacific*

**Dev note:** Show the auto-detected timezone prominently: "We detected your timezone as **America/New_York**. [Change]". The change button opens the full dropdown.

---

### 2.8 Working Hours
| Property | Value |
|----------|-------|
| **Type** | Composite: two time pickers (Start, End) + multi-select checkboxes for days |
| **Required** | Yes |
| **Helper text** | When are you typically available? Your employee will schedule check-ins, send reports, and time their work within this window. |

**Time picker defaults:** 9:00 AM – 6:00 PM

**Time picker specs:**
- 12-hour format with AM/PM
- 30-minute increments (9:00, 9:30, 10:00, etc.)
- Start time must be before end time (validate on change)

**Day checkboxes (display as a horizontal row of toggleable buttons):**
- Monday ✓ (default on)
- Tuesday ✓ (default on)
- Wednesday ✓ (default on)
- Thursday ✓ (default on)
- Friday ✓ (default on)
- Saturday (default off)
- Sunday (default off)

**Dev note:** Display as a compact row: `[Start time picker] to [End time picker]` on one line, then the 7 day toggle buttons below. Validation: at least one day must be selected.

---

### 2.9 Tools You Use
| Property | Value |
|----------|-------|
| **Type** | Checkbox grid (multi-select, grouped by category) + "Other" free-text field at the bottom |
| **Required** | Yes (at least one checkbox OR an "Other" entry) |
| **Helper text** | Check every tool your employee will need to use or access. Don't worry about setup — we'll handle connections during installation. |

**Dev note:** Display as collapsible category groups. Each category header is clickable to expand/collapse. Checkboxes inside each group. On mobile, categories should be expanded by default. Include a search/filter input at the top of the grid that filters across all categories.

**Categories and options:**

**Communication:**
- [ ] Slack
- [ ] Microsoft Teams
- [ ] Gmail
- [ ] Outlook
- [ ] WhatsApp Business
- [ ] Telegram
- [ ] Discord
- [ ] Intercom
- [ ] Zendesk
- [ ] Front
- [ ] Crisp

**CRM & Sales:**
- [ ] HubSpot
- [ ] Salesforce
- [ ] Pipedrive
- [ ] Close
- [ ] Zoho CRM
- [ ] Freshsales
- [ ] Apollo
- [ ] Outreach

**Project Management:**
- [ ] Asana
- [ ] Trello
- [ ] Monday.com
- [ ] ClickUp
- [ ] Jira
- [ ] Linear
- [ ] Basecamp
- [ ] Notion
- [ ] Todoist

**Documents & Knowledge:**
- [ ] Google Docs
- [ ] Google Sheets
- [ ] Microsoft Word
- [ ] Microsoft Excel
- [ ] Notion
- [ ] Confluence
- [ ] Airtable
- [ ] Coda

**Marketing:**
- [ ] Mailchimp
- [ ] ConvertKit
- [ ] ActiveCampaign
- [ ] Klaviyo
- [ ] Buffer
- [ ] Hootsuite
- [ ] Canva
- [ ] WordPress
- [ ] Webflow
- [ ] Shopify

**Finance & Accounting:**
- [ ] QuickBooks
- [ ] Xero
- [ ] Stripe
- [ ] FreshBooks
- [ ] Wave
- [ ] PayPal

**Calendar & Scheduling:**
- [ ] Google Calendar
- [ ] Outlook Calendar
- [ ] Calendly
- [ ] Cal.com
- [ ] SavvyCal

**File Storage:**
- [ ] Google Drive
- [ ] Dropbox
- [ ] OneDrive
- [ ] Box

**Analytics:**
- [ ] Google Analytics
- [ ] Mixpanel
- [ ] Amplitude
- [ ] Hotjar
- [ ] Plausible

**Customer Support:**
- [ ] Zendesk
- [ ] Intercom
- [ ] Freshdesk
- [ ] Help Scout
- [ ] Crisp

**Development & Technical:**
- [ ] GitHub
- [ ] GitLab
- [ ] Vercel
- [ ] Netlify
- [ ] AWS Console

**Social Media:**
- [ ] LinkedIn
- [ ] Twitter/X
- [ ] Instagram
- [ ] Facebook
- [ ] TikTok
- [ ] YouTube

**Other:**
Free-text input. Placeholder: `Add any tools not listed above, separated by commas`
Validation: optional, free-text, no min length.

**Dev note:** The "Other" field appears below all categories, always visible. If the user types tool names in "Other," treat each comma-separated value as a separate tool entry in the submitted data. Note that some tools appear in multiple categories (Notion, Zendesk, Intercom, Crisp) — they should only submit once if checked in any category. Deduplicate on submit.

---

### 2.10 Who Reviews the Work
| Property | Value |
|----------|-------|
| **Type** | Composite: text input (name) + dropdown (review style) |
| **Required** | Yes |
| **Helper text** | Who checks this employee's output before it goes to its final destination? This is the person who catches mistakes, approves deliverables, and gives feedback. If it's you, just say so. |

**Text input:**
- Placeholder: `Me (Sarah Chen)` or `James Park, Senior Account Manager`
- Validation: 2–200 characters

**Dropdown — Review style (single select):**
1. Reviews everything before it goes out
2. Spot-checks occasionally
3. Only reviews flagged items
4. No review — employee works independently

**Dev note:** Display the text input and dropdown side by side on desktop (text input 60% width, dropdown 40%). Stack on mobile.

---

### 2.11 Preferred Communication Channel
| Property | Value |
|----------|-------|
| **Type** | Single select (radio buttons or button group — NOT dropdown, since there are few options) |
| **Required** | Yes |
| **Helper text** | How do you want to communicate with your employee day-to-day? This is where they'll send you updates, ask questions, and deliver work. |

**Options (display as a button group with icons if possible):**
1. Telegram
2. Slack
3. WhatsApp
4. Discord
5. Microsoft Teams
6. iMessage
7. Signal
8. Other → **reveals:** text input, placeholder: `Which channel?`, validation: 2–50 chars

**Dev note:** Display as a horizontal button group (like radio-button cards). Each option shows the channel name. When "Other" is selected, show the text input inline below.

---

## Section 3 — Critical Failures

*Section intro shown to user (display prominently — this section is emphasized):*

> **⭐ This is the most important section of the form.**
>
> Every employer knows what they DON'T want faster than they can describe what they DO want. The mistakes that keep you up at night, the errors that cost real money, the failures you've already lived through — this is where your employee learns what to avoid at all costs.
>
> Be brutally honest. Vague answers here lead to vague employees.

**Dev note:** Style this section intro differently from others — use a yellow/amber highlight or a ⭐ icon to signal importance. In the progress sidebar, mark this section with a star and the label "Most Important."

---

### 3.1 Dealbreakers
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line, tall — at least 8 lines visible) |
| **Required** | Yes |
| **Validation** | Min 50 characters |
| **Helper text** | These are firing offenses. Things that, if your employee did them even once, would destroy trust or cause serious damage. Think: wrong information sent to a client, confidential data leaked, a deadline missed that cost real money. List every scenario you can think of. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Sending a report to the wrong client (mixing up client data is unforgivable)
- Using outdated pricing — our pricing changes quarterly and using old numbers has cost us deals
- Making up information when they don't know the answer instead of saying "let me check"
- Responding to a customer complaint with a dismissive or defensive tone
- Sharing any client's data, results, or strategy with another client, even anonymously
```

**Guidance note (display below the field as a small hint):**
*The more specific you are, the better. "Don't make errors" is useless. "Never send a proposal with the wrong client name in it — this happened twice last year and we lost both clients" is gold.*

---

### 3.2 Tolerable Mistakes
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line) |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | What mistakes can you live with? Every employee makes errors — which ones are forgivable, fixable, or just part of learning? This helps your employee calibrate risk: they'll be more cautious about dealbreakers and less paralyzed about tolerable mistakes. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Minor formatting inconsistencies in internal docs (not client-facing)
- Slightly delayed responses (within same day is fine, just not hours late)
- Asking me a question they could have figured out themselves — better safe than sorry
- Small grammatical errors in first drafts that get caught in review
- Over-categorizing a ticket as urgent when it wasn't — erring on the side of caution is fine
```

---

### 3.3 Past Failures & Horror Stories
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line, tall) |
| **Required** | No — but display as **"Highly Recommended"** with a different visual treatment |
| **Validation** | Min 50 characters if filled |
| **Helper text** | Tell us about times this role went wrong — with a previous employee, a contractor, or even when you were doing it yourself. What happened? What was the impact? What would have prevented it? These real stories become the most powerful guardrails for your new employee. |
| **Placeholder** | (display as pre-formatted paragraphs) |

**Placeholder content:**
```
Last quarter, our VA sent the monthly performance report to Client A with Client B's data in it. Client A saw another company's revenue numbers and nearly terminated their contract. The root cause was copy-pasting from last month's template without clearing the data first.

We also had a situation where a support rep promised a customer that a bug would be fixed "by end of week" without checking with engineering. The fix took 3 weeks. The customer churned. Now we have a strict rule: never promise timelines, only say "I'll check with the team and get back to you."
```

**Dev note:** The "Highly Recommended" label should use an amber badge or similar visual indicator, distinct from both "Required" (red) and "Optional" (gray). Consider showing a motivational micro-copy like: *"Real stories = real guardrails. This is where your employee learns the hard way — without the cost."*

---

### 3.4 Confidentiality Rules
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line) |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | What information should your employee treat as strictly confidential? Who should they NEVER share certain information with? Think about client data, pricing, internal metrics, strategy documents, employee information, and anything else that shouldn't leave certain boundaries. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Client data is strictly siloed — never reference one client's data when working on another client's account, even in internal notes
- Our internal pricing model and discount tiers are confidential — never share with clients or prospects
- Revenue numbers, churn rates, and financial metrics are internal only
- Employee salary and performance data is off-limits
- Draft strategies and unreleased product features should never be mentioned externally
```

---

## Section 4 — Core Skills

*Section intro shown to user:*
> Now let's define the specific skills your employee needs. Each skill is a business process that will be built into a skill document your employee can execute. You'll define the process, quality bar, and failure modes -- the platform builds these into executable skill files.
>
> Most roles have 2-6 core skills. You defined responsibilities in Section 1 -- now we'll break them into step-by-step processes.
>
> **Example:** A "Customer Support Specialist" might have these skills:
> - Ticket Triage & Response
> - Escalation Handling
> - Weekly Ticket Analysis Report
> - FAQ & Knowledge Base Updates

**Dev note:** This entire section is a **repeatable block**. The user fills one skill block, then can click "Add Another Skill" to duplicate the block (empty). Show a skill counter: "Skill 1 of 2" (minimum 2, maximum 6). Display an "Add Another Skill" button after the last skill block. Disable it when 6 skills exist. Show a "Remove Skill" button on each block (except when only 2 remain — then hide it). Each skill block should be collapsible (click to expand/collapse) after it's been filled, showing just the skill name as a summary header.

---

*Repeatable block — user adds 2 to 6 skill blocks. Each block contains fields 4.1 through 4.8:*

### 4.1 Skill Name
| Property | Value |
|----------|-------|
| **Type** | Text input (single line) |
| **Required** | Yes |
| **Validation** | 3–80 characters |
| **Helper text** | A clear, descriptive name for this business process. Use action-oriented names that describe what the skill accomplishes. |
| **Placeholder** | `Inbound Lead Qualification` |

**Good examples:** "Weekly Client Report Generation", "Support Ticket Triage", "Invoice Processing & Follow-up"
**Bad examples:** "Reports", "Emails", "Stuff" — too vague to be useful

**Dev note:** When this field is filled, use its value as the collapsed header for the skill block: "Skill 1: Inbound Lead Qualification [expand/collapse]"

---

### 4.2 When This Skill Is Used
| Property | Value |
|----------|-------|
| **Type** | Textarea (short, ~2 lines) |
| **Required** | Yes |
| **Validation** | 10–500 characters |
| **Helper text** | What triggers this skill? Is it a scheduled task, or does something need to happen first? Describe the situations or events that mean this skill should kick in. |
| **Placeholder** | `When a new lead comes in through the website contact form, gets added to HubSpot, or emails us directly. Also when an existing lead follows up after going quiet.` |

**Good examples:** "Every Monday at 8am", "When a customer replies to a support ticket", "When a new invoice is received via email"
**Bad example:** "When needed" — when is that?

---

### 4.3 Process Steps
| Property | Value |
|----------|-------|
| **Type** | Ordered list of text inputs (repeatable, drag-to-reorder) |
| **Required** | Yes (minimum 3 steps) |
| **Validation** | 3–15 steps, each step min 10 characters |
| **Helper text** | Walk through this process step by step, as if you're training a new hire who's smart but has never done this before. Each step should be one clear action. Include where to find information, what to check, and what to produce. |

**Dev note:** Build this as an ordered list UI:
- Each step is a text input with a step number label (1, 2, 3...)
- Show a drag handle on the left for reordering
- Show a delete (×) button on the right (hidden when 3 steps remain)
- Show an "Add Step" button below the last step (hidden when 15 steps exist)
- Start with 3 empty step inputs visible
- Each input: single line, placeholder changes per step number

**Step placeholders (rotate through these as defaults for new steps):**
- Step 1: `Check HubSpot for new leads that came in since the last check — look in the "New" pipeline stage`
- Step 2: `For each lead, visit their website and LinkedIn to understand their business, size, and what they might need from us`
- Step 3: `Compare the lead against our ICP checklist: B2B company, 50-500 employees, uses project management tools`
- Step 4: `Score the lead: Hot (matches 4+ ICP criteria), Warm (matches 2-3), Cold (matches 0-1)`
- Step 5: `For Hot leads, draft a personalized outreach email referencing something specific from their website`
- Step 6+: `Describe the next action in the process`

---

### 4.4 Quality Bar
| Property | Value |
|----------|-------|
| **Type** | Textarea |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | What does "good enough" look like for this skill? Describe the standard that output needs to meet before it's considered done. Think about accuracy, completeness, tone, formatting, and timeliness. Be as specific as possible — "good quality" means nothing, but "zero factual errors, all numbers sourced, delivered by 9am Monday" means everything. |
| **Placeholder** | `Every qualified lead gets a personalized email within 2 hours of entering the system. "Personalized" means referencing at least one specific detail from their company (not just their name). HubSpot records are updated same-day with score, reasoning, and action taken. Zero leads should sit in "New" for more than 4 hours during business hours.` |

---

### 4.5 Failure Modes
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line) |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | How does this skill typically go wrong? What are the common mistakes, shortcuts, or misunderstandings that degrade quality? Think about what you've seen go wrong before, or what you'd worry about if you handed this to someone new. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Sending a generic template without actually personalizing it — leads can tell and it kills response rates
- Scoring a lead as "Hot" just because they're a big company, without checking if they actually match our ICP
- Spending too long researching each lead (10 min max per lead — we need volume)
- Forgetting to update HubSpot, so the sales team doesn't know a lead has been contacted
- Missing the competitor mention flag — sales needs to know about these immediately
```

---

### 4.6 Who Uses the Output
| Property | Value |
|----------|-------|
| **Type** | Text input (single line) |
| **Required** | Yes |
| **Validation** | 5–300 characters |
| **Helper text** | Who receives or consumes what this skill produces? A specific person, a team, customers, or a system? Knowing the audience shapes the quality and format of the work. |
| **Placeholder** | `Sales team (Jake and Maria) reviews qualified leads in HubSpot. Prospects receive the outreach emails directly.` |

---

### 4.7 Frequency
| Property | Value |
|----------|-------|
| **Type** | Single select (dropdown) |
| **Required** | Yes |
| **Helper text** | How often does this skill get used? This helps set up the right schedule and prioritization. |

**Options (in this order):**
1. Multiple times per day
2. Daily
3. A few times per week
4. Weekly
5. Bi-weekly
6. Monthly
7. As needed (triggered by events)

---

### 4.8 Reference Documents (per skill)
| Property | Value |
|----------|-------|
| **Type** | File upload (multiple files, drag-and-drop zone) |
| **Required** | No |
| **Accepted formats** | PDF, DOCX, TXT, MD, XLSX, CSV, PNG, JPG |
| **Max files** | 5 per skill |
| **Max size per file** | 25MB |
| **Helper text** | Upload documents specific to THIS skill — templates, checklists, scoring rubrics, example outputs, SOPs. These become the skill's reference library. If you have a "perfect example" of what good output looks like, upload it here. |

**Dev note:** Show the drag-and-drop zone with a file list. The zone should be clearly scoped to this skill (visually inside the skill block, not floating outside it).

---

*End of repeatable skill block.*

**Dev note:** Below the last skill block, show:
- "**+ Add Another Skill**" button (disabled when 6 skills exist, with tooltip: "Maximum 6 skills per employee")
- "**Remove Skill**" button on each block (hidden when only 2 remain, with confirmation dialog: "Remove this skill? This can't be undone.")
- Skill count indicator: "2 of 6 skills defined" (turns green at 2+)

---

## Section 5 — Operating Model

*Section intro shown to user:*
> How should your employee communicate, make decisions, and manage their day? This shapes their personality and operating rhythm.

---

### 5.1 Tone
| Property | Value |
|----------|-------|
| **Type** | Composite: selectable chips (multi-select, pick 2–5) + optional textarea for refinement |
| **Required** | Yes (at least 2 chips selected) |
| **Validation** | 2–5 chips selected |
| **Helper text** | What should your employee sound like? Pick 2–5 words that describe their communication style. |

**Chip options (display as a grid of toggleable pill/chip buttons):**
- Professional
- Friendly
- Direct
- Casual
- Formal
- Warm
- Concise
- Detailed
- Enthusiastic
- Measured
- Empathetic
- Assertive
- Playful
- Diplomatic
- No-nonsense

**Dev note:** Display chips as a flex-wrap grid of pill-shaped buttons. Selected chips get a filled/highlighted state. Show a counter: "2 of 2–5 selected". Disable further selection after 5. Show validation error if user tries to proceed with <2.

**Free text refinement (below chips):**

| Property | Value |
|----------|-------|
| **Type** | Textarea (optional, ~3 lines) |
| **Required** | No |
| **Helper text** | Anything else about how they should sound? Any phrases they should use or avoid? |
| **Placeholder** | `Sound like a knowledgeable colleague, not a corporate robot. Use "we" not "I" when talking about the company. Never use exclamation marks in client-facing emails. It's okay to be slightly informal in Slack but always professional in emails.` |

---

### 5.2 Decision Freedom
| Property | Value |
|----------|-------|
| **Type** | Single select (radio cards — large clickable cards, NOT a dropdown) |
| **Required** | Yes |
| **Helper text** | How much rope does your employee get? There's no wrong answer — it depends on the role and your comfort level. You can always adjust this later. |

**Options (display as 4 stacked cards, each with a title and description):**

1. **Ask first**
   Check with me before taking any action. I want to approve everything.

2. **Small decisions alone**
   Handle routine, low-risk tasks independently. Ask me about anything new, unusual, or high-stakes.

3. **Act, then inform**
   Take action on most things independently and tell me what you did. Only stop and ask if you're genuinely unsure or the stakes are high.

4. **Full autonomy**
   Handle everything within your role independently. Only come to me with problems you can't solve or decisions above your authority.

**Dev note:** Display as radio cards (only one can be selected). Each card shows the bold title and the description text. Highlight the selected card with a border/fill change. Default: none selected (force user to choose). These are NOT a dropdown — the descriptions are important context for the user's decision.

---

### 5.3 Daily Routine
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line, tall — at least 8 lines visible) |
| **Required** | Yes |
| **Validation** | Min 50 characters |
| **Helper text** | Describe what a typical workday looks like for this employee, from start to finish. What do they do first? What recurring tasks happen at specific times? When do they check in with you? This becomes their daily schedule. |
| **Placeholder** | (display as pre-formatted block) |

**Placeholder content:**
```
Start of day (9am):
- Check for overnight emails and messages, handle anything urgent
- Review today's calendar for any deadlines or meetings

Morning (9:30am - 12pm):
- Process new inbound leads (main focus block)
- Update CRM records

Afternoon (1pm - 4pm):
- Follow up on leads from previous days that haven't responded
- Draft weekly pipeline summary (Fridays only)

End of day (4:30pm):
- Send me a quick summary of what was done today and anything that needs my attention tomorrow
```

---

### 5.4 Escalation Triggers
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line) |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | When should your employee stop what they're doing and come to you (or someone else) immediately? These are the situations where they should NOT try to handle it alone. Be specific — "when something goes wrong" doesn't help, but "when a client threatens to cancel" does. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Come to me immediately if: a client expresses dissatisfaction or threatens to leave
- Come to me immediately if: you encounter a request that touches legal, contracts, or pricing
- Flag to Jake (sales lead) if: a lead mentions a specific competitor or asks for a feature we don't have
- Stop and ask if: you're unsure whether a lead is a good fit — don't guess
- Stop and ask if: any task will take more than 30 minutes and wasn't part of the normal process
```

---

### 5.5 KPIs
| Property | Value |
|----------|-------|
| **Type** | Textarea (multi-line) |
| **Required** | Yes |
| **Validation** | Min 30 characters |
| **Helper text** | How do you measure success for this role? List the specific metrics or outcomes that tell you your employee is doing well. These will be checked during regular performance reviews. Be realistic — 3–5 meaningful KPIs are better than 15 vague ones. |
| **Placeholder** | (display as pre-formatted lines) |

**Placeholder content:**
```
- Lead response time: < 2 hours during business hours
- Lead qualification accuracy: < 5% of "Hot" leads turn out to be bad fits
- CRM hygiene: 100% of leads have scores, notes, and action status by end of day
- Weekly pipeline report delivered by Monday 9am with zero errors
- Competitor mentions flagged within 1 hour
```

---

### 5.6 Silence Handling
| Property | Value |
|----------|-------|
| **Type** | Single select (radio cards) + optional free text for "Other" |
| **Required** | Yes |
| **Helper text** | What should your employee do during downtime? When the inbox is empty and all tasks are done — should they look for improvements, check in with you, or just wait? |

**Options (display as 4 stacked radio cards):**

1. **Proactive check-ins**
   When there's nothing urgent, look for ways to improve processes, clean up data, or prepare for upcoming tasks. Send me a note about what you worked on.

2. **Ask me**
   When you've finished your tasks and nothing new has come in, ask me if there's anything else.

3. **Stand by quietly**
   When there's nothing to do, just wait. Don't create busywork. I'll reach out when I need something.

4. **Other** → **reveals:** textarea, placeholder: `Describe what they should do during downtime`, validation: min 10 characters

**Dev note:** Same radio-card style as 5.2. When "Other" is selected, show the textarea inline below the cards.

---

### 5.7 Reporting
| Property | Value |
|----------|-------|
| **Type** | Composite: dropdown (frequency) + textarea (content description) |
| **Required** | Yes |
| **Helper text** | What regular updates do you want from your employee? Describe what these reports should include and when you want them. Think of this as their "stand-up" or "status update." |

**Frequency dropdown (single select):**
1. Daily
2. Twice weekly
3. Weekly
4. Only when something important happens

**Content textarea:**
| Property | Value |
|----------|-------|
| **Validation** | Min 20 characters |
| **Placeholder** | `End-of-day summary: what was done, what's pending, anything that needs my attention. Keep it short — 5-10 bullet points max. On Fridays, include a weekly wrap-up with numbers (leads processed, emails sent, response times). Send these in our Slack channel.` |

**Dev note:** Display frequency dropdown and textarea stacked vertically. The dropdown goes first (labeled "How often?"), the textarea below (labeled "What should the report include?").

---

### 5.8 Improvement Areas
| Property | Value |
|----------|-------|
| **Type** | Textarea |
| **Required** | No |
| **Validation** | Min 20 characters if filled |
| **Helper text** | What should your employee actively get better at over time? Areas where you expect them to learn, improve their judgment, or develop deeper expertise as they gain experience in your business. |
| **Placeholder** | `Over time, should get better at: identifying which leads are genuinely interested vs just kicking tires (pattern recognition from seeing outcomes). Should also learn our product deeply enough to answer basic prospect questions without looking things up.` |

---

## Section 6 — Domain Knowledge

*Section intro shown to user:*
> Does your employee need to know about specific regulations, frameworks, or industry-specific information? Describe any reference materials that round out their knowledge.

**Dev note:** This section has no required fields. Show a banner at the top: "All fields in this section are optional. Fill what applies to your business."

---

### 6.1 Regulations & Compliance
| Property | Value |
|----------|-------|
| **Type** | Textarea |
| **Required** | No |
| **Helper text** | Are there any laws, regulations, industry standards, or internal compliance policies your employee must follow? Think about data privacy (GDPR, HIPAA), industry regulations, advertising standards, financial rules, or internal policies. If you have compliance documents, attach them to the relevant skill in Section 4. |
| **Placeholder** | `We handle EU customer data, so GDPR applies to everything. Never store personal data outside our approved systems. All marketing emails must include unsubscribe links (CAN-SPAM). Our industry (construction SaaS) has no specific regulations, but we follow SOC 2 practices internally.` |
| **Validation** | None (optional) |

---

### 6.2 Frameworks & Methodologies
| Property | Value |
|----------|-------|
| **Type** | Textarea |
| **Required** | No |
| **Helper text** | Does your employee need to follow specific frameworks, methodologies, scoring rubrics, or decision-making models? Describe them here. If you have framework documents, attach them to the skill that uses them in Section 4. |
| **Placeholder** | `We use the BANT framework for lead qualification (Budget, Authority, Need, Timeline). We also follow the "Reply Within 3" methodology for customer support — first response within 3 hours, resolution within 3 business days.` |
| **Validation** | None (optional) |

---

### 6.3 General Reference Materials
| Property | Value |
|----------|-------|
| **Type** | Textarea |
| **Required** | No |
| **Helper text** | Anything else your employee should know as background — product details, competitor landscape, customer personas, brand voice, market context. If you have reference documents, attach them to the relevant skill in Section 4. |
| **Placeholder** | `Our main competitors are Acme and Zenith — we win on service quality, they win on price. Our ideal customer is a mid-size B2B company doing $5-50M revenue. Our product one-pager and customer persona docs are attached to the lead qualification skill.` |
| **Validation** | None (optional) |

---

### 6.4 Anything Else
| Property | Value |
|----------|-------|
| **Type** | Textarea |
| **Required** | No |
| **Validation** | None |
| **Helper text** | Is there anything important about this role, your business, or your expectations that we didn't ask about? This is your catch-all — anything that would help your employee succeed that doesn't fit neatly into the sections above. |
| **Placeholder** | `We're going through a rebrand in Q2 — the employee should know that our company name will change from "BuildFlow" to "Meridian" and all materials will need updating. Also, our biggest client is Thornton Construction — they get priority on everything.` |

---

## Form Submission

After completing all sections, the user sees a summary view. **Build this as a dedicated review screen, not an inline summary.**

> **Review your hiring standard**
>
> Section 1 — Role Definition: ✅ Complete
> Section 2 — Employer Profile: ✅ Complete
> Section 3 — Critical Failures: ✅ Complete (⭐ Most important)
> Section 4 — Core Skills: ✅ 3 skills defined
> Section 5 — Operating Model: ✅ Complete
> Section 6 — Domain Knowledge: ⚠️ Optional fields empty
>
> **Attachments:** 3 files uploaded (per-skill references)
>
> [Edit any section] [Submit]

**Dev notes for the review screen:**
- Each section row is clickable to jump back to that section.
- Show ✅ for sections where all required fields are filled.
- Show ⚠️ for sections with only optional fields empty (valid, just incomplete).
- Show ❌ for sections with missing required fields (block submission).
- Show a file count for per-skill references (the only upload point is AHS 4.8).
- The Submit button is disabled until all ❌ sections are resolved.
- On submit, collect all field values as a JSON object keyed by field IDs (1.1, 1.2, ..., 6.4) + a file manifest listing each uploaded file with its field ID, skill index (if applicable), original filename, size, and MIME type.

---

## Field ID Reference

For use by the Filler prompt and Converter prompt. **This table is the contract between the form frontend and the backend pipeline.**

| Field ID | Section | Field Name | Type | Required | Filler Can Pre-fill? |
|----------|---------|------------|------|----------|---------------------|
| 1.1 | Role | Job Title | text | Yes | ✅ Yes |
| 1.2 | Role | Mission Statement | textarea | Yes | ✅ Yes |
| 1.3 | Role | Key Responsibilities | textarea | Yes | ✅ Yes |
| 1.4 | Role | Boundaries | textarea | Yes | ✅ Partially |
| 2.1 | Employer Profile | Your Full Name | text | Yes | ❌ No |
| 2.2 | Employer Profile | Your Role/Title | text | Yes | ❌ No |
| 2.3 | Employer Profile | Company Name | text | Yes | ⚠️ Maybe |
| 2.4 | Employer Profile | Industry | dropdown | Yes | ⚠️ Maybe |
| 2.5 | Employer Profile | Company Size | dropdown | Yes | ❌ No |
| 2.6 | Employer Profile | Business Context | textarea | Yes | ⚠️ Maybe |
| 2.7 | Employer Profile | Timezone | dropdown | Yes | ❌ No |
| 2.8 | Employer Profile | Working Hours | composite | Yes | ⚠️ Maybe |
| 2.9 | Employer Profile | Tools You Use | checkbox-grid | Yes | ✅ Yes |
| 2.10 | Employer Profile | Who Reviews the Work | composite | Yes | ❌ No |
| 2.11 | Employer Profile | Preferred Channel | radio-group | Yes | ❌ No |
| 3.1 | Failures | Dealbreakers | textarea | Yes | ❌ No |
| 3.2 | Failures | Tolerable Mistakes | textarea | Yes | ❌ No |
| 3.3 | Failures | Past Failures | textarea | Recommended | ❌ No |
| 3.4 | Failures | Confidentiality Rules | textarea | Yes | ❌ No |
| 4.1 | Core Skills | Skill Name | text | Yes | ✅ Yes |
| 4.2 | Core Skills | When This Skill Is Used | textarea | Yes | ✅ Yes |
| 4.3 | Core Skills | Process Steps | ordered-list | Yes | ✅ Partially |
| 4.4 | Core Skills | Quality Bar | textarea | Yes | ❌ No |
| 4.5 | Core Skills | Failure Modes | textarea | Yes | ❌ No |
| 4.6 | Core Skills | Who Uses the Output | text | Yes | ❌ No |
| 4.7 | Core Skills | Frequency | dropdown | Yes | ⚠️ Maybe |
| 4.8 | Core Skills | Reference Documents | file[] | No | ❌ No |
| 5.1 | Model | Tone | chips + textarea | Yes | ⚠️ Maybe |
| 5.2 | Model | Decision Freedom | radio-cards | Yes | ❌ No |
| 5.3 | Model | Daily Routine | textarea | Yes | ⚠️ Maybe |
| 5.4 | Model | Escalation Triggers | textarea | Yes | ❌ No |
| 5.5 | Model | KPIs | textarea | Yes | ⚠️ Maybe |
| 5.6 | Model | Silence Handling | radio-cards | Yes | ❌ No |
| 5.7 | Model | Reporting | composite | Yes | ❌ No |
| 5.8 | Model | Improvement Areas | textarea | No | ❌ No |
| 6.1 | Domain | Regulations & Compliance | textarea | No | ⚠️ Maybe |
| 6.2 | Domain | Frameworks & Methodologies | textarea | No | ❌ No |
| 6.3 | Domain | General Reference Materials | textarea | No | ❌ No |
| 6.4 | Domain | Anything Else | textarea | No | ❌ No |

---

## Downstream Mapping (where each field goes)

This is for the Converter prompt — which AHS field maps to which workspace file:

| AHS Field | → Workspace File | Purpose |
|-----------|-----------------|---------|
| 1.1 Job Title | IDENTITY.md | Agent name |
| 1.2 Mission | SOUL.md | Core identity, mission section |
| 1.3 Responsibilities | SOUL.md + AGENTS.md | Scope definition |
| 1.4 Boundaries | SOUL.md (anti-patterns) | Hard limits |
| 2.1–2.2 Name, Role | USER.md | Direct fields |
| 2.3–2.6 Company info | USER.md | Direct fields |
| 2.7 Timezone | USER.md + SETUP.md | Scheduling |
| 2.8 Working Hours | USER.md + SETUP.md | Active hours |
| 2.9 Tools | SETUP.md | Tool connection data |
| 2.10 Reviewer | USER.md + AGENTS.md | Approval workflow |
| 2.11 Channel | SETUP.md | Channel preference |
| 3.1 Dealbreakers | SOUL.md (anti-patterns, longest section) | Critical guardrails |
| 3.2 Tolerable Mistakes | SOUL.md (anti-patterns, calibration) | Risk calibration |
| 3.3 Past Failures | SOUL.md (anti-patterns, stories) | Contextual guardrails |
| 3.4 Confidentiality | SOUL.md (anti-patterns) + AGENTS.md | Information boundaries |
| 4.1 Skill Name | skills/{name}/SKILL.md (frontmatter) | Skill identity |
| 4.2 When This Skill Is Used | skills/{name}/SKILL.md (body) | Activation context |
| 4.3 Process Steps | skills/{name}/SKILL.md (body) | Core instructions |
| 4.4 Quality Bar | skills/{name}/SKILL.md (body) | Success criteria |
| 4.5 Failure Modes | skills/{name}/SKILL.md (body) | Error prevention |
| 4.6 Output Audience | skills/{name}/SKILL.md (body) | Context for quality |
| 4.7 Frequency | skills/{name}/SKILL.md (body) + SETUP.md | Scheduling |
| 4.8 Skill Docs | skills/{name}/references/ | Actual files placed as-is |
| 5.1 Tone | SOUL.md (writing style — embodied, not listed) | Voice & personality |
| 5.2 Decision Freedom | AGENTS.md + SOUL.md | Autonomy level |
| 5.3 Daily Routine | SETUP.md (schedule data) | Schedule |
| 5.4 Escalation Triggers | AGENTS.md + SOUL.md (anti-patterns) | Escalation rules |
| 5.5 KPIs | HEARTBEAT.md | Periodic check items |
| 5.6 Silence Handling | AGENTS.md | Idle behavior |
| 5.7 Reporting | AGENTS.md + SETUP.md | Regular output |
| 5.8 Improvement Areas | SOUL.md | Growth direction |
| 6.1 Regulations | MEMORY.md (compliance seed) + SOUL.md | Compliance context |
| 6.2 Frameworks | skills/*/SKILL.md (inside the skill that uses them) | Methodology |
| 6.3 Reference Materials | SOUL.md | Domain context |
| 6.4 Anything Else | Most relevant workspace file | Operational context |

---

## Submission Payload Schema

**Dev note:** When the form is submitted, the frontend should produce this JSON structure. This is the input contract for the Filler and Converter prompts.

```json
{
  "version": "2.0",
  "submitted_at": "2026-03-21T14:30:00Z",
  "fields": {
    "1.1": "Senior Customer Support Specialist",
    "1.2": "Serve as the first point of contact...",
    "1.3": "- Monitor the support inbox...\n- Draft responses...",
    "1.4": "- Never issue refunds over $100...",
    "2.1": "Sarah Chen",
    "2.2": "Head of Operations",
    "2.3": "Acme Corp",
    "2.4": "SaaS",
    "2.4_other": null,
    "2.5": "11–50 employees",
    "2.6": "We're a B2B SaaS company...",
    "2.7": "America/New_York",
    "2.8": {
      "start": "09:00",
      "end": "18:00",
      "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    "2.9": {
      "checked": ["Slack", "HubSpot", "Gmail", "Google Sheets"],
      "other": "Internal wiki tool"
    },
    "2.10": {
      "name": "Me (Sarah Chen)",
      "review_style": "Spot-checks occasionally"
    },
    "2.11": "Slack",
    "2.11_other": null,
    "3.1": "- Sending a report to the wrong client...",
    "3.2": "- Minor formatting inconsistencies...",
    "3.3": "Last quarter, our VA sent...",
    "3.4": "- Client data is strictly siloed...",
    "4": [
      {
        "4.1": "Support Ticket Triage & Response",
        "4.2": "When a new customer inquiry arrives...",
        "4.3": [
          "Monitor the support inbox for new inquiries",
          "Categorize each ticket by priority and type",
          "Respond using the knowledge base",
          "Escalate technical issues to engineering"
        ],
        "4.4": "Every ticket gets a first response within 2 hours...",
        "4.5": "- Sending a generic response...\n- Miscategorizing priority...",
        "4.6": "Customers receive responses directly. Engineering gets escalations.",
        "4.7": "Multiple times per day",
        "search_hints": ["zendesk mcp integration", "help desk ticketing api connector"]
      }
    ],
    "5.1": {
      "chips": ["Professional", "Empathetic", "Direct"],
      "free_text": "Sound like a knowledgeable colleague..."
    },
    "5.2": "Small decisions alone",
    "5.3": "Start of day (9am):\n- Check for overnight emails...",
    "5.4": "- Come to me immediately if: a client expresses dissatisfaction...",
    "5.5": "- Lead response time: < 2 hours...",
    "5.6": {
      "choice": "Proactive check-ins",
      "other_text": null
    },
    "5.7": {
      "frequency": "Daily",
      "content": "End-of-day summary: what was done..."
    },
    "5.8": "Over time, should get better at...",
    "6.1": "We handle EU customer data, so GDPR applies...",
    "6.2": "",
    "6.3": "Our main competitors are Acme and Zenith...",
    "6.4": ""
  },
  "files": [
    {
      "field_id": "4.8",
      "skill_index": 0,
      "filename": "ticket-response-templates.docx",
      "size_bytes": 156789,
      "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "storage_key": "uploads/abc123/ticket-response-templates.docx"
    }
  ]
}
```

**Key schema notes for the dev:**
- `fields.4` is an array of skill objects (2–6 items). Each skill object contains fields 4.1–4.8 (4.8 files are referenced via the `files` array) plus `search_hints` (array of keyword phrases for finding MCP/tool integrations on ClawHub — populated by the Filler).
- `fields.2.4_other` and `fields.2.11_other` are the free-text values when "Other" is selected. `null` when the standard option is chosen.
- `fields.5.1` is an object with `chips` (array of selected chip labels) and `free_text` (string or null).
- `fields.5.6` is an object with `choice` (the selected option label) and `other_text` (string when "Other" is chosen, null otherwise).
- `fields.5.7` is an object with `frequency` (dropdown value) and `content` (textarea value).
- `fields.2.8` is an object with `start` (24h format), `end` (24h format), and `days` (array of day names).
- `fields.2.9` is an object with `checked` (array of tool names) and `other` (free-text string or null).
- `fields.2.10` is an object with `name` (text) and `review_style` (dropdown value).
- File uploads are in a separate `files` array. Only field 4.8 (per-skill reference documents) supports file uploads. Each entry references a `field_id` and a `skill_index` (0-based). The `storage_key` is the backend storage path — the frontend uploads files to storage and includes the key in the payload.
- Section 6 fields (6.1–6.4) are plain strings (text only, no file uploads).
