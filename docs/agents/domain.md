# Domain Docs

## Ownership

This repository owns Nembadminton's public marketing site. The [application repository](https://github.com/dansk-badminton-tech/nembadminton) owns the product domain model. Repository boundaries do not require separate definitions of the same product concepts.

| Information | Source of truth |
|---|---|
| Product concepts and canonical terminology | Application repository's `GLOSSARY.md` |
| Product capabilities and limitations | Application product guides and implementation |
| Audience, positioning, brand voice, approved marketing claims | This repository's `.agents/product-marketing.md`, when present |
| Marketing-only terminology | This repository's `GLOSSARY.md`, if needed |
| Architectural decisions | Relevant owning repository's `docs/adr/`, when present |

## Before working

Read local marketing context, glossary entries, and relevant ADRs when present. Proceed silently when these optional files do not exist; create them only when there is a resolved term, decision, or approved context to record.

For product concepts, capabilities, or claims, consult:

- [Product glossary](https://github.com/dansk-badminton-tech/nembadminton/blob/HEAD/GLOSSARY.md).
- [Brand naming rules](https://github.com/dansk-badminton-tech/nembadminton/blob/HEAD/BRANDING.md).
- [Product guides](https://github.com/dansk-badminton-tech/nembadminton/tree/HEAD/resources/help).
- [Product ADRs](https://github.com/dansk-badminton-tech/nembadminton/tree/HEAD/docs/adr), where relevant and available.

Use a neighbouring `../nembadminton` checkout when available; otherwise read the upstream GitHub sources. Verify current capabilities before presenting them as available. Flag uncertainty or contradictions explicitly.

## Cross-repository changes

Reference the application glossary rather than copying it or maintaining a synchronized duplicate. Marketing copy may simplify explanations while preserving the defined meaning and Danish terminology.

Resolve unclear or incorrect product definitions in the application repository through its contribution workflow. Record marketing decisions here. A local glossary should define only marketing-specific concepts, with upstream references for shared product terms.

Surface conflicts with relevant ADRs explicitly rather than silently overriding them.
