import * as core from '@actions/core'

import { Inputs } from './constants'
import { getSecretsManagerClient, getSecretNamesToFetch, fetchAndInject } from './awsUtils'

// secretNames input string is a new line separated list of secret names. Take distinct secret names.
const inputSecretNames: string[] = [...new Set(core.getMultilineInput(Inputs.SECRETS))]

// Check if any secret name contains a wildcard '*'
const hasWildcard: boolean = inputSecretNames.some(secretName => secretName.includes('*'))

const shouldParseJSON = core.getBooleanInput(Inputs.PARSE_JSON)

const noPrefix = core.getBooleanInput(Inputs.NO_PREFIX)

const AWSConfig = {}

const secretsManagerClient = getSecretsManagerClient(AWSConfig)

if (hasWildcard) {
  core.debug('Found wildcard secret names')
  getSecretNamesToFetch(secretsManagerClient, inputSecretNames)
    .then(secretNamesToFetch => {
      fetchAndInject(secretsManagerClient, secretNamesToFetch, shouldParseJSON, noPrefix)
    })
    .catch(err => {
      core.setFailed(`Action failed with error: ${err}`)
    })
} else {
  fetchAndInject(secretsManagerClient, inputSecretNames, shouldParseJSON, noPrefix)
}
