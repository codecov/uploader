import type { ValidateFunction } from "ajv";

import { default as Ajv } from "ajv";

import type { RepositoryYAML } from "../../types.js";

import * as schema from "./schema.json";

const ajv = new Ajv();

export const validate: ValidateFunction<RepositoryYAML> = ajv.compile(schema);
