import { describe, it, expect } from 'vitest';
import * as featureExports from '../index';

describe('admin-analytics feature exports', () => {
  it('exports AdminAnalyticsDashboard and chart components', () => {
    expect(featureExports.AdminAnalyticsDashboard).toBeDefined();
    expect(featureExports.CourseFunnelChart).toBeDefined();
    expect(featureExports.StreakDistributionChart).toBeDefined();
  });
});
