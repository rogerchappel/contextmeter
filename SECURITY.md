# Security Policy

## Supported Versions

`contextmeter` has not published a GitHub release or an npm package yet. The
`0.1.0` version in `package.json` and `CHANGELOG.md` describes the current
repository checkout; it is not a published release.

Security fixes are currently made against the latest commit on the `main`
branch. Older commits and copied checkouts are not maintained as separate
supported versions. This policy will be updated when the project begins
publishing versioned releases.

| Source state | Supported |
| --- | --- |
| Latest `main` branch checkout (`0.1.0`) | Yes |
| Older commits or copied checkouts | No |
| npm package or GitHub release | Not published |

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Use GitHub's private vulnerability reporting option on this repository when it
is available. Otherwise, ask the maintainers through a public project channel
to provide a private reporting path before sharing details.

Do not include exploit details, secrets, personal data, or sensitive technical
details in a public request.

## What to Include

When a private reporting path is available, include:

- A clear description of the issue.
- Affected versions, files, packages, workflows, or configuration.
- Steps to reproduce, proof of concept, or attack scenario when safe to share.
- Potential impact.
- Suggested mitigation, if known.

## Response Expectations

Maintainers review good-faith reports as capacity allows.

Do not imply paid support, guaranteed response times, guaranteed fixes, or service-level agreements unless `contextmeter` explicitly provides them.

## Scope

In scope:

- Vulnerabilities in contextmeter.
- Insecure default configuration shipped by this project.
- CI, release, or dependency guidance maintained by this project.

Out of scope:

- General support requests.
- Requests for guaranteed maintenance timelines.
- Issues in unrelated downstream projects.

## Disclosure

Coordinate disclosure with maintainers before publishing vulnerability details.
