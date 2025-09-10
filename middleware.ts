export { default } from "next-auth/middleware"

// Exclude the NextAuth auth routes from middleware checks
export const config = {
  matcher: [
    "/dashboard/:path*",
    // Protect all API routes except the auth endpoints
    "/api/((?!auth).*)",
  ],
}
