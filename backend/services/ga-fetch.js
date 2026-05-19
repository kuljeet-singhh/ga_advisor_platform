import { getValidAccessToken, refreshAccessToken, getAccessTokenFromConnection } from "./token.service.js";

export async function gaFetchWithConnection(url, init, connection) {
  let row = connection;
  let accessToken = row.refresh_token_encrypted
    ? await getValidAccessToken(row)
    : getAccessTokenFromConnection(row);

  const doFetch = (token) =>
    fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401 && row.refresh_token_encrypted) {
    row = await refreshAccessToken(row);
    accessToken = getAccessTokenFromConnection(row);
    res = await doFetch(accessToken);
    if (res.status === 401) {
      const err = new Error(
        "Google API rejected the request after token refresh. Reconnect your GA property or sign in again."
      );
      err.status = 401;
      throw err;
    }
  }

  return res;
}
