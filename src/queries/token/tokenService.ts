import { jwtDecode } from "jwt-decode";

class TokenService {
  static setToken(token: string): void {

    localStorage.setItem("token", token);
  }

  static getToken(): string | null {
    return localStorage.getItem("token");
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
    // For now, return a default branch code
    // In the future, this could be from user's profile or token
    return 'BRN001';
  }

  static removeToken(): void {
    localStorage.removeItem("token");
  }
}

export default TokenService;
