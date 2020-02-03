Adding a new CI provider
=========================

1. View https://github.com/codecov/uploader/blob/master/src/ci_providers/provider_example.js
2. Collect the needed enviromental variables for each section (you can use provider_circleci.js if you get confused)
3. Copy provider_example.js and fill it in.
4. Add your new providers list in https://github.com/codecov/uploader/blob/master/src/ci_providers/index.js
5. Open a PR and we'll take a look!
