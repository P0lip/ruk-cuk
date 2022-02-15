import resolve from '#config/resolve';

import { assertValidDefinition, registerSchema } from '../validation/ajv.mjs';
import parse from './parse.mjs';

const DEFAULT_CONFIG = {
  namespacePrefix: '',
  skipEvents: false,
};

const SCHEMA = registerSchema({
  $id: 'ruk-cuk/config',
  $schema: 'http://json-schema.org/draft-07/schema#',
  additionalProperties: false,
  properties: {
    footer: {
      type: 'string',
    },
    header: {
      type: 'string',
    },
    namespacePrefix: {
      default: DEFAULT_CONFIG.namespacePrefix,
      type: 'string',
    },
    skipEvents: {
      default: DEFAULT_CONFIG.skipEvents,
      type: 'boolean',
    },
  },
  required: ['namespacePrefix', 'skipEvents'],
  type: 'object',
});

assertValidDefinition(DEFAULT_CONFIG, SCHEMA);

function pickActualOverrides(overrides) {
  for (const [key, value] of Object.entries(overrides)) {
    if (key in DEFAULT_CONFIG && DEFAULT_CONFIG[key] === value) {
      delete overrides[key];
    }
  }

  return overrides;
}

export default async (uri, overrides) => {
  let resolved;
  try {
    resolved = await resolve(uri);
  } catch {
    return {
      ...DEFAULT_CONFIG,
      ...overrides,
    };
  }

  const config = {
    ...DEFAULT_CONFIG,
    ...parse(resolved),
    ...pickActualOverrides({ ...overrides }),
  };

  assertValidDefinition(config, SCHEMA);
  return config;
};
