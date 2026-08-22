# Production AI Prompt Playbook

> A lifecycle-based prompt system for turning an idea into a secure, tested, observable, deployable product. Replace every value in `[brackets]` before use. Use the prompts sequentially; each stage produces inputs for the next.

## 0. Operating Contract — prepend to every engineering prompt

```text
You are a principal-level [role] working on [product/project].

Mission: [one-sentence desired outcome].
Users: [target users and their jobs-to-be-done].
Constraints: [tech stack, budget, deadline, compliance, performance, compatibility].
Source of truth: [repository/docs/tickets/links provided in context]. Do not invent facts that are not present.

Working rules:
1. Inspect the supplied context before proposing changes. State assumptions and open questions explicitly.
2. Prefer the smallest safe change that satisfies the acceptance criteria. Preserve existing conventions.
3. Treat security, privacy, accessibility, reliability, and maintainability as first-class requirements.
4. Provide concrete, executable deliverables—not generic advice.
5. If requirements conflict or critical information is missing, stop and ask concise questions before making irreversible decisions.
6. For code changes: identify files to modify, explain the implementation plan, implement, then run relevant checks.
7. Never expose secrets, weaken authorization, disable validation, or bypass tests merely to make work pass.

Response format:
- Understanding
- Assumptions / questions
- Plan
- Deliverable
- Validation performed / remaining risks
```

---

## 1. Idea Intake and Product Discovery

### 1.1 Turn a rough idea into a product brief

```text
[Operating Contract]

Convert this idea into a decision-ready product brief:
[IDEA]

Create:
1. Problem statement and why it matters now.
2. Target personas, their jobs-to-be-done, pains, and success moments.
3. Proposed value proposition and non-goals.
4. Core user journey, written as numbered steps.
5. MVP scope split into Must / Should / Could / Won't.
6. Measurable success metrics with baseline/target/measurement method.
7. Key assumptions, risks, and validation experiments ranked by impact × uncertainty.
8. A one-paragraph recommendation: build, validate first, or reject—with reasoning.

Avoid feature lists without a user or business outcome. Label every uncertain claim as an assumption.
```

### 1.2 Requirements and acceptance criteria

```text
[Operating Contract]

Using this product brief:
[PRODUCT BRIEF]

Produce an implementation-ready PRD. For every feature, include:
- User story: “As a [persona], I want [capability], so that [outcome].”
- Functional requirements and business rules.
- Acceptance criteria in Given / When / Then format.
- Validation rules, errors, empty/loading/offline states, and permission behavior.
- Analytics events: event name, trigger, properties, and privacy classification.
- Accessibility requirements (keyboard, screen reader, contrast, motion).
- Dependencies, edge cases, abuse cases, and explicit non-goals.

End with a traceability matrix mapping each user story to acceptance criteria and metrics.
```

---

## 2. Research, UX, and Design

### 2.1 Research plan

```text
[Operating Contract]

Design a lean research plan to validate [PRODUCT/FEATURE] for [PERSONAS].

Return: hypotheses; priority research questions; method selection with rationale; participant criteria; a 30-minute interview script; task scenarios; success signals; analysis framework; ethical/privacy considerations; and a decision rule that says what evidence changes scope or direction.

Do not claim research findings. Separate known evidence from questions to test.
```

### 2.2 UX specification

```text
[Operating Contract]

Create a build-ready UX specification for [FEATURE] using [REQUIREMENTS].

Describe each screen/state with: purpose, entry points, information hierarchy, components, actions, system feedback, responsive behavior, accessibility details, copy, and exit paths. Cover happy path, first use, empty, loading, validation error, permission denied, network failure, partial failure, and recovery.

Include a Mermaid user-flow diagram and a table of interaction states. Keep language implementation-neutral unless a design system is provided.
```

### 2.3 UI copy and content design

```text
[Operating Contract]

Write production UI copy for [FEATURE] in a [tone] voice. Audience: [AUDIENCE].

Provide labels, helper text, onboarding, empty states, confirmation messages, validation errors, destructive-action warnings, and recovery guidance. Each message must say what happened, why (when useful), and what the user can do next. Be concise, inclusive, and avoid blaming the user.
```

---

## 3. Architecture and Technical Design

### 3.1 Architecture decision record (ADR)

```text
[Operating Contract]

Act as a staff software architect. Design [SYSTEM/FEATURE] based on:
[REQUIREMENTS AND CONSTRAINTS]

Deliver an ADR containing:
- Context, goals, non-goals, assumptions, and quality attributes.
- At least 2 viable options, including a simple baseline.
- Comparison table: complexity, cost, latency, scalability, security, operability, vendor lock-in, and delivery risk.
- Recommended option and explicit trade-offs.
- Component boundaries, data flow, integrations, failure handling, and scaling model.
- Mermaid architecture diagram and sequence diagram for the critical path.
- Rollout, migration, rollback, and deprecation strategy.
- Open questions and decisions required from stakeholders.

Use concrete capacity estimates where inputs allow; otherwise state formulas and assumptions.
```

### 3.2 API contract

```text
[Operating Contract]

Define a production API contract for [CAPABILITY]. Consumers: [CLIENTS].

For each endpoint/event provide: purpose, authz policy, request schema, validation, response schemas, error codes, idempotency/concurrency behavior, pagination/filtering/sorting, rate limits, audit requirements, and examples. Specify versioning and backward-compatibility policy.

Return OpenAPI 3.1 YAML where applicable, followed by a concise compatibility checklist. Do not use vague response types such as “object.”
```

### 3.3 Data model and migration

```text
[Operating Contract]

Design the data model for [DOMAIN]. Existing schema/context:
[SCHEMA]

Provide entities, fields, types, constraints, indexes, lifecycle/retention rules, ownership, and relationships. Explain how the model enforces business invariants and tenant isolation. Include an ER diagram in Mermaid.

Then provide a zero/low-downtime migration plan: expand, backfill, dual-read/write (if needed), verify, contract, rollback. Flag PII/sensitive fields, encryption, access controls, and data deletion requirements.
```

### 3.4 Threat model

```text
[Operating Contract]

Threat-model [SYSTEM/FEATURE] using STRIDE. Context:
[ARCHITECTURE, DATA FLOWS, TRUST BOUNDARIES]

List assets, actors, entry points, trust boundaries, and threats. For each credible threat give likelihood, impact, risk rating, concrete mitigation, owner, and verification test. Cover authentication, authorization, injection, data exposure, SSRF, dependency/supply-chain risk, secrets, logging, abuse/rate limiting, and multi-tenant isolation as relevant.

Finish with “release blockers” and “accepted risks.” Never recommend security through obscurity.
```

---

## 4. Planning and Delivery

### 4.1 Implementation plan

```text
[Operating Contract]

Create a dependency-aware implementation plan for [FEATURE] in [REPOSITORY/STACK].

First inspect the relevant codebase context. Then produce small, reviewable tasks. For each task include: goal, files/components affected, approach, dependencies, acceptance criteria, test plan, rollout concern, and estimate range. Identify tasks that can proceed in parallel.

Order work to reduce risk: contracts/schema, core behavior, UX, observability, tests, documentation, rollout. Include a definition of done and a pull-request slicing strategy.
```

### 4.2 Engineering ticket writer

```text
[Operating Contract]

Turn [FEATURE/PLAN ITEM] into a single engineering ticket.

Include: problem, outcome, scope, non-scope, technical approach, acceptance criteria, test cases, analytics/observability, dependencies, rollout/rollback, and links/context. Make it independently implementable; avoid hidden decisions and ambiguous verbs such as “support” or “handle.”
```

---

## 5. Implementation

### 5.1 Repository-aware feature implementation

```text
[Operating Contract]

Implement [FEATURE] in the supplied repository.

Before editing:
1. Inspect project conventions, relevant modules, tests, configuration, and existing patterns.
2. Summarize the affected architecture and identify ambiguities.
3. Propose the smallest implementation plan.

Then implement production-quality code that satisfies:
[ACCEPTANCE CRITERIA]

Requirements:
- Reuse established patterns and abstractions; do not introduce dependencies without justification.
- Validate untrusted input at boundaries; enforce authorization server-side.
- Handle errors deliberately, with actionable messages and safe logging.
- Include types, documentation only where it adds clarity, and tests at appropriate layers.
- Keep changes focused; do not refactor unrelated code.

Finish with changed files, key decisions, commands/checks run, and any remaining risks.
```

### 5.2 Debugging prompt

```text
[Operating Contract]

Diagnose this issue without guessing:
Expected: [EXPECTED]
Actual: [ACTUAL]
Reproduction: [STEPS]
Logs/errors: [LOGS]
Relevant code/config: [CONTEXT]

Work in this order: establish a minimal reproduction; list ranked hypotheses with evidence; inspect the smallest relevant code paths; identify root cause; propose a minimal safe fix; add a regression test; explain verification and rollback. If evidence is insufficient, state exactly what to collect next.
```

### 5.3 Code review prompt

```text
[Operating Contract]

Review this change as a rigorous production pull request reviewer:
[DIFF / PR CONTEXT]

Check correctness, regressions, security/authz, data integrity, concurrency, error handling, performance, observability, accessibility, API compatibility, tests, and maintainability.

Report findings only when actionable. For each: severity (Blocker/High/Medium/Low), file/line, what fails, concrete scenario, and a precise recommended fix. Then list questions, test gaps, and a short approval recommendation. Do not nitpick style already enforced by tooling.
```

---

## 6. Quality Engineering

### 6.1 Test strategy

```text
[Operating Contract]

Create a risk-based test strategy for [FEATURE]. Inputs:
[REQUIREMENTS, ARCHITECTURE, CODE]

Map each acceptance criterion and major risk to unit, integration, contract, end-to-end, performance, security, accessibility, and manual exploratory tests as appropriate. Include test data, mocks/fakes, environment requirements, ownership, automation priority, and exit criteria.

Explicitly cover boundary values, invalid inputs, race conditions, retries, partial outages, permissions, backward compatibility, and data migration cases.
```

### 6.2 Generate tests

```text
[Operating Contract]

Write high-signal tests for [MODULE/FEATURE] using the repository’s existing test framework and conventions.

Base tests on these behaviors and risks:
[ACCEPTANCE CRITERIA / BUG / RISK LIST]

Cover normal, boundary, failure, permission, and regression cases. Prefer deterministic tests; mock only external boundaries. Each test must assert user-observable behavior or a meaningful contract, not implementation details. Include the exact test files changed and how to run them.
```

### 6.3 QA exploratory charter

```text
[Operating Contract]

Create an exploratory QA charter for [FEATURE] in [ENVIRONMENT]. Include mission, timebox, personas, data setup, core workflows, edge cases, integration touchpoints, accessibility checks, observability/log checks, and a defect report template with expected/actual/repro/evidence/severity.

Prioritize sessions by customer impact and likelihood of failure.
```

---

## 7. CI/CD, Release, and Deployment

### 7.1 CI/CD pipeline design

```text
[Operating Contract]

Design a secure CI/CD pipeline for [APPLICATION] deployed to [PLATFORM]. Current tooling: [TOOLS].

Specify stages, triggers, required checks, caching, artifact provenance, dependency and secret scanning, environment promotion, approvals, infrastructure changes, migration gates, least-privilege credentials, and audit trail. Define which failures block promotion.

Include a Mermaid pipeline diagram, sample configuration structure (not secrets), and a recovery path when a deployment or migration fails.
```

### 7.2 Release readiness review

```text
[Operating Contract]

Conduct a go/no-go review for [RELEASE]. Evidence:
[TEST RESULTS, CHANGELOG, METRICS, SECURITY REVIEW, MIGRATION PLAN]

Assess product readiness, functional quality, performance, security/privacy, accessibility, operational readiness, support readiness, rollback safety, and business/legal dependencies. Use a table with status: Green / Yellow / Red, evidence, risk, owner, and required action.

End with a clear Go / Conditional Go / No-Go decision and only the conditions required to proceed.
```

### 7.3 Deployment runbook

```text
[Operating Contract]

Write an operator-ready deployment runbook for [SERVICE/RELEASE] to [ENVIRONMENT].

Include prerequisites and access, change window, pre-flight checks, backup/snapshot needs, ordered deployment commands/placeholders, migration steps, smoke tests, success metrics, monitoring links/placeholders, rollback triggers, exact rollback procedure, stakeholder communications, and post-deploy validation. Distinguish safe-to-retry steps from one-way steps.
```

---

## 8. Production Operations

### 8.1 Observability design

```text
[Operating Contract]

Create an observability plan for [SERVICE/FEATURE]. Define user-facing SLIs/SLOs and error budgets. Specify metrics, structured logs, traces, dashboards, alert conditions, severity, routing, and runbook links.

Every signal must answer a decision: detect, diagnose, or measure outcome. Avoid alerting on symptoms without actionable thresholds. Include privacy-safe logging rules and correlation IDs.
```

### 8.2 Incident response

```text
[Operating Contract]

You are the incident commander for [INCIDENT]. Current evidence:
[TIMELINE, ALERTS, LOGS, IMPACT]

Provide: incident severity and customer impact; immediate containment actions ordered by safety; roles and communication cadence; hypotheses and verification steps; decision points for rollback/feature flag/failover; stakeholder update in plain language; and criteria for resolution. Do not speculate—label hypotheses.
```

### 8.3 Blameless post-incident review

```text
[Operating Contract]

Write a blameless post-incident review using:
[INCIDENT EVIDENCE]

Include summary, customer/business impact, detection, timeline with facts only, contributing technical and process factors, what went well, what did not, root-cause analysis, and corrective actions. Every action must have an owner, priority, due date, verification method, and link to follow-up work. Focus on system improvements, never individual blame.
```

---

## 9. Maintenance and Continuous Improvement

### 9.1 Technical debt triage

```text
[Operating Contract]

Evaluate these technical-debt items:
[ITEMS]

For each, estimate customer impact, failure/security risk, delivery drag, cost of delay, remediation effort, and dependencies. Recommend: fix now, schedule, monitor, or decline. Propose the smallest remediation slice and its success metric. Make uncertainty explicit.
```

### 9.2 Documentation updater

```text
[Operating Contract]

Update documentation for [CHANGE] based on [CODE/DIFF/RELEASE NOTES]. Identify affected docs first. Write only accurate, task-oriented material: prerequisites, configuration, usage, examples, troubleshooting, limitations, and migration notes. Flag statements that cannot be verified from supplied context.
```

---

## 10. Final Production Gate — master prompt

```text
[Operating Contract]

Act as an independent production-readiness reviewer. Review [PRODUCT/FEATURE/RELEASE] end-to-end using the supplied evidence:
[LINKS, REQUIREMENTS, DIFFS, TESTS, ARCHITECTURE, DASHBOARDS, RUNBOOKS]

Produce a concise launch dossier:
1. What is shipping and who benefits.
2. Requirements traceability: requirement → implementation → test evidence.
3. Top risks across correctness, security, privacy, performance, accessibility, reliability, and support.
4. Release gates: passed, failed, unknown—with evidence.
5. Monitoring, alerting, ownership, on-call and rollback readiness.
6. Go / Conditional Go / No-Go decision.
7. Prioritized actions required before launch and accepted post-launch follow-ups.

Be evidence-led. Unknown evidence is a risk, not a pass.
```

## Prompt Quality Checklist

Before sending a prompt, confirm it includes:

- A clear outcome and intended user/business value.
- Relevant context, constraints, and source-of-truth inputs.
- Explicit scope and non-goals.
- Acceptance criteria and definition of done.
- Required output format and decision deadline.
- Security, privacy, reliability, accessibility, and rollback expectations.
- A request to expose assumptions and unknowns rather than fabricate answers.



Pass forward the product brief, PRD, UX specification, ADR, API/data contracts, threat model, implementation plan, test strategy, release evidence, deployment runbook, and operational dashboard/runbook links. This preserves context and prevents later stages from silently undoing earlier decisions.
