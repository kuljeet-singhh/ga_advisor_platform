function getPublicErrorMessage(err, status) {
  if (process.env.NODE_ENV === "production" && status >= 500) {
    return "Internal server error";
  }
  const code = err.code;
  if (code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "ETIMEDOUT") {
    return "Database unreachable. Check DATABASE_URL and that your Supabase project is active.";
  }
  return err.message || "Internal server error";
}

export function errorMiddleware(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = getPublicErrorMessage(err, status);
  console.error(err);
  res.status(status).json({ error: message });
}
