import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useApi from "../useApi";
import TokenService from "../token/tokenService";

// Get sponsor details by reference code (public - no auth required)
export const useGetSponsorByRef = (refCode: string) => {
  return useQuery({
    queryKey: ["sponsor", refCode],
    queryFn: async () => {
      // Try to get as agent first, then as member
      try {
        const agentResponse: any = await useApi("GET", `/auth/get-sponsor/${refCode}`);
        if (agentResponse.success) {
          return agentResponse;
        }
      } catch (error) {
        // Continue to try other options
      }
      throw new Error("Sponsor not found");
    },
    enabled: !!refCode && refCode.length > 0,
    retry: false,
  });
};

// Public registration mutation - uses existing /auth/signup endpoint
export const usePublicRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      emailid?: string;
      password?: string;
      contactno: string;
      pincode?: string;
      gender?: string;
      introducer: string;
      introducer_name?: string;
      address?: string;
      father_name?: string;
      dob?: string;
      pan_no?: string;
      aadharcard_no?: string;
    }) => {
      return await useApi("POST", "/auth/signup", data);
    },
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success(response.message || "Registration successful!");
      } else {
        toast.error(response.message || "Registration failed");
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export const useLoginMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await useApi("POST", "/auth/login", data);
    },
    onSuccess: (response: any) => {
      if (response.success && response.token) {
        TokenService.setToken(response.token)

        window.dispatchEvent(new Event("storage"));

        toast.success(response.message);
        const role = TokenService.getRole()
        if (role === "USER") {
          navigate("/user/dashboard", { replace: true });
        } else if (role === "ADMIN") {
          navigate("/admin/dashboard", { replace: true });
        } else if (role === "AGENT") {
          navigate("/agent/dashboard", { replace: true });
        } else {
          console.error("Invalid role:", role);
          localStorage.clear()
          toast.error("Invalid user role");
        }
      } else {
        console.error("Login failed:", response.message);
        toast.error(response.message);
      }
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    },
  });
};
