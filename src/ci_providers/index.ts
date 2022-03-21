import { IProvider } from '../types'

import * as providerAppveyorci from './provider_appveyorci'
import * as providerAzurepipelines from './provider_azurepipelines'
import * as providerBitbucket from './provider_bitbucket'
import * as providerBitrise from './provider_bitrise'
import * as providerBuildkite from './provider_buildkite'
import * as providerCircleci from './provider_circleci'
import * as providerCirrus from './provider_cirrus'
import * as providerCodeBuild from './provider_codebuild'
import * as providerDrone from './provider_drone'
import * as providerGitHubactions from './provider_githubactions'
import * as providerGitLabci from './provider_gitlabci'
import * as providerHerokuci from './provider_herokuci'
import * as providerJenkinsci from './provider_jenkinsci'
import * as providerLocal from './provider_local'
import * as providerTeamCity from './provider_teamcity'
import * as providerTravisci from './provider_travisci'
import * as providerWercker from './provider_wercker'
import * as providerWoodpecker from './provider_woodpecker'

// Please make sure provider_local is last
const providerList: IProvider[] = [
  providerAppveyorci,
  providerAzurepipelines,
  providerBitbucket,
  providerBitrise,
  providerBuildkite,
  providerCircleci,
  providerCirrus,
  providerCodeBuild,
  providerDrone,
  providerGitHubactions,
  providerGitLabci,
  providerHerokuci,
  providerJenkinsci,
  providerTeamCity,
  providerTravisci,
  providerWercker,
  providerWoodpecker,
  providerLocal,
]

export default providerList
