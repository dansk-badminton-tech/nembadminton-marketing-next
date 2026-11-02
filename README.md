# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Homepage browser checks

```sh
npm ci
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` builds the static production site and starts its own local
Astro preview, then exercises the rendered homepage in desktop (1440 × 900) and
mobile (393 × 727) Chromium viewports. It never uses a development server or
reuses an existing preview. Use `PLAYWRIGHT_PORT` (default `4322`) when running
concurrent worktrees, for example:

```sh
PLAYWRIGHT_PORT=4323 npm run test:e2e
```

The suite blocks third-party requests, including analytics. App navigation is
verified using locally fulfilled destinations; tests do not contact the live app,
create accounts, or submit the contact form. Failure traces are in `test-results/`.

Pull requests run `homepage-checks` without production secrets or deployment.
Pushes to `main` must pass those same checks before the tested `dist/` artifact
can be deployed to the existing simply.com destination. Running tests locally
does not deploy anything.

Automated checks do not establish product-claim accuracy or certify accessibility.
Before shipping, review the page at both sizes, tab through the header and menu,
check focus visibility, open/close the mobile menu with Enter/Space and Escape,
and follow section links to check destination focus and fixed-header clearance.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
