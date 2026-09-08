import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { comparisonRecords } from '../src/data/benchmark-comparisons'

test('archived comparisons contain matched inputs and honest missing metadata', () => {
  assert.equal(comparisonRecords.length, 2)
  for (const record of comparisonRecords) {
    assert.equal(record.files.length, 6)
    assert.equal(record.tools.length, 3)
    assert.equal(record.release, null)
    assert.equal(record.analysis_date, null)
    assert.equal(record.runtime_hours, null)
    assert.equal(record.resource, null)
    for (const tool of record.tools) {
      assert.deepEqual(tool.files.map(file => file.name), record.files)
      assert.ok(tool.precursors > 0)
      assert.ok(tool.complete_six <= tool.precursors)
      assert.ok(Math.abs(tool.complete_six_percent - tool.complete_six / tool.precursors * 100) < 1e-10)
      for (const ratio of tool.ratios) {
        assert.ok(ratio.lower <= ratio.median && ratio.median <= ratio.upper)
        assert.ok(ratio.count <= tool.precursors)
      }
    }
  }
})

test('public comparisons have no private server paths', () => {
  assert.equal(/\/export\/|\/home\/|192\.168\.|bionsight\.internal/.test(JSON.stringify(comparisonRecords)), false)
})

test('source figures are real PNGs', () => {
  for (const record of comparisonRecords) {
    const bytes = readFileSync(`public/images/benchmarks/${record.figure}`)
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  }
})
