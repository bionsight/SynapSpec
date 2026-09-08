import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { benchmarkLedgers, inputSignature } from '../src/data/benchmark-ledger'

test('history groups only matching inputs and keeps undated comparisons separate', () => {
  const astral = benchmarkLedgers.find(ledger => ledger.comparison.preset === 'bion_lfq_astral')!
  const oe480 = benchmarkLedgers.find(ledger => ledger.comparison.preset === 'bion_lfq_oe480')!
  assert.equal(astral.rows.length, 20)
  assert.equal(oe480.rows.length, 1)
  assert.equal(astral.rows[0].date, '2026-09-07')
  assert.equal(astral.rows.at(-1)?.date, null)
  assert.deepEqual(oe480.rows[0].counts, [81559, 108447, 104099])
  for (const row of astral.rows.filter(row => row.date !== null)) assert.deepEqual(row.counts.slice(1), [null, null])
  assert.notEqual(inputSignature(astral.files), inputSignature(oe480.files))
  assert.equal(inputSignature(['B.raw', 'A.raw']), inputSignature(['A', 'B']))
})
