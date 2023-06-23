# Maintainer Documentation

## Commiting

This repository follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec for commit messages.

There is a husky commit message hook that will fail if your message does not follow this format.

Please note that `ci:` and `chore:` messages do not get added to the change log currently.

## Release Process

Thanks to the conventional commit spec being used in messages, releasing is easy. There are three steps.

1. Run `npm run release`. This will kick off [standard-version](https://github.com/conventional-changelog/standard-version) which will analyse all commits since the last tag. It will then bump the version in package.json acordingly (major, minor, patch) and tag a new commit tha updates CHANGELOG.md.

2. Push your changes, making sure your command includes the `--follow-tags` flag.

3. After merging from your branch to master, create a new PR from master into the ptoduction branch. This will deploy to both GitHub and uploader.codecov.io once merged.
