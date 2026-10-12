import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/invitations/cron") {
    const secret = process.env.CRON_SECRET;
    return secret && request.headers.get("authorization") === `Bearer ${secret}`
      ? NextResponse.next() : new NextResponse("No autorizado", { status: 401 });
  }
  if (!(request.nextUrl.pathname.startsWith("/crm") || request.nextUrl.pathname.startsWith("/api/"))) {
    return NextResponse.next();
  }

  const user = process.env.CRM_USER;
  const password = process.env.CRM_PASSWORD;

  if (!user || !password) {
    return new NextResponse("CRM no configurado", { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separator = decoded.indexOf(":");
      const suppliedUser = decoded.slice(0, separator);
      const suppliedPassword = decoded.slice(separator + 1);

      if (suppliedUser === user && suppliedPassword === password) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Acceso protegido", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="TalentoBrücke CRM"'
    }
  });
}

export const config = {
  matcher: ["/crm/:path*", "/api/email", "/api/activities", "/api/follow-ups", "/api/candidates/:path*", "/api/invitations/:path*"]
};
