import { QueryRunner } from '../queryRunner'
import { defaultDataProvider, defaultOptions, names } from './testData/_utils'
import { mishrasFactoryPrints } from './testData/mishrasFactory'
import { islandPrints } from './testData/island'

describe('new filter', function() {
  const corpus = [
    ...mishrasFactoryPrints,
    ...islandPrints
  ]
  const queryRunner = new QueryRunner({ corpus, defaultOptions, dataProvider: defaultDataProvider })
  it('should handle rarity filter', async function() {
    const result = (await queryRunner.search("new:rarity"))._unsafeUnwrap();
  });

  it('should handle flavor filter', async function() {
    const result = (await queryRunner.search("new:flavor"))._unsafeUnwrap();

    expect(result).toEqual([islandPrints[0]])
  });

  it('should handle art filter', async function() {
    const result = (await queryRunner.search("new:art"))._unsafeUnwrap();

    expect(result.length).toEqual(2)
  });

  it('should handle artist filter', async function() {
    const result = (await queryRunner.search("new:artist"))._unsafeUnwrap();

    expect(result.length).toEqual(2)

  });

  it('should handle frame filter', async function() {
    const result = (await queryRunner.search("new:frame"))._unsafeUnwrap();
  });

  it('should handle language filter', async function() {
    const result = (await queryRunner.search("new:language"))._unsafeUnwrap();

  });

  it('should handle game filter', async function() {
    const result = (await queryRunner.search("new:game"))._unsafeUnwrap();

  });

  it('should handle paper filter', async function() {
    const result = (await queryRunner.search("new:paper"))._unsafeUnwrap();
    // Test code for paper filter
  });

  it('should handle mtgo filter', async function() {
    const result = (await queryRunner.search("new:mtgo"))._unsafeUnwrap();

  });

  it('should handle arena filter', async function() {
    const result = (await queryRunner.search("new:arena"))._unsafeUnwrap();
  });

  it('should handle nonfoil filter', async function() {
    const result = (await queryRunner.search("new:nonfoil"))._unsafeUnwrap();
  });

  it('should handle foil filter', async function() {
    const result = (await queryRunner.search("new:foil"))._unsafeUnwrap();
  });
});