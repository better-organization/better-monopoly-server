# Contributing to Better Monopoly Server

Thank you for contributing to the Better Monopoly Server project! This document provides guidelines and best practices for contributing.

## Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Follow TDD Approach**
   - Write tests first
   - Implement the feature
   - Refactor if needed
   - Ensure all tests pass

3. **Code Standards**
   - Follow TypeScript best practices
   - Use ESLint and Prettier configurations
   - Maintain 95% code coverage
   - Write meaningful commit messages

4. **Commit Convention**
   ```
   type(scope): subject

   body (optional)

   footer (optional)
   ```

   Types: feat, fix, docs, style, refactor, test, chore

   Example:
   ```
   feat(auth): add user login endpoint

   Implemented user login with username validation
   Added unit and integration tests
   Updated API documentation

   Closes #123
   ```

5. **Submit Pull Request**
   - Push your branch to remote
   - Create PR to `develop` branch
   - Fill out PR template
   - Request review from team members

## Code Review Process

- All PRs require at least one approval
- CI/CD pipeline must pass
- Code coverage must meet thresholds
- No merge conflicts

## Testing Guidelines

- Write tests for all new features
- Maintain existing test coverage
- Use descriptive test names
- Test edge cases and error scenarios

## Questions?

Contact the team at developers@monopoly.com
