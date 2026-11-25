---
name: skill-scout
description: Finds and vets third-party agent skills, then proposes adding the right one to the agent kit; never installs anything. Use only when the user explicitly asks for a skill, or when an area of a plan has no skill coverage - not for every "how do I do X".
---

# Skill scout

Search the open skills ecosystem, read candidates in full, and propose one for the agent kit. Installing is not your job: skills reach projects only through the kit, after the owner agrees.

## 1. Pin down the need

Name the domain (for example payments, email, testing), the concrete task and the pack it would belong to in `kit/packs/`. Check first that the kit does not already cover it: `kit/skills/`, `kit/vendor/` and `kit/COVERAGE.md`.

## 2. Search

- Start from the [skills.sh leaderboard](https://skills.sh/): it ranks skills by installs.
- Then search by keyword: `npx skills find <query> [--owner <owner>]` (search only).
- Try alternative terms ("deploy", "deployment", "ci-cd") and known sources (`anthropics/skills`, `vercel-labs/agent-skills`).

## 3. Vet before proposing

Do not propose a skill from search results alone. For each candidate:

1. **Installs:** prefer 1K+; be wary under 100.
2. **Source:** official or well-known organisations over unknown authors.
3. **Stars:** open the repository; under 100 stars needs a reason.
4. **Read the whole skill**, every file it ships, not only `SKILL.md`. Discard it if it:
   - runs network commands, downloads or package installs without saying so up front;
   - asks for secrets, tokens or credentials;
   - ships an `AGENTS.md` (some tools load it in every conversation);
   - duplicates a skill the kit already has.

## 4. Propose

Present at most three candidates, recommended first, each with: name, what it does, installs, source repository and path, and what you read. For the recommended one, write the exact change to the kit:

- the line for `sources.txt`, in the format the file already uses;
- the folder under `kit/vendor/<name>`;
- the pack in `kit/packs/` that gets the name.

Then stop and wait for the owner's consent. The owner, or a later task, copies it into the kit; projects receive it at their next kit install.

## When nothing fits

Say so, add the area to `kit/COVERAGE.md` as uncovered with what you searched, and offer to help with the task directly.
