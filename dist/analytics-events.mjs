// This bridge is present only in online builds; offline pages have no collector.
export function trackEvent(name, properties = {}) {
  try { globalThis.personaAnalytics?.capture(name, properties); } catch {}
}
export function completedTestProperties(result) {
  return {
    type: result.code, variant: result.variant,
    // Each percentage is the winning pole's strength, matching the report.
    ...Object.fromEntries(['ei', 'ns', 'tf', 'jp', 'at'].map((axis, i) => [axis, result.dimensions[i].pct])),
  };
}
