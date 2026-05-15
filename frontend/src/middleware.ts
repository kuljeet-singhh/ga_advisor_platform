import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/select-property/:path*",
    "/issue/:path*",
    "/history/:path*",
    "/settings/:path*",
  ],
};
