## Test Github Actions

This project includes several GitHub Actions workflows:

- **test.yml**: Runs Jest unit tests with coverage reporting
- **eslint.yml**: Runs ESLint checks on TypeScript files
- **.pre-commit-config.yaml**: Runs pre-commit checks on changed files in PRs

## Use linter + pre-commit to your own project

To use the linting configuration from this project in your own project, copy the following files and follow these setup steps:

### Required Files to Copy

1. **eslint.config.mjs** - ESLint configuration with TypeScript support
2. **.pre-commit-config.yaml** - Pre-commit hooks configuration
3. **tsconfig.json** - TypeScript configuration (adjust paths as needed)

### Setup Steps

1. **Copy the configuration files** to your project root:
    ```powershell
    # Copy linting configuration files
    copy eslint.config.mjs {your-project}/
    # Copy pre-commit configuration files
    copy .pre-commit-config.yaml {your-project}/
    copy scripts/validate-assets.mjs {your-project}/scripts/
    ```

2. **Install required dependencies** in your project by copying lines in `package.json`:
    ```json
    "devDependencies": {
        ...
        # Linter
        "@eslint/js": "^9.33.0",
        "@stylistic/eslint-plugin": "^5.2.3",
        "eslint": "^9.33.0",
        "eslint-plugin-no-commented-code": "^1.0.10",
        "eslint-plugin-unicorn": "^55.0.0",
        "typescript": "^5.9.2",
        "typescript-eslint": "^8.40.0"
        ...
    }
    ```

3. (**optional**) **Add npm scripts** to your `package.json`:
    ```json
    "scripts": {
        ...
        "lint": "eslint . --ext .js,.ts,.jsx,.tsx",
        "lint:fix": "eslint . --ext .js,.ts,.jsx,.tsx --fix"
        ...
    }
    ```

4. **Install pre-commit** (if not already installed):

    This project uses [pre-commit](https://pre-commit.com/) to run linting and formatting checks before each commit.

    ```powershell
    pip install pre-commit
    pre-commit install
    ```

5. **Update file paths** in `tsconfig.json` to match your project structure, especially the `paths` section.

6. **Customize ignore patterns** in `eslint.config.mjs` to match your project's folder structure (update the `ignores` array).

### Usage

After setup, you can:
- Run linting: `npm run lint`
- Auto-fix issues: `npm run lint:fix`
- Pre-commit hooks will automatically run on each commit

### Manual Execution

To run pre-commit checks manually on all files:

```powershell
# Run pre-commit in terminal
./.venv/Scripts/pre-commit.exe

# Run linter
npm run lint

# Run unit-test
npm run test
```

### Included

- **trailing-whitespace**: Removes trailing whitespace
- **end-of-file-fixer**: Ensures files end with a newline
- **check-yaml**: Validates YAML files
- **check-json**: Validates JSON files
- **check-merge-conflict**: Checks for merge conflict markers
- **check-added-large-files**: Prevents large files from being committed
- **mixed-line-ending**: Fixes mixed line endings
- **eslint**: Runs ESLint with auto-fix for TypeScript/JavaScript files
- **tsc**: TypeScript type checking
