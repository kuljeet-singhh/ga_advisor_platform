export type SnapshotMeta = {
  id: string;
  fetchedAt: string;
  dateRangeStart: string;
  dateRangeEnd: string;
};

export type LatestSnapshotResponse = {
  snapshot: SnapshotMeta;
  columns: string[];
  rows: Record<string, string | number>[];
  rowCount: number;
};
