import { useState, useEffect } from "react";
import TokenService from "../api/token/tokenService";

const useAuth = () => {
  const [userRole, setUserRole] = useState<string | null>(TokenService.getRole());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!TokenService.getToken());

  useEffect(() => {
    const handleStorageChange = () => {
      const token = TokenService.getToken();
      setUserRole(TokenService.getRole());
      setIsLoggedIn(!!token);
    };

    // Update state on render
    handleStorageChange();

    // Custom event to handle token changes within the same tab (e.g. login/logout)
    window.addEventListener("token-change", handleStorageChange);
    return () => window.removeEventListener("token-change", handleStorageChange);
  }, []);

  return { isLoggedIn, userRole };
};

export default useAuth;
