import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { NotFoundError } from '../errors.mjs';
import resolveConfig from '../resolve.node.mjs';

chai.use(chaiAsPromised);
const { expect } = chai;

const cwd = join(fileURLToPath(import.meta.url), '../__fixtures__');

describe('Node config resolver', () => {
  it('given directory with a config, should read it', async () => {
    const output = await resolveConfig(join(cwd, './with-config/openapi.json'));
    expect(output.trim()).to.eq('{}');
  });

  it('given directory with a config, should throw an error ', async () => {
    await expect(
      resolveConfig(join(cwd, './with-no-config/openapi.json')),
    ).to.be.rejectedWith(NotFoundError);
  });
});
