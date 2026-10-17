import { readFileSync } from 'node:fs';

for (const path of process.argv.slice(2)) {
  const report = JSON.parse(readFileSync(path, 'utf8'));
  const requests = report.audits['network-requests'].details.items;
  const sum = (filter, field = 'resourceSize') => requests.filter(filter).reduce((total, item) => total + (item[field] ?? 0), 0);
  console.log(JSON.stringify({
    path, lighthouse: report.lighthouseVersion, date: report.fetchTime,
    host: report.environment.hostUserAgent, benchmarkIndex: report.environment.benchmarkIndex,
    score: Math.round(report.categories.performance.score * 100),
    lcpMs: report.audits['largest-contentful-paint'].numericValue,
    tbtMs: report.audits['total-blocking-time'].numericValue,
    cls: report.audits['cumulative-layout-shift'].numericValue,
    fcpMs: report.audits['first-contentful-paint'].numericValue,
    jsBytes: sum((item) => item.mimeType?.includes('javascript')),
    imageBytes: sum((item) => item.mimeType?.startsWith('image/')),
    fontBytes: sum((item) => item.mimeType?.startsWith('font/')),
    transferredBytes: sum(() => true, 'transferSize'),
    requestCount: requests.length,
    failedRequests: requests.filter((item) => item.failed).map((item) => item.url),
    warnings: report.runWarnings,
  }, null, 2));
}
