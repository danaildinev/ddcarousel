# Contributing

Contributions are welcome! Bug reports, improvements, documentation updates, tests, and new ideas are appreciated.

> **Note:** Please follow these guidelines when contributing to DDCarousel. Some steps may not apply to every type of contribution, but following the relevant instructions helps keep the project consistent and makes it easier for me and other maintainers or contributors to review changes, reproduce bugs, fix issues, and continue developing the project.
>
> Thank you in advance for taking the time to follow these guidelines and, most importantly, for choosing to contribute to the project. Any help, whether it is a bug report, documentation improvement, test, fix, or new feature, is greatly appreciated :)


## Getting started

1. Fork the repository
2. Clone your fork
3. Install dependencies
4. Create a new branch for your changes

## Development

Start the development server:

```bash
npm run build:dev
```

The development build uses the `src/testing` directory as a local testing environment and outputs the development ESM module and CSS there. You can create your own `index.html` inside `src/testing` to test carousel behavior directly in the browser.

## Testing

Run TypeScript type checking:

```bash
npm run type-check
```

Run the test suite:

```bash
npm test
```

Please add or update tests when changing carousel behavior, modules, events, responsive handling, or other functionality covered by the test suite.

## Building

Create the complete production build:

```bash
npm run build:all
```

Production files are generated in the `dist` directory.

## Code changes

When contributing code:

- Follow the existing TypeScript code style and project structure
- Keep the core lightweight and dependency-free
- Avoid unnecessary breaking changes and preserve type safety for public APIs
- Add comments only where they help explain non-obvious functionality
- Add or update tests for behavior changes
- Update the README and CHANGELOG when relevant

Larger changes, new features, or architectural changes should be discussed in an issue before implementation.

## Commit messages

The project follows [Conventional Commits](https://www.conventionalcommits.org/) where appropriate.

Keep commit messages short and descriptive. I do my best to keep commit messages clear and consistent, although finding the perfect wording is not always easy. They may not always be perfect, but they should still describe the change as clearly as possible.

## Pull requests

Before opening a pull request:

1. Run TypeScript type checking
2. Run the test suite
3. Make sure the project builds successfully
4. Update relevant documentation
5. Keep the pull request focused on a single feature or a fix

Please include a clear title and description of what was changed and why.

If the pull request is related to an existing issue, make sure to reference it in the description. Use a [GitHub closing keyword](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) such as Fixes #7 when the pull request should automatically close the issue after merging.

## Reporting bugs

When reporting a bug, include as much relevant information as possible:

- Carousel version
- Browser name and version
- Carousel configuration or `getStatus()` output
- Expected and actual behavior
- Reproduction example, if available (HTML structure, screenshot, short video...)

Make sure to check for the same or similar issue, before opening a new one.

## Feature requests

Feature suggestions are welcome. Please create an issue and describe the use case and why the feature would be useful.

New features should fit the project's goals of remaining lightweight, modular, dependency-free, and suitable for the modern web.

## Project maintenance

DDCarousel started as a hobby project that I started coding in my free time as an experiment to create my own simple carousel script for navigating between pages. 

Later, I open-sourced it and published it on GitHub as a side project that I wanted to keep developing. It became a way for me to challenge myself, improve my skills, and work on a type of project and idea I had not worked on before. 

Building v2.0 was the perfect opportunity to revive the project, remove legacy code and outdated browser support, rebuild it on a modern codebase, and apply modern technologies and everything I had learned since the original version while working on this type of project.

Development may not always follow a fixed schedule. It usually happens when I have time to work on it, when I need specific functionality myself, or when users report bugs or request useful features.

However, I intend to continue supporting the project, fixing issues, improving existing functionality, and adding new features in the future.

Contributions, bug reports, and feature suggestions are always welcome.

## License

By contributing to DDCarousel, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
