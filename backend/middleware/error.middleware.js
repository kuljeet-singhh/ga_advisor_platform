export function errorMiddleware(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && status >= 500
      ? "Internal server error"
      : err.message || "Internal server error";
  console.error(err);
  res.status(status).json({ error: message });
}
