import { jwtDecode } from "jwt-decode";

class TokenService {
  static setToken(token: string, persist: boolean = true): void {
    sessionStorage.setItem("token", token);
    if (persist) {
      localStorage.setItem("token", token);
    }
    window.dispatchEvent(new Event("token-change"));
  }

  static getToken(): string | null {
    return sessionStorage.getItem("token") || localStorage.getItem("token");
  }

  static decodeToken(): { id: string; role: string, memberId?: string, userId?: string, user_name?: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<{ id: string; role: string; memberId?: string, userId?: string, user_name?: string }>(token);

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
    return this.decodeToken()?.memberId || this.decodeToken()?.userId || null;
  }

  static getUserId(): string | null {
    return this.decodeToken()?.id || null;
  }

  static getUserName(): string | null {
    return this.decodeToken()?.user_name || null;
  }

  static getBranchCode(): string | null {
    return 'BRN001';
  }

  static removeToken(): void {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("token-change"));
  }
}

export default TokenService;
