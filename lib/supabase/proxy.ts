import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured || !supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      }
    }
  });

  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isAdminArea = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isCommunityArea = pathname.startsWith("/community");
  const isCommunityLogin = pathname === "/community/login";

  if ((isAdminArea && !isAdminLogin || isCommunityArea && !isCommunityLogin) && !data.user) {
    const url = request.nextUrl.clone();
    url.pathname = isAdminArea ? "/admin/login" : "/community/login";
    return NextResponse.redirect(url);
  }

  if (!data.user) return response;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (isAdminArea && !isAdminLogin && profile?.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/community";
    return NextResponse.redirect(url);
  }

  if (isAdminLogin) {
    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/community";
    return NextResponse.redirect(url);
  }

  if (isCommunityLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/community";
    return NextResponse.redirect(url);
  }

  return response;
}
