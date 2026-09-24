# GitHub Actions Masterclass: 34 Hands-on Lab Workflows

A progressive, production-ready curriculum designed to take you from foundational CI/CD concepts to enterprise-grade workflow orchestration using GitHub Actions.

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![YAML](https://img.shields.io/badge/YAML-CB171E?style=for-the-badge&logo=yaml&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

---

## Table of Contents

- [What is GitHub Actions?](#what-is-github-actions)
- [Core Concepts](#core-concepts)
  - [Workflows](#workflows)
  - [Events (Triggers)](#events-triggers)
  - [Jobs](#jobs)
  - [Steps](#steps)
  - [Actions](#actions)
  - [Runners](#runners)
- [Workflow Syntax Reference](#workflow-syntax-reference)
  - [Basic Workflow Structure](#basic-workflow-structure)
  - [Trigger Events In Depth](#trigger-events-in-depth)
  - [Runner Types](#runner-types)
  - [Environment Variables & Scopes](#environment-variables--scopes)
  - [Contexts](#contexts)
  - [Secrets & Variables](#secrets--variables)
  - [Expressions & Status Functions](#expressions--status-functions)
  - [Job Outputs](#job-outputs)
  - [Matrix Strategy](#matrix-strategy)
  - [Caching](#caching)
  - [Artifacts](#artifacts)
  - [Concurrency Control](#concurrency-control)
  - [Permissions & Security](#permissions--security)
  - [Environments & Deployment Gates](#environments--deployment-gates)
  - [Reusable Workflows](#reusable-workflows)
  - [Composite Actions](#composite-actions)
- [Repository Architecture](#repository-architecture)
- [Learning Objectives & Curriculum Breakdown](#learning-objectives--curriculum-breakdown)
  - [Module 1: Triggers & Runner Foundations (Files 01–07)](#module-1-triggers--runner-foundations-files-0107)
  - [Module 2: Tooling, Runtimes & State (Files 08–15)](#module-2-tooling-runtimes--state-files-0815)
  - [Module 3: Orchestration, Logic & Matrices (Files 16–23)](#module-3-orchestration-logic--matrices-files-1623)
  - [Module 4: Caching & Artifact Management (Files 24–26)](#module-4-caching--artifact-management-files-2426)
  - [Module 5: Enterprise Governance, Modularity & Security (Files 27–34)](#module-5-enterprise-governance-modularity--security-files-2734)
- [Local Development & Validation](#local-development--validation)
- [How to Practice with This Repository](#how-to-practice-with-this-repository)
- [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## What is GitHub Actions?

**GitHub Actions** is a built-in CI/CD and automation platform integrated directly into GitHub. It lets you automate software workflows — from building and testing code to deploying to production — triggered by any GitHub event (push, pull request, release, schedule, etc.).

Key benefits:
- **Native GitHub integration** — no external CI server needed
- **Free for public repositories** — generous free tier for private repos
- **Marketplace ecosystem** — 10,000+ pre-built actions to reuse
- **Matrix builds** — test across multiple OS/runtime combinations in parallel
- **Self-hosted runners** — run on your own infrastructure when needed
- **OIDC support** — secure, keyless cloud deployments to AWS, GCP, Azure

---

## Core Concepts

Understanding these six building blocks is the foundation of everything in this masterclass.

### Workflows

A **workflow** is an automated process defined in a YAML file stored at `.github/workflows/`. Each file is one workflow. A repository can have many workflows, each triggered independently.

```yaml
# .github/workflows/my-workflow.yml
name: My First Workflow
on: push
jobs:
  say-hello:
    runs-on: ubuntu-latest
    steps:
      - name: Print greeting
        run: echo "Hello, GitHub Actions!"
```

Key facts:
- Workflows live in `.github/workflows/` and must be `.yml` or `.yaml`
- They are version-controlled alongside your code
- A workflow contains one or more **jobs**
- Workflows are triggered by **events**

---

### Events (Triggers)

An **event** is a specific activity in your repository that triggers a workflow run. Events are declared under the `on:` key.

| Event | Triggered When |
|-------|---------------|
| `push` | A commit is pushed to a branch |
| `pull_request` | A PR is opened, updated, or closed |
| `workflow_dispatch` | Manually triggered from the GitHub UI or API |
| `schedule` | On a cron schedule (UTC timezone) |
| `release` | A GitHub release is published |
| `workflow_call` | Called by another workflow (reusable workflows) |
| `workflow_run` | After another workflow completes |
| `issues` | An issue is opened, edited, labeled, etc. |
| `create` | A branch or tag is created |
| `delete` | A branch or tag is deleted |
| `registry_package` | A package is published or updated |

**Filtering events with branches and paths:**

```yaml
on:
  push:
    branches:
      - main
      - 'release/**'      # glob pattern: any branch starting with release/
    paths:
      - 'src/**'           # only trigger if files in src/ change
      - '!src/**/*.md'     # exclude markdown files inside src/
  pull_request:
    branches:
      - main
    types:
      - opened
      - synchronize
      - reopened
```

> **Tip:** Use `paths-ignore` and `branches-ignore` as shorthand exclusion lists.

---

### Jobs

A **job** is a set of steps that execute on the same runner (virtual machine). Jobs run in parallel by default.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."

  test:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing..."
```

**Sequential jobs using `needs`:**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build complete"

  test:
    needs: build          # waits for 'build' to succeed
    runs-on: ubuntu-latest
    steps:
      - run: echo "Tests run after build"

  deploy:
    needs: [build, test]  # waits for both
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy after build AND test"
```

**Job-level properties:**

| Property | Purpose |
|----------|---------|
| `runs-on` | Specifies the runner OS/environment |
| `needs` | Defines job dependencies (DAG) |
| `if` | Conditional job execution |
| `env` | Job-level environment variables |
| `outputs` | Values exported to downstream jobs |
| `timeout-minutes` | Max allowed runtime (default: 360) |
| `continue-on-error` | Allow the workflow to pass even if this job fails |
| `strategy` | Matrix and concurrency configuration |
| `environment` | Links job to a GitHub Environment for deployment gates |
| `permissions` | Overrides `GITHUB_TOKEN` scopes for this job |
| `concurrency` | Prevents duplicate runs of the same job |

---

### Steps

A **step** is an individual task within a job. Steps run sequentially on the same runner and share the same filesystem.

```yaml
steps:
  # Step using a shell command
  - name: Print OS info
    run: uname -a

  # Step using a marketplace action
  - name: Checkout code
    uses: actions/checkout@v4

  # Step with environment variables
  - name: Run with env
    env:
      NODE_ENV: production
    run: echo "Running in $NODE_ENV"

  # Step with a condition
  - name: Only on main branch
    if: github.ref == 'refs/heads/main'
    run: echo "This is main!"

  # Multi-line shell script
  - name: Multi-line script
    run: |
      echo "Line one"
      echo "Line two"
      npm install
      npm test
```

**Step-level properties:**

| Property | Purpose |
|----------|---------|
| `name` | Human-readable label shown in the Actions UI |
| `run` | Shell command(s) to execute |
| `uses` | Calls a GitHub Action (marketplace, local, or remote) |
| `with` | Passes input parameters to an action |
| `env` | Step-scoped environment variables |
| `if` | Conditional execution expression |
| `id` | Identifier for referencing step outputs |
| `continue-on-error` | Don't fail the job if this step fails |
| `timeout-minutes` | Per-step timeout |
| `shell` | Override shell: `bash`, `sh`, `pwsh`, `python`, `cmd` |
| `working-directory` | Set the working directory for `run` commands |

---

### Actions

An **action** is a reusable unit of automation — the building block of a step. There are three types:

#### 1. Marketplace / Public Actions

Pre-built actions from the [GitHub Marketplace](https://github.com/marketplace?type=actions) or any public repository:

```yaml
steps:
  - uses: actions/checkout@v4              # Official: checks out your repo
  - uses: actions/setup-node@v4            # Official: installs Node.js
    with:
      node-version: '20'
  - uses: actions/cache@v4                 # Official: caches dependencies
  - uses: actions/upload-artifact@v4       # Official: uploads build artifacts
  - uses: actions/download-artifact@v4     # Official: downloads artifacts
```

**Always pin actions to a specific version tag or commit SHA:**

```yaml
# Good — pinned to major version tag
- uses: actions/checkout@v4

# Better — pinned to exact commit SHA (most secure)
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
```

#### 2. Local / Custom Actions

Actions defined within your own repository under `.github/actions/`:

```yaml
# .github/actions/setup-my-tool/action.yml
name: 'Setup My Tool'
description: 'Installs and configures our internal CLI tool'
inputs:
  version:
    description: 'Tool version to install'
    required: true
    default: 'latest'
outputs:
  install-path:
    description: 'Path where the tool was installed'
    value: ${{ steps.install.outputs.path }}
runs:
  using: 'composite'
  steps:
    - name: Install tool
      id: install
      shell: bash
      run: |
        echo "Installing my-tool v${{ inputs.version }}"
        # ... installation logic ...
        echo "path=/usr/local/bin/my-tool" >> $GITHUB_OUTPUT
```

**Calling a local action:**

```yaml
steps:
  - uses: ./.github/actions/setup-my-tool
    with:
      version: '2.1.0'
```

#### 3. Action Types

| Type | Description | `runs.using` value |
|------|-------------|-------------------|
| **JavaScript** | Node.js script, fastest execution | `node20` |
| **Composite** | Chains multiple `run` and `uses` steps | `composite` |
| **Docker** | Runs inside a container, most portable | `docker` |

---

### Runners

A **runner** is the virtual machine that executes your workflow jobs. GitHub provides hosted runners, or you can bring your own.

#### GitHub-Hosted Runners

| Label | OS | CPU | RAM | Storage |
|-------|----|-----|-----|---------|
| `ubuntu-latest` | Ubuntu 22.04 | 4-core | 16 GB | 14 GB SSD |
| `ubuntu-22.04` | Ubuntu 22.04 | 4-core | 16 GB | 14 GB SSD |
| `ubuntu-20.04` | Ubuntu 20.04 | 4-core | 16 GB | 14 GB SSD |
| `windows-latest` | Windows Server 2022 | 4-core | 16 GB | 14 GB SSD |
| `windows-2022` | Windows Server 2022 | 4-core | 16 GB | 14 GB SSD |
| `macos-latest` | macOS 14 (Apple Silicon) | 3-core M1 | 7 GB | 14 GB SSD |
| `macos-13` | macOS 13 (Intel) | 4-core | 14 GB | 14 GB SSD |

```yaml
jobs:
  linux-job:
    runs-on: ubuntu-latest

  windows-job:
    runs-on: windows-latest

  mac-job:
    runs-on: macos-latest
```

#### Self-Hosted Runners

Register your own machine as a runner for full control over hardware, software, and networking:

```yaml
jobs:
  my-job:
    runs-on: self-hosted           # uses any available self-hosted runner

  specific-runner:
    runs-on: [self-hosted, linux, x64, gpu]  # label-based targeting
```

**When to use self-hosted runners:**
- Need specific hardware (GPU, ARM, large RAM)
- Access to internal network resources
- Compliance requirements (data must not leave your environment)
- Cost optimization for very long or frequent builds

#### Accessing Runner Context

```yaml
steps:
  - name: Print runner info
    run: |
      echo "OS: ${{ runner.os }}"
      echo "Arch: ${{ runner.arch }}"
      echo "Temp dir: ${{ runner.temp }}"
      echo "Tool cache: ${{ runner.tool_cache }}"
```

---

## Workflow Syntax Reference

### Basic Workflow Structure

```yaml
name: CI Pipeline                    # Display name (optional but recommended)

on:                                  # Event triggers
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:                                 # Workflow-level environment variables
  NODE_VERSION: '20'
  APP_NAME: my-app

jobs:
  build:                             # Job ID (used in needs: references)
    name: Build Application          # Display name for the job
    runs-on: ubuntu-latest
    timeout-minutes: 15              # Fail job if it exceeds 15 minutes

    env:                             # Job-level env (overrides workflow-level)
      BUILD_MODE: production

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:                         # Step-level env (overrides job-level)
          NODE_ENV: production
        run: npm run build
```

---

### Trigger Events In Depth

#### `push`

```yaml
on:
  push:
    branches:
      - main
      - 'feature/**'
      - '!feature/wip-*'       # exclude WIP branches
    tags:
      - 'v*.*.*'               # trigger on version tags
    paths:
      - 'src/**'
      - 'package*.json'
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

#### `pull_request`

```yaml
on:
  pull_request:
    types:
      - opened          # PR created
      - synchronize     # new commit pushed to PR branch
      - reopened        # closed PR reopened
      - ready_for_review  # draft converted to ready
    branches:
      - main
      - 'release/**'
```

#### `workflow_dispatch` (Manual Trigger)

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target deployment environment'
        required: true
        type: choice
        options:
          - staging
          - production
      dry-run:
        description: 'Perform a dry run only?'
        required: false
        type: boolean
        default: false
      version:
        description: 'Version to deploy (e.g. v1.2.3)'
        required: false
        type: string
        default: 'latest'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Deploying to: ${{ inputs.environment }}"
          echo "Dry run: ${{ inputs.dry-run }}"
          echo "Version: ${{ inputs.version }}"
```

#### `schedule` (Cron)

```yaml
on:
  schedule:
    - cron: '0 6 * * 1-5'    # 6 AM UTC, Mon–Fri
    - cron: '0 0 * * 0'      # Midnight UTC, every Sunday
```

**Cron syntax:**

```
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–6, Sun=0)
│ │ │ │ │
* * * * *
```

| Expression | Meaning |
|------------|---------|
| `0 * * * *` | Every hour |
| `0 9 * * 1-5` | 9 AM UTC, weekdays only |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 1 * *` | Midnight on the 1st of each month |

#### `workflow_call` (Reusable Workflow Trigger)

```yaml
on:
  workflow_call:
    inputs:
      node-version:
        description: 'Node.js version'
        type: string
        required: false
        default: '20'
    secrets:
      NPM_TOKEN:
        description: 'NPM auth token'
        required: true
    outputs:
      artifact-name:
        description: 'Name of the uploaded artifact'
        value: ${{ jobs.build.outputs.artifact-name }}
```

---

### Runner Types

```yaml
jobs:
  # GitHub-hosted (most common)
  hosted:
    runs-on: ubuntu-latest

  # Specific version (pinned, stable)
  pinned:
    runs-on: ubuntu-22.04

  # Self-hosted
  self-hosted:
    runs-on: [self-hosted, linux, x64]

  # Matrix across runners
  cross-platform:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
```

---

### Environment Variables & Scopes

Variables are inherited from outer to inner scope, with inner scopes overriding outer:

```
Workflow env  →  Job env  →  Step env
(lowest priority)              (highest priority)
```

```yaml
env:                          # Workflow-level: available in ALL jobs and steps
  APP_ENV: staging
  LOG_LEVEL: info

jobs:
  build:
    env:                      # Job-level: overrides workflow-level for this job
      APP_ENV: production     # overrides 'staging'

    steps:
      - name: Step with own env
        env:                  # Step-level: overrides job-level for this step
          LOG_LEVEL: debug    # overrides 'info'
        run: |
          echo "APP_ENV=$APP_ENV"     # production
          echo "LOG_LEVEL=$LOG_LEVEL" # debug
```

**Setting dynamic environment variables:**

```yaml
steps:
  - name: Set env dynamically
    run: |
      echo "BUILD_DATE=$(date +'%Y-%m-%d')" >> $GITHUB_ENV
      echo "SHORT_SHA=${GITHUB_SHA::8}" >> $GITHUB_ENV

  - name: Use the dynamic variable
    run: echo "Build date: $BUILD_DATE, SHA: $SHORT_SHA"
```

**Default environment variables (always available):**

| Variable | Value |
|----------|-------|
| `GITHUB_REPOSITORY` | `owner/repo-name` |
| `GITHUB_SHA` | Full commit SHA |
| `GITHUB_REF` | Branch or tag ref (e.g. `refs/heads/main`) |
| `GITHUB_REF_NAME` | Short branch/tag name (e.g. `main`) |
| `GITHUB_ACTOR` | Username that triggered the run |
| `GITHUB_EVENT_NAME` | Event name (e.g. `push`, `pull_request`) |
| `GITHUB_WORKSPACE` | Path to the checked-out repo |
| `GITHUB_RUN_ID` | Unique ID for this workflow run |
| `GITHUB_RUN_NUMBER` | Sequential run count for this workflow |
| `RUNNER_OS` | `Linux`, `Windows`, or `macOS` |

---

### Contexts

Contexts are objects available in expressions `${{ }}` throughout your workflow:

#### `github` context

```yaml
steps:
  - run: |
      echo "Event: ${{ github.event_name }}"
      echo "Ref: ${{ github.ref }}"
      echo "Branch: ${{ github.ref_name }}"
      echo "SHA: ${{ github.sha }}"
      echo "Actor: ${{ github.actor }}"
      echo "Repo: ${{ github.repository }}"
      echo "Run ID: ${{ github.run_id }}"
      echo "Run number: ${{ github.run_number }}"
      echo "Workflow: ${{ github.workflow }}"
      echo "Job: ${{ github.job }}"
```

#### `runner` context

```yaml
steps:
  - run: |
      echo "OS: ${{ runner.os }}"
      echo "Arch: ${{ runner.arch }}"
      echo "Name: ${{ runner.name }}"
      echo "Temp: ${{ runner.temp }}"
      echo "Tool cache: ${{ runner.tool_cache }}"
```

#### `env` context

```yaml
env:
  MY_VAR: hello

steps:
  - run: echo "${{ env.MY_VAR }}"
```

#### `steps` context (referencing step outputs)

```yaml
steps:
  - name: Generate value
    id: gen
    run: echo "result=42" >> $GITHUB_OUTPUT

  - name: Use value
    run: echo "Got: ${{ steps.gen.outputs.result }}"
```

#### `jobs` context (in reusable workflows)

```yaml
outputs:
  my-output: ${{ jobs.build.outputs.artifact }}
```

#### `secrets` context

```yaml
steps:
  - run: echo "Token exists: ${{ secrets.MY_TOKEN != '' }}"
  - uses: some/action@v1
    with:
      token: ${{ secrets.MY_TOKEN }}
```

#### `inputs` context (in `workflow_dispatch` / `workflow_call`)

```yaml
steps:
  - run: echo "Input value: ${{ inputs.my-input }}"
```

---

### Secrets & Variables

#### Repository Secrets

Secrets are encrypted at rest and redacted from logs automatically.

```yaml
steps:
  - name: Use a secret
    env:
      API_KEY: ${{ secrets.MY_API_KEY }}     # never use directly in 'run:'
    run: ./deploy.sh                          # script reads $API_KEY from env

  - name: Pass to action
    uses: some/deploy-action@v2
    with:
      api-key: ${{ secrets.MY_API_KEY }}
```

> ⚠️ **Never** interpolate secrets directly into `run:` shell commands — they may be printed in logs. Always pass them as `env:` variables or `with:` inputs.

#### Repository Variables (non-secret)

For non-sensitive configuration values, use repository variables (visible in logs):

```yaml
steps:
  - run: echo "Region: ${{ vars.AWS_REGION }}"
```

#### Environment Secrets

Secrets scoped to a specific deployment environment:

```yaml
jobs:
  deploy:
    environment: production   # activates environment-scoped secrets
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
        env:
          PROD_DB_URL: ${{ secrets.DB_URL }}  # from 'production' environment
```

#### The Built-in `GITHUB_TOKEN`

Every workflow automatically gets a short-lived `GITHUB_TOKEN` with permissions to interact with the repository:

```yaml
steps:
  - name: Create a comment on a PR
    uses: actions/github-script@v7
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      script: |
        github.rest.issues.createComment({
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: 'Deployment complete! ✅'
        })
```

---

### Expressions & Status Functions

#### Conditional `if:` expressions

```yaml
steps:
  # Only on push to main
  - if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    run: echo "Main branch push"

  # Only on PRs
  - if: github.event_name == 'pull_request'
    run: echo "Pull request event"

  # Skip on draft PRs
  - if: github.event.pull_request.draft == false
    run: echo "Not a draft PR"

  # Using contains()
  - if: contains(github.ref, 'release')
    run: echo "Release branch"

  # Using startsWith()
  - if: startsWith(github.ref, 'refs/tags/v')
    run: echo "Version tag"
```

#### Status check functions

These are used in `if:` to handle step/job outcomes:

| Function | Meaning |
|----------|---------|
| `success()` | All previous steps succeeded (default behavior) |
| `failure()` | At least one previous step failed |
| `cancelled()` | The workflow was cancelled |
| `always()` | Run regardless of any prior outcome |

```yaml
steps:
  - name: Main task
    id: main
    run: ./my-script.sh

  - name: Always send notification
    if: always()
    run: ./notify.sh

  - name: Only on failure
    if: failure()
    run: ./alert.sh "Build failed!"

  - name: Cleanup on success or failure (but not cancel)
    if: success() || failure()
    run: ./cleanup.sh
```

**Job-level status:**

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  notify-on-failure:
    needs: build
    if: failure()       # only runs if 'build' job failed
    runs-on: ubuntu-latest
    steps:
      - run: ./send-alert.sh
```

---

### Job Outputs

Pass data between jobs using `$GITHUB_OUTPUT`:

```yaml
jobs:
  generate:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.set-version.outputs.version }}
      build-date: ${{ steps.set-date.outputs.date }}

    steps:
      - name: Set version
        id: set-version
        run: echo "version=1.4.2" >> $GITHUB_OUTPUT

      - name: Set date
        id: set-date
        run: echo "date=$(date +'%Y-%m-%d')" >> $GITHUB_OUTPUT

  consume:
    needs: generate
    runs-on: ubuntu-latest
    steps:
      - name: Use outputs from previous job
        run: |
          echo "Version: ${{ needs.generate.outputs.version }}"
          echo "Date: ${{ needs.generate.outputs.build-date }}"
```

---

### Matrix Strategy

Run a job multiple times with different variable combinations:

#### Single-dimension matrix

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

#### Multi-dimensional matrix (Cartesian product)

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20]
        # This produces 3 × 2 = 6 parallel jobs
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

#### Matrix with `include` and `exclude`

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20]
    include:
      - os: ubuntu-latest
        node-version: 22       # add an extra combination
        experimental: true     # add an extra variable to this combo
    exclude:
      - os: windows-latest
        node-version: 18       # skip this specific combination
```

#### Matrix control properties

```yaml
strategy:
  fail-fast: false             # don't cancel other jobs if one fails (default: true)
  max-parallel: 3              # run at most 3 jobs at a time
  matrix:
    node-version: [16, 18, 20, 22]
```

---

### Caching

Speed up workflows by caching dependency directories between runs:

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Cache node_modules
    id: cache-npm
    uses: actions/cache@v4
    with:
      path: ~/.npm                         # directory to cache
      key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        npm-${{ runner.os }}-             # fallback if exact key misses

  - name: Install dependencies
    run: npm ci

  # Cache is automatically saved at the end of the job
```

**Cache key strategies:**

| Scenario | Key Pattern |
|----------|------------|
| npm | `npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}` |
| pip | `pip-${{ runner.os }}-${{ hashFiles('**/requirements.txt') }}` |
| yarn | `yarn-${{ runner.os }}-${{ hashFiles('**/yarn.lock') }}` |
| Gradle | `gradle-${{ runner.os }}-${{ hashFiles('**/*.gradle*') }}` |
| Maven | `maven-${{ runner.os }}-${{ hashFiles('**/pom.xml') }}` |

> **Cache limits:** Each repository gets 10 GB of cache space. Caches unused for 7 days are evicted automatically.

---

### Artifacts

Artifacts persist files from a runner beyond a job's lifetime — useful for sharing build outputs between jobs or downloading results after the workflow completes.

#### Uploading artifacts

```yaml
steps:
  - run: npm run build        # produces ./dist/

  - name: Upload build output
    uses: actions/upload-artifact@v4
    with:
      name: dist-${{ github.run_number }}    # artifact name
      path: dist/                            # file or directory to upload
      retention-days: 7                      # auto-delete after 7 days (default: 90)
      if-no-files-found: error               # fail if nothing to upload
```

#### Downloading artifacts

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download build output
        uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./downloaded-dist

      - run: ls -la ./downloaded-dist
```

#### Matrix artifacts (unique names per matrix entry)

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]

steps:
  - uses: actions/upload-artifact@v4
    with:
      name: build-${{ matrix.os }}     # unique name prevents collision
      path: dist/
```

---

### Concurrency Control

Prevent duplicate workflow runs and manage resource contention:

```yaml
# Workflow-level concurrency
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true    # cancel older run when a new one starts

jobs:
  deploy:
    # Job-level concurrency (stricter)
    concurrency:
      group: deploy-${{ github.ref }}
      cancel-in-progress: false  # queue instead of cancel (safe for deploys)
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

**Common concurrency group patterns:**

| Pattern | Use Case |
|---------|----------|
| `${{ github.workflow }}-${{ github.ref }}` | One run per branch per workflow |
| `${{ github.workflow }}-${{ github.head_ref \|\| github.ref }}` | Handles PRs and branches |
| `deploy-${{ github.ref_name }}` | One deploy per branch at a time |
| `${{ github.run_id }}` | Never cancel (each run is unique) |

---

### Permissions & Security

#### Restricting `GITHUB_TOKEN` permissions

By default, `GITHUB_TOKEN` has broad write permissions. Apply least-privilege:

```yaml
# Workflow-level: deny all, grant only what's needed
permissions:
  contents: read           # read repo files
  pull-requests: write     # post comments on PRs
  issues: write            # create/update issues
  packages: read           # read GitHub Packages

jobs:
  deploy:
    permissions:
      contents: read
      id-token: write      # needed for OIDC / keyless cloud auth
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

**Available permission scopes:**

| Scope | Description |
|-------|-------------|
| `actions` | Manage workflow runs and artifacts |
| `checks` | Create and update check runs |
| `contents` | Read/write repository contents |
| `deployments` | Manage deployments |
| `id-token` | Request OIDC JWT (for keyless cloud auth) |
| `issues` | Manage issues and comments |
| `packages` | Read/write GitHub Packages |
| `pages` | Manage GitHub Pages |
| `pull-requests` | Manage PRs and reviews |
| `security-events` | Upload code scanning results |
| `statuses` | Update commit statuses |

#### Security best practices

```yaml
# ✅ Good: pin to full commit SHA
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

# ❌ Bad: mutable tag can be changed by attacker
- uses: actions/checkout@main

# ✅ Good: pass secrets as env vars
- env:
    TOKEN: ${{ secrets.MY_TOKEN }}
  run: ./deploy.sh

# ❌ Bad: secret interpolated directly into shell (visible in process list)
- run: ./deploy.sh --token ${{ secrets.MY_TOKEN }}
```

---

### Environments & Deployment Gates

GitHub Environments add deployment protection rules (required reviewers, wait timers, branch restrictions):

```yaml
jobs:
  deploy-staging:
    environment:
      name: staging
      url: https://staging.myapp.com     # shown in the deployment status UI
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh staging

  deploy-production:
    needs: deploy-staging
    environment:
      name: production
      url: https://myapp.com
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh production
      # ⏸ This job pauses here if production env has required reviewers configured
```

**Set up environments:**
1. Go to **Settings → Environments → New environment**
2. Add **required reviewers** (humans who must approve before the job continues)
3. Add a **wait timer** (delay in minutes)
4. Restrict to **protected branches** only

---

### Reusable Workflows

Extract common CI logic into separate workflow files called by many other workflows:

#### Callee (the reusable workflow)

```yaml
# .github/workflows/reusable-build.yml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        required: false
        default: '20'
      environment:
        type: string
        required: true
    secrets:
      NPM_TOKEN:
        required: false
    outputs:
      artifact-name:
        value: ${{ jobs.build.outputs.artifact-name }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      artifact-name: ${{ steps.upload.outputs.artifact-id }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm run build
      - id: upload
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ inputs.environment }}
          path: dist/
```

#### Caller (uses the reusable workflow)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]

jobs:
  call-build:
    uses: ./.github/workflows/reusable-build.yml     # local reference
    with:
      node-version: '20'
      environment: production
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

  use-output:
    needs: call-build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Built artifact: ${{ needs.call-build.outputs.artifact-name }}"
```

> Reusable workflows can also reference workflows in other repositories:
> `uses: my-org/shared-workflows/.github/workflows/build.yml@main`

---

### Composite Actions

Package a sequence of steps into a single reusable action:

```yaml
# .github/actions/setup-my-tool/action.yml
name: 'Setup My Tool'
description: 'Installs Node.js, caches deps, and runs lint'

inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '20'
  working-directory:
    description: 'Directory to run commands in'
    required: false
    default: '.'

outputs:
  cache-hit:
    description: 'Whether the dependency cache was restored'
    value: ${{ steps.cache.outputs.cache-hit }}

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}

    - name: Cache dependencies
      id: cache
      uses: actions/cache@v4
      with:
        path: ${{ inputs.working-directory }}/node_modules
        key: node-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

    - name: Install dependencies
      if: steps.cache.outputs.cache-hit != 'true'
      shell: bash
      working-directory: ${{ inputs.working-directory }}
      run: npm ci

    - name: Run lint
      shell: bash
      working-directory: ${{ inputs.working-directory }}
      run: npm run lint
```

**Using the composite action:**

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: ./.github/actions/setup-my-tool
    with:
      node-version: '20'
  - run: npm test
```

---

## Repository Architecture

```
.
├── .github/
│   ├── actions/
│   │   └── setup-my-tool/
│   │       └── action.yml                 # Custom reusable composite action
│   └── workflows/
│       ├── 01-hello-world.yml             # Basic syntax & execution
│       ├── 02-on-push.yml                 # Push event hooks
│       ├── 03-on-pull-request.yml         # PR event lifecycles
│       ├── 04-on-branches-paths.yml       # Path & branch pattern filtering
│       ├── 05-on-workflow-dispatch.yml    # Manual inputs via UI
│       ├── 06-on-schedule.yml             # UTC cron automation
│       ├── 07-on-multiple-events.yml      # Multi-event listeners
│       ├── 08-runs-on-and-runner-context.yml  # VM architectures & runner object
│       ├── 09-run-vs-uses.yml             # Shell execution vs Action modules
│       ├── 10-checkout.yml                # Workspace repository cloning
│       ├── 11-setup-node.yml              # Node.js toolcache configuration
│       ├── 12-env-scopes.yml              # Workflow, job, & step env precedence
│       ├── 13-contexts.yml                # Expression contexts (github, runner)
│       ├── 14-secrets.yml                 # Encrypted secrets & log masking
│       ├── 15-node-ci-combined.yml        # End-to-end basic CI loop
│       ├── 16-parallel-jobs.yml           # Concurrent VM execution
│       ├── 17-needs-dependencies.yml      # Directed Acyclic Graphs (DAGs)
│       ├── 18-if-conditionals.yml         # Conditional gate evaluation
│       ├── 19-status-functions.yml        # always(), failure(), and error handling
│       ├── 20-job-outputs.yml             # Inter-job data passing via $GITHUB_OUTPUT
│       ├── 21-matrix-basics.yml           # Single-dimension test matrix
│       ├── 22-matrix-multi-dimensional.yml    # Multi-axis platform/runtime matrices
│       ├── 23-matrix-fail-fast-max-parallel.yml  # Concurrency limits & fail-fast
│       ├── 24-cache-dependencies.yml      # Lockfile caching for performance
│       ├── 25-artifacts-basics.yml        # Cross-job build artifact persistence
│       ├── 26-artifacts-matrix-and-retention.yml  # Retention policies & multi-target builds
│       ├── 27-reusable-workflow-caller.yml    # Calling modular workflows
│       ├── 28-reusable-workflow-callee.yml    # Defining reusable entry points
│       ├── 29-composite-action-demo.yml   # Encapsulating multi-step shell logic
│       ├── 30-token-permissions.yml       # Least-privilege GITHUB_TOKEN scopes
│       ├── 31-environments-and-approvals.yml  # Deployment gates & environment URLs
│       ├── 32-concurrency.yml             # Race-condition locks & build cancellations
│       ├── 33-timeout-and-continue-on-error.yml  # Fault tolerance & timeout safeguards
│       └── 34-pipeline-capstone.yml       # Production CI/CD enterprise pipeline
├── src/
│   ├── app.js                             # Sample runtime application
│   └── math.js                            # Core testable business logic
├── tests/
│   └── math.test.js                       # Native Node.js unit tests
├── .eslintrc.json                         # Static analysis lint configuration
├── package.json                           # Scripts and dependencies
└── README.md
```

---

## Learning Objectives & Curriculum Breakdown

### Module 1: Triggers & Runner Foundations (Files 01–07)

**Goal:** Understand what initiates a pipeline and how to prevent unnecessary runner billable minutes.

| File | Key Concept | What You Learn |
|------|-------------|----------------|
| `01-hello-world.yml` | Basic syntax | YAML indentation, `jobs` mapping, minimal runners, the Actions UI |
| `02-on-push.yml` | Push triggers | Automatic triggering from Git push hooks, inspecting commit refs |
| `03-on-pull-request.yml` | PR lifecycle | PR event types (`opened`, `synchronize`, `reopened`) |
| `04-on-branches-paths.yml` | Filtering | Path-based filtering to skip unchanged code and save compute minutes |
| `05-on-workflow-dispatch.yml` | Manual triggers | UI inputs: dropdowns, booleans, free-text strings |
| `06-on-schedule.yml` | Cron jobs | UTC POSIX cron syntax for recurring automation |
| `07-on-multiple-events.yml` | Multi-event | Single pipeline responding to multiple distinct event hooks |

---

### Module 2: Tooling, Runtimes & State (Files 08–15)

**Goal:** Interact with virtual machine operating systems, inject environment variables, and manage secrets securely.

| File | Key Concept | What You Learn |
|------|-------------|----------------|
| `08-runs-on-and-runner-context.yml` | Runner context | OS architecture, temp directories, `runner.*` object properties |
| `09-run-vs-uses.yml` | `run` vs `uses` | Native shell execution vs calling modular GitHub Actions |
| `10-checkout.yml` | Workspace | Commit history depth, submodules, workspace initialization |
| `11-setup-node.yml` | Toolcache | Node.js version pinning and toolcache configuration |
| `12-env-scopes.yml` | Env hierarchy | Variable inheritance and override order across workflow/job/step |
| `13-contexts.yml` | Contexts | `github.*`, `runner.*`, `env.*` expression context references |
| `14-secrets.yml` | Secrets | Encrypted secret injection and automatic log masking |
| `15-node-ci-combined.yml` | End-to-end CI | Unified baseline: triggers → setup → install → lint → test |

---

### Module 3: Orchestration, Logic & Matrices (Files 16–23)

**Goal:** Build non-linear pipelines (DAGs), handle failures gracefully, and run dynamic test matrices.

| File | Key Concept | What You Learn |
|------|-------------|----------------|
| `16-parallel-jobs.yml` | Parallelism | Independent jobs on isolated VMs, default parallel execution |
| `17-needs-dependencies.yml` | DAGs | `needs:` key, sequential job chains, Directed Acyclic Graphs |
| `18-if-conditionals.yml` | Conditionals | `if:` expressions, `github.ref`, `github.event_name` evaluation |
| `19-status-functions.yml` | Error handling | `always()`, `failure()`, `cancelled()`, `continue-on-error` |
| `20-job-outputs.yml` | Job outputs | `$GITHUB_OUTPUT`, `outputs:` mapping, cross-job data passing |
| `21-matrix-basics.yml` | Matrix | Single-dimension test matrix across multiple versions |
| `22-matrix-multi-dimensional.yml` | Multi-axis | Cartesian product matrices across OS and runtime versions |
| `23-matrix-fail-fast-max-parallel.yml` | Matrix control | `fail-fast: false`, `max-parallel`, throttling resource usage |

---

### Module 4: Caching & Artifact Management (Files 24–26)

**Goal:** Speed up builds and share compiled assets across jobs or pipeline stages.

| File | Key Concept | What You Learn |
|------|-------------|----------------|
| `24-cache-dependencies.yml` | Dependency cache | `actions/cache`, lockfile hashing, cache key strategies |
| `25-artifacts-basics.yml` | Artifacts | `upload-artifact`, `download-artifact`, cross-job file sharing |
| `26-artifacts-matrix-and-retention.yml` | Retention | Unique artifact names per matrix entry, retention policies |

---

### Module 5: Enterprise Governance, Modularity & Security (Files 27–34)

**Goal:** Write reusable infrastructure-as-code, enforce least-privilege security, and deploy safely to production.

| File | Key Concept | What You Learn |
|------|-------------|----------------|
| `27-reusable-workflow-caller.yml` | Caller | Invoking reusable workflows with `uses:` and `workflow_call` |
| `28-reusable-workflow-callee.yml` | Callee | Defining inputs, secrets, and outputs in reusable entry points |
| `29-composite-action-demo.yml` | Composite | Packaging multi-step shell logic into a local custom action |
| `30-token-permissions.yml` | Least-privilege | Locking `GITHUB_TOKEN` to minimal required read/write scopes |
| `31-environments-and-approvals.yml` | Environments | Manual approval gates, wait timers, deployment URLs |
| `32-concurrency.yml` | Concurrency | Groups, `cancel-in-progress`, preventing race conditions |
| `33-timeout-and-continue-on-error.yml` | Fault tolerance | `timeout-minutes`, `continue-on-error`, runaway cost prevention |
| `34-pipeline-capstone.yml` | Full pipeline | Lint → matrix test → artifact → stage → approve → production |

---

## Local Development & Validation

Before pushing workflows to GitHub, test the application and test suite locally:

```bash
# Install dependencies
npm install

# Run static analysis / linter
npm run lint

# Run the native unit test suite
npm test

# Run the sample application entrypoint
npm start
```

---

## How to Practice with This Repository

### 1. Push Changes to Trigger Workflows

Make edits to `src/` or `tests/` and push to `main` to trigger workflows configured for `on: push`.

```bash
git checkout -b feature/my-change
# make a change to src/math.js
git add . && git commit -m "test: trigger CI"
git push origin feature/my-change
```

### 2. Open Pull Requests

Create a feature branch and open a PR targeting `main` to observe `03-on-pull-request.yml` and `15-node-ci-combined.yml` in action.

### 3. Trigger Manual Workflows

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select any workflow marked with `workflow_dispatch`
4. Click **Run workflow**, fill in any inputs, and click the green button

### 4. Configure Secrets

1. Navigate to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Create a secret named `MY_API_KEY` with any value
4. Push a commit to trigger `14-secrets.yml` and observe the masked output

### 5. Configure Environments

1. Navigate to **Settings → Environments → New environment**
2. Create an environment named `production`
3. Add yourself as a **Required reviewer**
4. Trigger `31-environments-and-approvals.yml` or `34-pipeline-capstone.yml` and observe the approval gate pause

### 6. Explore the Actions Tab

After any workflow runs:
- Click a run to see the job graph (parallel vs sequential)
- Click a job to expand its step logs
- Check the **Summary** tab for artifact download links
- Use **Re-run jobs** to retry failed steps

---

## Quick Reference Cheat Sheet

```yaml
# ── Triggers ──────────────────────────────────────────────
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]
  schedule:
    - cron: '0 6 * * 1-5'
  workflow_dispatch:
    inputs:
      env: { type: choice, options: [staging, production] }

# ── Permissions ───────────────────────────────────────────
permissions:
  contents: read
  pull-requests: write

# ── Env Variables ─────────────────────────────────────────
env:
  NODE_VERSION: '20'

# ── Job with matrix, cache, conditional ───────────────────
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        node: [18, 20]
    runs-on: ${{ matrix.os }}
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - if: failure()
        run: echo "Tests failed!"

# ── Job outputs ───────────────────────────────────────────
  generate:
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.tag.outputs.tag }}
    steps:
      - id: tag
        run: echo "tag=v1.0.0" >> $GITHUB_OUTPUT

# ── Deployment with environment gate ──────────────────────
  deploy:
    needs: [test, generate]
    environment:
      name: production
      url: https://myapp.com
    concurrency:
      group: deploy-production
      cancel-in-progress: false
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.generate.outputs.tag }}"
```

---

> **Tip:** Work through the modules in order — each one builds on concepts introduced in the previous module. By the time you reach `34-pipeline-capstone.yml`, every concept covered in this masterclass will come together in a single production-grade pipeline.
