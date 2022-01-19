# Adding a new CI provider

1. View https://github.com/codecov/uploader/blob/master/src/ci_providers/provider_template.ts
2. Collect the needed enviromental variables for each section (you can use provider_circleci.ts as an example if you get confused)
3. Copy provider_template.ts and fill it in.
4. Add your new providers list in https://github.com/codecov/uploader/blob/master/src/ci_providers/index.ts
5. Copy test/providers/provider_template.test.js and fill it in.
6. Ensure 100% code coverage on the new provider code.
7. Open a PR and we'll take a look!
