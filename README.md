# Codecov Uploader

[![CircleCI](https://circleci.com/gh/codecov/uploader.svg?style=shield&circle-token=def755bf76a1d8c36436c3115530c7eac7fa30e0)](https://circleci.com/gh/codecov/uploader) [![codecov](https://codecov.io/gh/codecov/uploader/branch/master/graph/badge.svg?token=X1gImxfIya)](https://codecov.io/gh/codecov/uploader)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcodecov%2Fuploader.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcodecov%2Fuploader?ref=badge_shield) [![Total alerts](https://img.shields.io/lgtm/alerts/g/codecov/uploader.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/codecov/uploader/alerts/)

> **!!! The project requires npm v7. You can check which version you have via `npm --version`. If you need to update it, run `npm install --global npm` (you should only need to do this once).**
>
> - The project requires Node.js v16
> - If `nvm` is installed, your `node` version should change to the development version the repository is set to automatically; `nvm` is by no means necessary, however
>
> 1. Run `npm install` once you get in the repository and after every branch change, etc.
>
> - `npm run test` to run the tests
> - `npm run build` to verify the source code can be built
>
> ---
>
> - `npm run build-linux` to generate the final binary for use on Linux
> - `npm run build-macos` to generate the final binary for use on macOS
> - `npm run build-windows` to generate the final binary for use on Windows

> Additionally, you can run the uploader without actually doing a full build via:
>
> - `npm run build` which generates the final JavaScript
> - `node dist/bin/codecov.js`

## Steps to develop

- `make clean`
- `make install`
- `make build`

Note: `make build` does not currently build the Windows binary until I confirm that a Windows binary build under Linux works. It also does not build the Alpine binary, as that needs to be build in an alpine container, using a static build of NodeJS. To build the Windows binary, run `npm run build-windows`

Binaries for Windows, MacOS, and Linux will be in the `out/` directory.

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fcodecov%2Fuploader.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fcodecov%2Fuploader?ref=badge_large)
.
