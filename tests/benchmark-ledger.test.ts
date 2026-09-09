import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { benchmarkLedgers, inputSignature } from '../src/data/benchmark-ledger'
import { importedRuns } from '../src/data/benchmark-imports'

test('history groups only matching inputs and keeps undated comparisons separate', () => {
  const astral = benchmarkLedgers.find(ledger => ledger.comparison.preset === 'bion_lfq_astral')!
  const oe480 = benchmarkLedgers.find(ledger => ledger.comparison.preset === 'bion_lfq_oe480')!
  assert.equal(astral.rows.length, 23)
  assert.equal(oe480.rows.length, 1)
  assert.equal(astral.rows[0].date, '2026-09-07')
  assert.equal(astral.rows.at(-1)?.date, null)
  assert.deepEqual(oe480.rows[0].counts, [81559, 108447, 104099])
  for (const row of astral.rows.filter(row => row.date !== null)) assert.deepEqual(row.counts.slice(1), [null, null])
  assert.notEqual(inputSignature(astral.files), inputSignature(oe480.files))
  assert.equal(inputSignature(['B.raw', 'A.raw']), inputSignature(['A', 'B']))
})

test('completed ClearML imports have unique sources and are ordered by start time', () => {
  assert.equal(new Set(importedRuns.map(run => run.taskId)).size, 3)
  const astral = benchmarkLedgers.find(ledger => ledger.comparison.preset === 'bion_lfq_astral')!
  assert.deepEqual(astral.rows.slice(0, 4).map(row => row.commit), ['b4de5599', '34879e5b', '5d12a532', '9897b894'])
  assert.deepEqual(astral.rows.slice(0, 4).map(row => row.counts[0]), [259474, 275106, 252078, 261436])
  for (const run of importedRuns) {
    assert.equal(run.status, 'Completed')
    assert.equal(run.files.length, 6)
    assert.equal(new Set(run.files).size, 6)
    assert.equal(inputSignature(run.files), inputSignature(astral.files))
    assert.ok(run.runtimeMinutes > 0)
    assert.ok(run.totalPrecursors > run.totalProteins)
    assert.ok(astral.rows.some(row => row.sourceSlug === run.slug))
  }
})

test('only a verified exact-task figure is attached to imported runs', () => {
  const withFigure = importedRuns.filter(run => run.figure !== null)
  assert.equal(withFigure.length, 1)
  assert.equal(withFigure[0].taskId, '797be92685ea4868b48bd0ed9174b90a')
  assert.equal(withFigure[0].totalPrecursors, 261436)
  const image = readFileSync(new URL(`../public/images/benchmarks/${withFigure[0].figure}`, import.meta.url))
  assert.equal(image.subarray(0, 3).toString('hex'), 'ffd8ff')
})
