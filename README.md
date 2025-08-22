## Test Github Actions

This project includes several GitHub Actions workflows:

- **test.yml**: Runs Jest unit tests with coverage reporting
- **eslint.yml**: Runs ESLint checks on TypeScript files
- **pre-commit-changed.yml**: Runs pre-commit checks on changed files in PRs

## Pre-commit Setup

This project uses [pre-commit](https://pre-commit.com/) to run linting and formatting checks before each commit.

### Setup

The pre-commit hooks are already installed if you've cloned this repository. If not, run:

```bash
# Using the virtual environment Python
.venv/Scripts/pre-commit.exe install
```

### Manual Execution

To run pre-commit checks manually on all files:

```bash
# Using npm script
npm run pre-commit

# Or directly
.venv/Scripts/pre-commit.exe run --all-files
```

### GitHub Actions Integration

The pre-commit checks are automatically run on pull requests through the `pre-commit-changed.yml` workflow. This workflow:

- Runs pre-commit hooks only on files that have changed
- Posts results as a comment on the PR
- Fails the workflow if any checks fail
- Caches pre-commit environments for faster execution

### Hooks Included

- **trailing-whitespace**: Removes trailing whitespace
- **end-of-file-fixer**: Ensures files end with a newline
- **check-yaml**: Validates YAML files
- **check-json**: Validates JSON files
- **check-merge-conflict**: Checks for merge conflict markers
- **check-added-large-files**: Prevents large files from being committed
- **mixed-line-ending**: Fixes mixed line endings
- **eslint**: Runs ESLint with auto-fix for TypeScript/JavaScript files
- **tsc**: TypeScript type checking

### Bypassing Pre-commit

If you need to bypass pre-commit checks (not recommended), use:

```bash
git commit -m "your message" --no-verify
```
