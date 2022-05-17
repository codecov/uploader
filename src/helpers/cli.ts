export interface ICLIArgument {
  name: string
  alias: string
  type?: string
  default?: string | boolean
  description: string
}

const args: ICLIArgument[] = [
  {
    alias: 'B',
    name: 'branch',
    description: 'Specify the branch manually',
  },
  {
    alias: 'b',
    name: 'build',
    description: 'Specify the build number manually',
  },
  {
    alias: 'c',
    name: 'clean',
    type: 'boolean',
    default: false,
    description: 'Move discovered coverage reports to the trash',
  },
  {
    alias: 'C',
    name: 'sha',
    description: 'Specify the commit SHA mannually',
  },
  {
    alias: 'CL',
    name: 'changelog',
    description: 'Display a link for the current changelog'
  },
  {
    alias: 'd',
    name: 'dryRun',
    type: 'boolean',
    default: false,
    description: "Don't upload files to Codecov",
  },
  {
    alias: 'e',
    name: 'env',
    description: 'Specify environment variables to be included with this build.\nAlso accepting environment variables: CODECOV_ENV=VAR,VAR2',
  },
  {
    alias: 'f',
    name: 'file',
    description: 'Target file(s) to upload',
  },
  {
    alias: 'F',
    name: 'flags',
    default: '',
    description: 'Flag the upload to group coverage metrics',
  },
  {
    alias: 'g',
    name: 'gcov',
    type: 'boolean',
    default: false,
    description: 'Run with gcov support',
  },
  {
    alias: 'ga',
    name: 'gcovArgs',
    type: 'string',
    description: 'Extra arguments to pass to gcov',
  },
  {
    alias: 'gi',
    name: 'gcovIgnore',
    type: 'string',
    description: 'Paths to ignore during gcov gathering',
  },
  {
    alias: 'gI',
    name: 'gcovInclude',
    type: 'string',
    description: 'Paths to include during gcov gathering',
  },
  {
    alias: 'i',
    name: 'networkFiler',
    type: 'string',
    description: 'Specify a filter on the files listed in the network section of the Codecov report. Useful for upload-specific path fixing',
  },
  {
    alias: 'k',
    name: 'networkPrefix',
    type: 'string',
    description: 'Specify a prefix on files listed in the network section of the Codecov report. Useful to help resolve path fixing',
  },
  {
    alias: 'n',
    name: 'name',
    default: '',
    description: 'Custom defined name of the upload. Visible in Codecov UI',
  },
  {
    alias: 'N',
    name: 'parent',
    description: "The commit SHA of the parent for which you are uploading coverage. If not present, the parent will be determined using the API of your repository provider. When using the repository provider's API, the parent is determined via finding the closest ancestor to the commit.",
  },
  {
    alias: 'P',
    name: 'pr',
    description: 'Specify the pull request number mannually',
  },
  {
    alias: 'Q',
    name: 'source',
    type: 'string',
    default: '',
    description: `Used internally by Codecov, this argument helps track
      wrappers of the uploader (e.g. GitHub Action, CircleCI Orb)`,
  },
  {
    alias: 'R',
    name: 'rootDir',
    description: 'Specify the project root directory when not in a git repo',
  },
  {
    alias: 'r',
    name: 'slug',
    type: 'string',
    default: '',
    description: 'Specify the slug manually',
  },
  {
    alias: 's',
    name: 'dir',
    description: 'Directory to search for coverage reports.\nAlready searches project root and current working directory',
  },
  {
    alias: 'T',
    name: 'tag',
    default: '',
    description: 'Specify the git tag',
  },
  {
    alias: 't',
    name: 'token',
    default: '',
    description: 'Codecov upload token',
  },
  {
    alias: 'U',
    name: 'upstream',
    type: 'string',
    default: '',
    description: 'The upstream http proxy server to connect through',
  },
  {
    alias: 'u',
    name: 'url',
    type: 'string',
    description: 'Change the upload host (Enterprise use)',
    default: 'https://codecov.io',
  },
  {
    alias: 'v',
    name: 'verbose',
    type: 'boolean',
    description: 'Run with verbose logging',
  },
  {
    alias: 'X',
    name: 'feature',
    type: 'string',
    description: `Toggle functionalities. Separate multiple ones by comma: -X network,search
      -X network       Disable uploading the file network
      -X search        Disable searching for coverage files`,
  },
  {
    alias: 'xc',
    name: 'xcode',
    type: 'boolean',
    default: false,
    description: 'Run with xcode support',
  },
  {
    alias: 'xp',
    name: 'xcodeArchivePath',
    type: 'string',
    description: 'Specify the xcode archive path. Likely specified as the -resultBundlePath and should end in .xcresult',
  },
  {
    alias: 'Z',
    name: 'nonZero',
    type: 'boolean',
    default: false,
    description: 'Should errors exit with a non-zero (default: false)',
  },
]

export interface IYargsObject {
  option: (arg0: string, arg1: ICLIArgument) => void
}

export function addArguments(yargsInstance: IYargsObject): void {
  args.forEach(arg => {
    yargsInstance.option(arg.name, arg)
  })
}
