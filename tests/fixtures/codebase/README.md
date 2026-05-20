# contextmeter Test Codebase

This is a sample codebase used by contextmeter for testing and demonstration.

## Files Included

- `simple.ts` - A basic user service with CRUD operations
- `auth.ts` - Authentication service with login/logout
- `config.ts` - Application configuration module

## Purpose

These files serve as test fixtures for:
- Token counting accuracy
- Content analysis (redundancy detection)
- Overflow simulation

## Notes

Some files share duplicate interfaces (`CreateUserData`, `User`) to test
the duplicate detection functionality of the analyzer.

This is intentionally small and focused - it represents the kind of
codebase that would typically be injected into an LLM context window
as part of an agentic workflow.
