import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { catalogDestination, datasetCatalog, filterDatasets, ratioMeasurements, recordedRun, relativeMedianDeviation } from '../src/data/benchmark-catalog'
import { benchmarks, latestBenchmarkRun } from '../src/data/benchmarks'

test('catalog distinguishes imported results from existing presets', () => {
  assert.equal(filterDatasets(false).length, 3)
  assert.equal(filterDatasets(true).length, 1)
  assert.equal(filterDatasets(true)[0].run, recordedRun)
  assert.equal(new Set(datasetCatalog.map(catalogDestination)).size, datasetCatalog.length)
  for (const dataset of datasetCatalog.filter((item) => item.run === null)) {
    assert.equal(catalogDestination(dataset), dataset.slug)
    assert.equal(dataset.commit, null)
    assert.equal(dataset.keyConfig, null)
  }
})

test('new evidence does not mutate the archive or home-page example', () => {
  assert.equal(benchmarks.runs.length, 18)
  assert.equal(latestBenchmarkRun.date, '2026-07-22')
  assert.equal(benchmarks.runs.some((run) => run.slug === recordedRun.slug), false)
  assert.equal(recordedRun.files.length, 6)
  assert.equal(recordedRun.total_precursors, 252078)
  assert.notEqual(recordedRun.files.reduce((sum, file) => sum + file.precursors, 0), recordedRun.total_precursors)
})

test('ratios use A/B and quartiles, not a synthetic accuracy rate', () => {
  assert.deepEqual(ratioMeasurements.map((item) => 2 ** item.target), [1, 2, 0.25])
  assert.deepEqual(ratioMeasurements.map((item) => Number(relativeMedianDeviation(item.median, item.target).toFixed(1))), [-3, -5, 5.1])
  for (const item of ratioMeasurements) assert.ok(item.lower < item.median && item.median < item.upper)
})
