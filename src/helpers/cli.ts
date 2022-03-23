export interface ICLIArgument {
  name: string
  alias: string
  type: string
  default?: string | boolean
  description: string
}

const args: ICLIArgument[] = [
  {
    alias: 'CL',
    name: 'changelog',
    type: 'boolean',
    description: 'Display a link for the current changelog'
  },
  {
    alias: 'b',
    name: 'build',
    type: 'string',
    description: 'Specify the build number manually',
  },
  {
    alias: 'B',
    name: 'branch',
    type: 'string',
    description: 'Specify the branch manually',
  },
  {
    alias: 'e',
    name: 'env',
    type: 'string',
    description:
      'Specify environment variables to be included with this build.\nAlso accepting environment variables: CODECOV_ENV=VAR,VAR2',
  },
  {
    alias: 'C',
    name: 'sha',
    type: 'string',
    description: 'Specify the commit SHA mannually',
  },
  {
    alias: 'f',
    name: 'file',
    type: 'string',
    description: 'Target file(s) to upload',
  },
  {
    alias: 'F',
    name: 'flags',
    type: 'string',
    default: '',
    description: 'Flag the upload to group coverage metrics',
  },
  {
    alias: 'n',
    name: 'name',
    type: 'string',
    default: '',
    description: 'Custom defined name of the upload. Visible in Codecov UI',
  },
  {
    alias: 'N',
    name: 'parent',
    type: 'string',
    description:
      "The commit SHA of the parent for which you are uploading coverage. If not present, the parent will be determined using the API of your repository provider. When using the repository provider's API, the parent is determined via finding the closest ancestor to the commit.",
  },
  {
    alias: 'P',
    name: 'pr',
    type: 'string',
    description: 'Specify the pull request number mannually',
  },
  {
    alias: 's',
    name: 'dir',
    type: 'string',
    description:
      'Directory to search for coverage reports.\nAlready searches project root and current working directory',
  },
  {
    alias: 't',
    name: 'token',
    type: 'string',
    default: '',
    description: 'Codecov upload token',
  },
  {
    alias: 'T',
    name: 'tag',
    type: 'string',
    default: '',
    description: 'Specify the git tag',
  },
  {
    alias: 'v',
    name: 'verbose',
    type: 'boolean',
    description: 'Run with verbose logging',
  },
  {
    alias: 'R',
    name: 'rootDir',
    type: 'string',
    description: 'Specify the project root directory when not in a git repo',
  },
  {
    alias: 'Z',
    name: 'nonZero',
    type: 'boolean',
    default: false,
    description: 'Should errors exit with a non-zero (default: false)',
  },
  {
    alias: 'd',
    name: 'dryRun',
    type: 'boolean',
    default: false,
    description: "Don't upload files to Codecov",
  },
  {
    alias: 'r',
    name: 'slug',
    type: 'string',
    default: '',
    description: 'Specify the slug manually',
  },
  {
    alias: 'u',
    name: 'url',
    type: 'string',
    description: 'Change the upload host (Enterprise use)',
    default: 'https://codecov.io',
  },
  {
    alias: 'c',
    name: 'clean',
    type: 'boolean',
    default: false,
    description: 'Move discovered coverage reports to the trash',
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
    alias: 'X',
    name: 'feature',
    type: 'string',
    description: `Toggle functionalities. Separate multiple ones by comma: -X network,search
      -X network       Disable uploading the file network
      -X search        Disable searching for coverage files`,
  },
  {
    alias: 'U',
    name: 'upstream',
    type: 'string',
    default: '',
    description: 'The upstream http proxy server to connect through',
  },
  {
    alias: 'Q',
    name: 'source',
    type: 'string',
    default: '',
    description: `Used internally by Codecov, this argument helps track wrappers
      of the uploader (e.g. GitHub Action, CircleCI Orb)`,
  },
  {
    alias: 'g',
    name: 'gcov',
    type: 'boolean',
    default: false,
    description: 'Run with gcov support',
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
    alias: 'ga',
    name: 'gcovArgs',
    type: 'string',
    description: 'Extra arguments to pass to gcov',
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
