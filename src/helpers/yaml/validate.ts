import { default as Ajv, ValidateFunction } from 'ajv'

import { RepositoryYAML } from '../../types'
import * as schema from './schema.json'

const ajv = new Ajv()

export const validate: ValidateFunction<RepositoryYAML> = ajv.compile(schema)
