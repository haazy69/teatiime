import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // FIX: Added explicit type here to stop the Netlify build error
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value); // Update request cookies
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(name, value, options); // Update response cookies
          });
        },
      },
    }
  );

  // 3. Refresh session (Crucial for keeping the user logged in)
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Your custom Auth Logic
  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith("/auth") || path === "/";

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  
  if (user && (path === "/auth" || path === "/")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};