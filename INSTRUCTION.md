# Step-by-Step Manual: Building a Modern React 19 Application by Hand

Welcome! The goal of this guide is to teach you how modern frontend tools fit together **from scratch**.
Instead of using an automated wizard like `create-react-app` or `npm create vite`, you will write each configuration
file and code file by hand.

By the end of this guide, you will understand:

1. What each tool does, why it exists, and what alternatives exist.
2. How TypeScript, Vite, Biome, and React collaborate to build and run your website.
3. How to verify that every single step works before moving to the next.

---

## Architecture Overview: The Big Picture

Before typing any commands, let us understand how a modern web application works:

```text
[ Your Code: TSX / SCSS ]
          |
          +--- (Checked by TypeScript & Biome)
          v
   [ Vite Dev Server ]  <--- Lightning-fast local server with Hot Module Replacement (HMR)
          |
          v
  [ Web Browser ]       <--- Executes standard JavaScript, HTML, and CSS
```

- **Node.js**: The JavaScript engine on your computer that runs developer tools.
- **pnpm**: The package manager that downloads and organizes code libraries.
- **TypeScript**: Adds types to JavaScript to catch bugs before you even run the code.
- **Biome**: A single, ultra-fast tool that checks code quality (linting) and formats code.
- **Vite**: The build tool and dev server that serves files to the browser instantly.
- **React 19**: The UI library that renders components and manages UI state.
- **SCSS Modules**: Locally scoped styles so CSS in one component never breaks another.
- **React Router 7**: Swaps views and updates the browser URL without a full page refresh.

---

## Step 0: Environment Setup (pnpm 12 & Local Node 26)

### 🎯 The Goal of this Step

Configure our runtime tools according to **STACK.md**:

1. **pnpm 12** as our standalone, disk-efficient package manager.
2. **Node 26** configured **per-repository** through pnpm, so this project runs in complete isolation from whatever
   global tools exist on your computer.

---

### 🚀 The Main Thread (Recommended 3-Step Setup)

Follow these 3 simple steps to get your environment ready:

#### Step 0.1: Install Standalone pnpm 12 (Zero Node Required)

_Question: Do I need Node.js installed to get pnpm?_
**No!**pnpm is distributed as a standalone native Windows executable (`pnpm.exe`). It has zero dependencies on Node,
npm, or Python.

Open your PowerShell terminal and run the official standalone install command:

```powershell
iwr -useb https://get.pnpm.io/install.ps1 | iex
```

_(Or install via Windows Package Manager: `winget install pnpm.pnpm`)_

**Verify:**
Open a new PowerShell terminal and verify:

```bash
pnpm -v
```

_Expected Result_: Outputs version `12.x.x` (or latest `12.0.0+`).

#### Step 0.2: Configure Per-Repository Node 26 via `.npmrc`

In the root directory of this repository (`petReact`), create these two configuration files

`.npmrc`:

```ini
use-node-version=26
engine-strict=true
```

`.node-version`:

```ini
26
```

**What do these lines do?**

- `use-node-version=26`: Whenever you execute any command through pnpm in this folder (`pnpm install`, `pnpm dev`,
  `pnpm run build`, or `pnpm exec ...`), pnpm checks this file. If Node 26 is not already cached in pnpm's isolated
  directory (`%LOCALAPPDATA%\pnpm\nodejs` on Windows), **pnpm automatically downloads Node 26 in the background**. No
  installer wizards, no administrator prompt, and zero changes to your machine's global software!
- `engine-strict=true`: Tells pnpm to strictly enforce the Node version, preventing accidental execution with
  incompatible runtimes.
- `.node-version`: serves as an industry-standard indicator for your IDE, CI/CD pipelines, and shell tools (fnm) to know
  exactly which Node version this project requires.

#### Step 0.3: Verify Project-Isolated Node 26

First you need i initialize project using the command:

```bash
pnpm init
```

It will create `package.json` file in the repository root with a prefilled starter values:

```json
{
  "name": "petReact",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devEngines": {
    "packageManager": {
      "name": "pnpm",
      "version": "12.15.0",
      "onFail": "download"
    }
  },
  "packageManager": "pnpm@12.15.0",
  "type": "module"
}
```

Or you can create this file on your own and fill the values

To explisitly add node version to setup call:

```bash
pnpm runtime set node 26
```

It will add node section to package.json:

```json
{
  "devEngines": {
    "runtime": {
      "name": "node",
      "version": "26.12.1",
      "onFail": "download"
    }
  }
}
```

To confirm that pnpm runs Node 26 specifically for this repository, run:

```bash
pnpm exec node -v
```

_Expected Result_: Displays `v26.x.x`!

💡 **Key Concept: `node -v` vs `pnpm exec node -v`**:

- `node -v`: Invokes whatever global Node executable happens to be registered in your Windows PATH (e.g., your
  pre-existing Node 24).
- `pnpm exec node -v` (and all `pnpm dev`, `pnpm run build` commands): Executes the **isolated, project-specific Node
  26** managed by pnpm via `.npmrc`. Every tool, compiler, and script in this project runs strictly under Node 26!

You have completed the main thread! You can now proceed directly to **Step 1**.

---

### 🔍 Alternative Workflows & Deep Dive (Optional)

If you have an existing workflow, curiosity about shell-level tools, or want to understand how pnpm works under the
hood, read below:

#### Alternative A: Installing pnpm via npm (If you already have global Node 24)

If you already had a global Node.js on your computer (like Node 24) and prefer installing pnpm through npm:

```bash
npm install -g pnpm@12
```

_Note_: Even if pnpm is installed via global npm, your project `.npmrc` still isolates and runs Node 26 for this project
whenever you run `pnpm` commands!

#### Alternative B: Shell-Level Auto-Switching with fnm

If you want typing the bare word `node` in PowerShell (without `pnpm exec`) to automatically switch to Node 26 whenever
you `cd` into this directory:
If this repository already includes a `.node-version` file, fnm will automatically read it. Just make sure
auto-switching is active in your profile: powershell

1. Install fnm: `winget install Schniz.fnm`
2. Install & use Node 26: `fnm install 26 && fnm use 26`
3. Create `.node-version` in the repo: `echo 26 > .node-version`
4. Add auto-switching to your PowerShell profile: `fnm env --use-on-cd | Out-String | Invoke-Expression`

#### Deep Dive: How pnpm Resolves Node Versions (The 4-Tier Hierarchy)

pnpm does not have any default Node version hardcoded globally. It resolves which Node runtime to execute using this
priority order:

1. **Local `.npmrc` in project root** (`use-node-version=26`): Highest priority (forces isolated project Node).
2. **Local `.node-version` or `.nvmrc`**: Secondary project-level file fallback.
3. **Global pnpm env**: Only if you explicitly ran `pnpm env use --global <version>`.
4. **System PATH**: Fallback to whatever global Node executable exists on Windows.

#### Useful pnpm Environment Commands:

- `pnpm env use 26`: Manually tell pnpm to download and activate Node 26.
- `pnpm env list`: List all isolated Node versions downloaded in pnpm's cache.
- `pnpm env remove 26`: Delete an unused Node version to reclaim disk space.

---

## Step 1: Initialize the Project Manifest (`package.json`) and Strict ESM

### What is this?

The `package.json` file is the passport of your project. It defines:

- The name and metadata of your project.
- Whether the project is private (to prevent accidental publishing to public registries).
- The module system (CommonJS vs ES Modules).

### Crucial Concept: Strict ESM (`"type": "module"`)

- **CommonJS (CJS)**: The legacy Node.js module system (`const x = require('./x')` and `module.exports = ...`).
- **ECMAScript Modules (ESM)**: The official modern JavaScript standard (`import x from './x'` and`export default ...`).
  By putting `"type": "module"` in `package.json`, we tell Node.js and all tools that all files in this project are
  modern ES Modules.

### Hands-on: Create `package.json`

Create a file named `package.json` in the project root with **only** these fundamental fields:
Or run command

```bash
pnpm init
```

```json
{
  "name": "pet-react",
  "private": true,
  "version": "0.1.0",
  "type": "module"
}
```

### Why is there NO `scripts` section yet?

Notice that we deliberately did **not** add a `scripts` section yet!
In many tutorials, beginners are given a confusing list of scripts (`build`, `dev`, `lint`) before they even know what
those tools are.
In this guide, we will add each script **one by one** at the exact moment we install its corresponding tool, explaining
what every command means and how it works.

### How to verify:

Run:

```bash
pnpm --version
```

_Expected Result_: Confirms pnpm runs in the folder and recognizes your clean `package.json`.

---

## Step 2: TypeScript 5 Configuration (`tsconfig.json`)

### What is this?

TypeScript adds static types to JavaScript. It catches typos, wrong parameter types, and missing properties while you
type, long before your code reaches a browser.

### Key concepts:

1. **Type Checking vs Transpilation**:
    - In traditional projects, TypeScript (`tsc`) both checked types and converted TS to JS.
        - In modern Vite projects, **Vite transforms TS to JS in milliseconds** using esbuild or Rolldown, while **`tsc`
          is
          used strictly as a type checker** (`noEmit: true`).
2. **React JSX Transform (`"jsx": "react-jsx"`)**:
   In older React versions, you had to write `import React from 'react'` at the top of every file. With
   `"jsx": "react-jsx"`, React automatically handles JSX compilation behind the scenes.

### How to set it up:

1. **Install TypeScript and Node types**:

```bash
pnpm add -D typescript @types/node
```

_Note_: The `-D` flag adds them to `devDependencies` (tools only used during development and build, not bundled to
users).

2. **Create `tsconfig.json`** in the project root:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "src",
    "vite.config.ts"
  ]
}
```

### Explanation of Settings:

- `"target": "ES2022"`: Compiles down to modern JavaScript supported by all evergreen browsers.
- `"moduleResolution": "bundler"`: Informs TypeScript that Vite handles resolving file paths and imports.
- `"noEmit": true`: Tells `tsc` not to write `.js` files to disk (Vite handles bundling).
- `"strict": true`: Enables all strict type-checking flags for highest code safety.

### How to verify:

1. Create a quick test file `test-type.ts`:

```ts
const testValue: string = 42; // Intentionally wrong type
```

2. Run:

```bash
pnpm exec tsc --noEmit
```

3. _Expected Result_: TypeScript reports an error: `Type 'number' is not assignable to type 'string'.`
4. Delete `test-type.ts`. Your TypeScript compiler is working properly!

---

## Step 3: Fast Linting and Formatting with Biome 2 (`biome.json`)

### What is this?

- **Linter**: Analyzes your code to catch bugs, unused variables, and bad patterns.
- **Formatter**: Enforces consistent code style, indentation, and quotes across the team.

### Why Biome instead of ESLint + Prettier?

Traditionally, projects required installing ESLint, Prettier, and 5 to 10 extra plugins (`eslint-plugin-react`,
`@typescript-eslint/parser`, etc.). Configuring them was slow and frequently broke when dependencies updated. **Biome**
is written in Rust. It combines linting and formatting into a single tool that runs in milliseconds with zero plugin
headaches.

### How to set it up:

1. **Install Biome**:

```bash
pnpm add -D --save-exact @biomejs/biome
```

2. **To Create `biome.json`** in the project root use the command:

```bash
pnpm exec biome init
```

or create the file manually and fill with next and

```json
{
  "$schema": "https://biomejs.dev/schemas/2.6.3/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "preset": "recommended"
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

3. **Now, add your first scripts to `package.json`**:
   Now that Biome is installed, we can add commands into `package.json` so anyone working on this project can run the
   linter easily:

```json
{
  "name": "pet-react",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

#### What do these scripts mean?

- `"check": "biome check ."`: Runs Biome across the entire project to verify code formatting and identify linting
  issues.
- `"check:fix": "biome check --write ."`: Tells Biome to automatically rewrite unformatted files and fix autofixable
  lint issues.

### How to verify:

Run the Biome checker script:

```bash
pnpm run check
```

_Expected Result_: Biome scans your files and confirms `Checked X files. No errors found!`.

---

## Step 4: The Build Tool - Vite (`vite.config.ts`) and HTML Entry Point

### What is this?

Browsers only understand plain HTML, CSS, and JavaScript. They do not know what a `.tsx` or `.scss` file is. **Vite** is
a modern build tool that performs two essential jobs:

1. **Development Server**: During development, Vite serves your code using native browser ES Modules. When you change a
   component, Vite swaps only that component in the browser in less than 50 milliseconds (Hot Module Replacement / HMR).
2. **Production Bundler**: When you run build, Vite bundles, minifies, and tree-shakes your code into optimized static
   files for production.

_Note on Vite 8 & Rolldown_: Vite 6 is today's stable standard using Rollup. The Vite team is integrating **Rolldown**(a
Rust port of Rollup) as Vite's next-generation engine. Because Vite uses the exact same configuration API, your code
will work identically now and when Rolldown becomes the default in Vite 8!

### How to set it up:

1. **Install Vite and the official React plugin**:

```bash
pnpm add -D vite @vitejs/plugin-react
```

2. **Create `vite.config.ts`** in the project root:

```ts
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
    },
});
```

3. **Create `index.html`** in the project root:
   In Vite, `index.html` lives in the root directory (not in a public folder). It is the true entry point of your app.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Pet React 19 App</title>
</head>
<body>
<div id="root"></div>
<!-- Vite intercepts this script tag and compiles TypeScript on the fly -->
<script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

4. **Add the dev script to `package.json`**:
   Now that Vite is installed, we add the `dev` script to start Vite's local server:

```json
{
  "name": "pet-react",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

#### What does this script mean?

- `"dev": "vite"`: When you run `pnpm dev`, pnpm executes the Vite binary inside `node_modules/.bin/vite`, which starts
  a local HTTP development server with instant HMR.

### How to verify:

Start the dev server:

```bash
pnpm dev
```

_Expected Result_: The terminal displays a local server URL (e.g. `http://localhost:3000`). If you open it in your
browser, you will see a blank page with title `Pet React 19 App` (because we have not created `src/main.tsx` yet).
Press `Ctrl + C` in the terminal to stop the server before moving to Step 5.

---

## Step 5: Install React 19 and Mount the Application

### What is this?

Now we install React itself:

- **react**: The core library providing JSX, hooks (`useState`, `useActionState`), and the component model.
- **react-dom**: The renderer that mounts React components into the browser's DOM tree.

### Why React 19 without Compiler?

React 19 introduces automatic optimizations under the hood. While React has an optional compiler tool (to automatically
add `useMemo` calls), running **vanilla React 19 without compiler** is simpler, requires zero extra build plugins, and
gives you direct, predictable control over your components.

### How to set it up:

1. **Install React 19 and its TypeScript type definitions**:

```bash
pnpm add react react-dom
pnpm add -D @types/react @types/react-dom
```

2. **Create the `src` directory**:

```bash
mkdir src
```

3. **Create `src/main.tsx`** (the application entry point):

```tsx
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {App} from "./App";

const container = document.getElementById("root");

if (!container) {
    throw new Error("Root element not found in index.html");
}

const root = createRoot(container);

root.render(
    <StrictMode>
        <App/>
    </StrictMode>,
);
```

4. **Create `src/App.tsx`** (the root component):

```tsx
export function App() {
    return (
        <main>
            <h1>Hello React 19 from Scratch!</h1>
            <p>Project initialized with strict TypeScript, Vite, and Biome.</p>
        </main>
    );
}
```

### How to verify:

Start the dev server:

```bash
pnpm dev
```

_Expected Result_: Your browser opens `http://localhost:3000` showing **Hello React 19 from Scratch!**.
Now change the text in `src/App.tsx` and save. Notice the browser updates instantaneously without a full reload!

---

## Step 6: Styling with SCSS Modules

### What is this?

- **SCSS (Sass)**: An extension to CSS adding variables ($primary-color), nesting, and mixins.
- **CSS Modules (`*.module.scss`)**: In standard CSS, all class names are global; a `.button` class in one file can
  accidentally break a button elsewhere. With CSS Modules, Vite rewrites class names into unique hashes (e.g.,
  `_container_3a8f1_1`). You get 100% collision-free styling with zero runtime performance cost!

### How to set it up:

1. **Install Dart Sass**:
   Vite understands SCSS automatically, but requires the Dart Sass compiler:

```bash
pnpm add -D sass
```

2. With pnpm you need to explicitly grant permission for pnpm to execute the build/postinstall scripts for your
   dependencies.
   Pnpm requires explicit user approval for lifecycle scripts by default in newer versions to enhance security.

```bash
pnpm approve-builds
```

for pnpm v11+ it will create `pnpm-workspace.yaml` file with the next content

```yaml
allowBuilds:
  "@parcel/watcher": true
```

Alternatively, you can configure it in `package.json`

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "@parcel/watcher"
    ]
  }
}
```

Also, TypeScript could complain with `TS2307: Cannot find module` about scss file import

For Vide bundler it could be fixed by importing its own types in tsconfig.json

```json
{
  "compilerOptions": {
    "types": [
      "vite/client"
    ]
  }
}
```

Alternatively, you could define your own declaration for scss module imports.
Create `declarations.d.ts` to fix globally for any bundler or `vite-env.d.ts` to fix only for vite

File should contain the next type declaration:

```typescript
declare module "*.module.scss" {
    const classes: { [key: string]: string };
    export default classes;
}
```

If you are also using regular CSS modules, you can add an identical block with .css

```typescript
declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
}
```

1. **Create `src/pages/DemoPage.module.scss`**:

```scss

.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #f4f6f8;
  border-radius: 8px;
  font-family: system-ui, -apple-system, sans-serif;

  h1 {
    color: #0070f3;
    margin-bottom: 0.5rem;
  }

  p {
    color: #444;
    line-height: 1.6;
  }
}
```

2. **Update `src/App.tsx`** to use the module classes:

```tsx
import styles from "./App.module.scss";

export function App() {
    return (
        <main className={styles.container}>
            <h1>Hello React 19 from Scratch!</h1>
            <p>Styles are locally scoped with SCSS Modules.</p>
        </main>
    );
}
```

### How to verify:

Run `pnpm dev` and open the browser DevTools (Right click, then Inspect). _Expected Result_: The <main> element has a
uniquely hashed class name like `_container_xxxx_1`, and the styled card with blue header and gray background renders on
screen.

---

## Step 7: Client-Side Routing with React Router 7 (Library Mode)

### What is this?

In a Single Page Application (SPA), navigating to a new URL should not trigger a full browser refresh. Instead:

1. React Router listens to browser address bar changes.
2. It unmounts the old page and mounts the new page component instantly.
3. The browser history (Back and Forward buttons) works seamlessly.

### Library Mode vs Framework Mode in React Router 7:

React Router 7 merges Remix and React Router. It offers two modes:

- **Framework Mode**: Full-stack framework with built-in server-side rendering (SSR) and build plugins.
- **Library Mode**: The classic, lightweight client-side router (`react-router-dom`). For a standard Vite SPA, Library
  Mode is simpler, transparent, and avoids backend server dependencies.

### How to set it up:

1. **Install React Router**:

```bash
pnpm add react-router react-router-dom
```

2. **Create a pages directory**:

```bash
mkdir src/pages
```

3. **Create `src/pages/HomePage.tsx`**:

```tsx
export function HomePage() {
    return (
        <section>
            <h2>Home View</h2>
            <p>Welcome to our manually scaffolded React 19 SPA.</p>
        </section>
    );
}
```

4. **Create `src/pages/AboutPage.tsx`**:

```tsx
export function AboutPage() {
    return (
        <section>
            <h2>About View</h2>
            <p>Built with React 19, React Router 7, Vite, and TypeScript.</p>
        </section>
    );
}
```

5. **Update `src/App.tsx`** with routing:

```tsx
import {BrowserRouter, Routes, Route, Link} from "react-router-dom";
import {HomePage} from "./pages/HomePage";
import {AboutPage} from "./pages/AboutPage.tsx";
import styles from "./App.module.scss";

export function App() {
    return (
        <BrowserRouter>
            <div className={styles.container}>
                <header>
                    <h1>React 19 Application</h1>
                    <nav style={{display: "flex", gap: "1rem", marginBottom: "1.5rem"}}>
                        <Link to="/">Home</Link>
                        <Link to="/about">About</Link>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/about" element={<AboutPage/>}/>
                        <Route path="*" element={<p>Page Not Found (404)</p>}/>
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
```

### How to verify:

Run `pnpm dev` and click between the **Home** and **About** navigation links. _Expected Result_: The URL changes between
`http://localhost:3000/` and `http://localhost:3000/about`, the content swaps immediately, and there is zero page
flickering.

---

## Step 8: React 19 Modern Patterns (Actions, use (), Suspense, Native Context)

### 1. Native HTML Forms with Actions (`useActionState`)

In older React, every form needed `e.preventDefault()` and manual state variables for loading, errors, and success.
React 19 introduces **Actions**: you pass an async function directly to the form's `action` attribute. The
`useActionState` hook manages pending states and results automatically.

Create `src/components/FeedbackForm.tsx`:

```tsx
import {useActionState} from "react";

async function submitFeedback(
    _previousState: string | null,
    formData: FormData,
): Promise<string> {
    const comment = formData.get("comment") as string;
    // Simulate network request delay
    await new Promise(function (resolve) {
        setTimeout(resolve, 800);
    });
    return "Feedback saved: " + comment;
}

export function FeedbackForm() {
    const [message, formAction, isPending] = useActionState(submitFeedback, null);

    return (
        <form action={formAction} style={{marginTop: "1rem"}}>
            <label
                htmlFor="comment"
                style={{display: "block", marginBottom: "0.5rem"}}
            >
                Leave a comment:
            </label>
            <input
                id="comment"
                name="comment"
                type="text"
                required
                placeholder="Type your thoughts..."
                disabled={isPending}
                style={{padding: "0.4rem", marginRight: "0.5rem"}}
            />
            <button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Submit"}
            </button>
            {message && (
                <p style={{color: "green", marginTop: "0.5rem"}}>{message}</p>
            )}
        </form>
    );
}
```

### 2. Server State with Native Fetch + `use()` + Suspense

In earlier React, fetching data required `useEffect` with boilerplate state (`loading`, `data`, `error`).
In React 19, you pass a native `fetch()` Promise into `use(promise)`. React suspends component rendering while the
promise resolves and displays the `<Suspense fallback={...}>` UI in the meantime!

Create `src/components/UserList.tsx`:

```tsx
import {use, Suspense} from "react";

interface User {
    id: number;
    name: string;
    email: string;
}

// Native fetch call returning a cached promise
const usersPromise: Promise<User[]> = fetch(
    "https://jsonplaceholder.typicode.com/users?_limit=3",
).then(function (res) {
    return res.json();
});

function UserItems() {
    // React 19 use() unwraps the promise directly inside render
    const users = use(usersPromise);

    return (
        <ul>
            {users.map(function (user) {
                return (
                    <li key={user.id}>
                        <strong>{user.name}</strong> ({user.email})
                    </li>
                );
            })}
        </ul>
    );
}

export function UserList() {
    return (
        <div style={{marginTop: "1.5rem"}}>
            <h3>Users (React 19 use() + native fetch + Suspense)</h3>
            <Suspense fallback={<p>Loading user list...</p>}>
                <UserItems/>
            </Suspense>
        </div>
    );
}
```

### 3. Client State with Native React Context

For global UI state (like themes or auth info), native React Context provides clean sharing without external state
libraries.

Create `src/context/ThemeContext.tsx`:

```
import {createContext, useContext, useState, ReactNode} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({children}: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");

    const toggleTheme = () => {
        setTheme(function (prev) {
            return prev === "light" ? "dark" : "light";
        });
    };

    return (
        // @ts-nocheck
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            <div data-theme={theme}>{children}</div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}
```

### How to verify:

Update `src/pages/HomePage.tsx` to include `<FeedbackForm />` and `<UserList />`.
Run `pnpm dev`:

1. Notice the `Loading user list...` message appears briefly before users render.
2. Type into the feedback form and submit: the button displays `Saving...` and then displays the success confirmation
   without page reload!

---

## Step 9: Production Build and Verification

### What is this?

Before shipping code to users, you need to verify two things:

1. There are **zero TypeScript errors** across the entire codebase.
2. Vite can bundle, minify, and optimize all assets into static files.

### 1. Add Build and Preview Scripts to `package.json`:

Now we complete our `package.json` by adding the final scripts for building and previewing:

```json
{
  "name": "pet-react",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

#### What do these new scripts mean?

- `"build": "tsc -b && vite build"`:
    - `tsc -b`: Tells the TypeScript compiler to do a complete, strict type audit. If any component has a type error,
      the build halts immediately.
        - `&&`: Shell operator meaning "only proceed to the next command if the previous command exited successfully
          with
          zero errors".
        - `vite build`: Bundles, tree-shakes, and minifies your JS/TSX and SCSS into a static `dist/` directory.
- `"preview": "vite preview"`: Launches a local HTTP server that serves the production assets from `dist/`, so you can
  test performance and routing before deploying.

### 2. Run the Build:

```bash
pnpm run build
```

_Expected Result_: TypeScript verifies types, Vite generates the production bundle, and a `dist/` folder appears
containing `index.html` and hashed asset bundles.

### 3. Preview the Production Build Locally:

```bash
pnpm run preview
```

_Expected Result_: Vite starts a local production preview server. Open the link to verify the bundled code behaves
identically to the development version.

---

## Step 10: Common Beginner Pitfalls and Road to Stage 2

### Common Pitfalls to Watch Out For:

1. **Missing `"type": "module"` in package.json**:
   If omitted, Node treats files as CommonJS and Vite configuration imports may fail.
2. **Forgetting Type Definitions**:
   Always install matching type packages (like `@types/react` and `@types/react-dom`) in `devDependencies`.
3. **Why do components render twice in development?**:
   In `src/main.tsx`, we wrapped `<App />` with `<StrictMode>`. In development, React intentionally mounts components
   twice to help identify accidental side effects. This does not happen in production builds.
4. **SCSS Module Names**:
   SCSS files intended for modular hashing must be named with the `.module.scss` suffix (e.g., `DemoPage.module.scss`),
   otherwise Vite treats them as global stylesheets.

### What comes next in Stage 2?

- **Vitest**: Unit testing framework designed to share the exact same configuration as Vite.
- **Playwright**: End-to-end tests that run automated browser sessions (Chromium, Firefox, WebKit) to verify real user
  interactions.
- **Cloudflare Pages / Caddy**: Because Vite outputs static HTML, JS, and CSS into `dist/`, your app can be hosted with
  global CDN caching at zero cost.

---

### CI Compatibility: How Per-Project Node 26 Works in CI (GitHub Actions and Cloudflare)

A major advantage of having `.node-version` and `.npmrc` committed to your repository is that it creates a **single
source of truth**.
Your local laptop, your teammate's machine, and remote CI build servers all read the exact same configuration files.
This eliminates the dreaded "works on my machine, fails in CI" syndrome!

#### 1. GitHub Actions Integration

GitHub Actions runners (`ubuntu-latest`) do not require you to hardcode Node versions in YAML files.
The official `actions/setup-node@v4` action natively understands `node-version-file: '.node-version'`. It reads the `26`
from your file and installs it into the CI virtual machine on the fly!

Here is the complete, production-ready minimal CI workflow to place at `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 12

      - name: Setup Node runtime from repository file
        uses: actions/setup-node@v4
        with:
          node-version-file: ".node-version"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check code formatting and linting (Biome)
        run: pnpm run check

      - name: Type check and production bundle (Vite)
        run: pnpm run build
```

#### Key CI Best Practices:

- `--frozen-lockfile`: Tells pnpm in CI to strictly verify that `pnpm-lock.yaml` has not been tampered with and matches
  `package.json` byte-for-byte. If someone manually modified dependencies without running pnpm, the build stops.
- `cache: 'pnpm'`: Caches downloaded pnpm dependencies between CI runs, cutting build time from minutes down to ~15
  seconds.

#### 2. Cloudflare Pages / Static Hosting Integration

Cloudflare Pages (and similar modern platforms like Vercel or Netlify) build your site by executing `pnpm run build`
inside an automated container.

- When Cloudflare detects a `.node-version` file containing `26` in your repository root, it **automatically provisions
  Node 26** for the build container without you having to configure environment variables manually in the Cloudflare
  dashboard!
- When Vite finishes building, Cloudflare takes the resulting `dist/` directory and deploys it across its global edge
  network.

#### 3. Zero-Effort Future Upgrades

When Node 28 is released in the future, you change `26` to `28` in `.node-version` and `.npmrc`.
The next time you push a commit, your local environment, your GitHub Actions pipeline, and your Cloudflare deployments
all upgrade to the new runtime simultaneously with zero configuration drift!

---

## Quick Reference Command Cheat Sheet

| Action                | Command                  | What it does                                                  |
|-----------------------|--------------------------|---------------------------------------------------------------|
| Start Dev Server      | `pnpm dev`               | Starts the Vite dev server with instant HMR on localhost:3000 |
| Type Check            | `pnpm exec tsc --noEmit` | Runs TypeScript checks without generating files               |
| Lint and Format Check | `pnpm run check`         | Runs Biome to check code style and detect lint bugs           |
| Auto-Fix Formatting   | `pnpm run check:fix`     | Instructs Biome to automatically reformat and fix code        |
| Production Build      | `pnpm run build`         | Runs full type-check and bundles static assets into dist/     |
| Preview Production    | `pnpm run preview`       | Spins up a lightweight server to inspect the dist/ build      |

Congratulations! You now understand every single component of a modern React 19 application built completely by hand.
