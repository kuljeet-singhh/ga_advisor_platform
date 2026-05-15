export type RecommendationIssue = {
  page?: string;
  metric?: string;
  currentValue?: string;
  benchmark?: string;
  issue?: string;
  rootCause?: string;
  recommendation?: string;
  impact?: string;
  estimatedImprovement?: string;
};

export type GaConnection = {
  id: string;
  propertyId: string;
  propertyName: string;
  tokenExpiresAt?: string;
  connectedAt?: string;
};

export type LatestRecommendationsResponse = {
  recommendation: {
    id?: string;
    healthScore: number;
    summary: string;
    issues: RecommendationIssue[];
    generatedAt: string;
  };
  snapshot: { fetchedAt: string | null };
  mock?: boolean;
  connection?: GaConnection;
};

export type ConnectionResponse = {
  connection: GaConnection;
};
