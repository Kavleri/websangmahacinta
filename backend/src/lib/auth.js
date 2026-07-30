// Auth helper for verifying authorization tokens
// Tokens are generated during login in admin/login and staff/login routes

/**
 * Extracts and validates the auth token from the request.
 * Returns { valid: boolean, role: string|null, username: string|null }
 * 
 * Token format: dutaquran_admin_token_<base64> or dutaquran_staff_token_<base64>
 */
export function verifyAuthToken(request) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, role: null, username: null };
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (token.startsWith("dutaquran_admin_token_")) {
    // Decode the base64 payload to extract username
    try {
      const payload = token.replace("dutaquran_admin_token_", "");
      const decoded = Buffer.from(payload, "base64").toString("utf-8");
      const username = decoded.split(":")[0] || "admin";
      return { valid: true, role: "admin", username };
    } catch {
      return { valid: true, role: "admin", username: "admin" };
    }
  }

  if (token.startsWith("dutaquran_staff_token_")) {
    try {
      const payload = token.replace("dutaquran_staff_token_", "");
      const decoded = Buffer.from(payload, "base64").toString("utf-8");
      const username = decoded.split(":")[0] || "staff";
      return { valid: true, role: "staff", username };
    } catch {
      return { valid: true, role: "staff", username: "staff" };
    }
  }

  return { valid: false, role: null, username: null };
}

/**
 * Require admin-level auth. Returns NextResponse error if unauthorized, or null if OK.
 */
export function requireAdmin(request, NextResponse) {
  const auth = verifyAuthToken(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: "Akses ditolak! Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }
  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Akses ditolak! Hanya admin yang dapat mengakses fitur ini." },
      { status: 403 }
    );
  }
  return null; // authorized
}

/**
 * Require admin OR staff auth. Returns NextResponse error if unauthorized, or null if OK.
 */
export function requireAdminOrStaff(request, NextResponse) {
  const auth = verifyAuthToken(request);
  if (!auth.valid) {
    return NextResponse.json(
      { error: "Akses ditolak! Silakan login terlebih dahulu." },
      { status: 401 }
    );
  }
  if (auth.role !== "admin" && auth.role !== "staff") {
    return NextResponse.json(
      { error: "Akses ditolak! Hanya admin atau staff yang dapat mengakses fitur ini." },
      { status: 403 }
    );
  }
  return null; // authorized
}
