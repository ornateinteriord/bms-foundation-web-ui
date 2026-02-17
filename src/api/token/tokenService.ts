import { jwtDecode } from "jwt-decode";


class TokenService {
  static setToken(token: string): void {
    sessionStorage.setItem("token", token);
    window.dispatchEvent(new Event("token-change"));
  }

  static getToken(): string | null {
    return sessionStorage.getItem("token");
  }

  static decodeToken(): { id: string; role: string; memberId: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<{ id: string; role: string; memberId: string }>(token);

      return decoded;
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  }

  static getRole(): string | null {
    return this.decodeToken()?.role || null;
  }

  static getMemberId(): string | null {
    return this.decodeToken()?.memberId || null;
  }

  static getUserId(): string | null {
    return this.decodeToken()?.id || null;
  }

  static removeToken(): void {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token"); // Cleanup legacy/fallback
    window.dispatchEvent(new Event("token-change"));
  }
}

export default TokenService;
