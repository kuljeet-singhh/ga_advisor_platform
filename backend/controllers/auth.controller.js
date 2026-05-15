export function googleCallbackPlaceholder(_req, res) {
  res.status(501).json({ error: "OAuth callback not implemented yet" });
}

export function me(req, res) {
  res.json({ userId: req.userId, email: req.authEmail ?? null });
}
