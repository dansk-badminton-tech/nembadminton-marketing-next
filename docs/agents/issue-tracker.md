# Issue tracker: GitHub

Issues and specs live in `dansk-badminton-tech/nembadminton-marketing-next`. Use the `gh` CLI for issue operations.

Before publishing, verify the target with `gh repo view --json nameWithOwner`. Publish marketing-site work here, not in the application repository.

## Operations

- Create: `gh issue create --title "..." --body-file <file>`.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open`, with appropriate label filters.
- Comment: `gh issue comment <number> --body "..."`.
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close: post an explanation, then `gh issue close <number>`.

Use native GitHub sub-issues and blocking dependencies when available. Otherwise, record `Part of #<parent>` and `Blocked by: #<number>` references in the issue body. A ticket is unblocked when all blockers are closed.

When a skill says "publish to the issue tracker", create a GitHub issue. When it says "fetch the relevant ticket", read the corresponding GitHub issue.

## Pull requests as a triage surface

**PRs as a request surface: no.**
