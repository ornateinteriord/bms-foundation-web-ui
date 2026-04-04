import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "../Api"; // Assuming standard Axios wrappers
import { toast } from "react-toastify";

// Fetch all Add On requests (Admin)
export const useGetAddOnRequests = () => {
  return useQuery({
    queryKey: ["addon-requests"],
    queryFn: async () => {
      const response = await get("/api/packages/addon/requests");
      if (!response.success) throw new Error(response.message);
      return response.requests;
    },
  });
};

// Fetch approved Add On packages for a specific member (User Dashboard)
export const useGetMemberAddOns = (member_id: string | undefined) => {
  return useQuery({
    queryKey: ["member-addons", member_id],
    queryFn: async () => {
      const response = await get(`/api/packages/addon/member/${member_id}`);
      return response.addons || [];
    },
    enabled: !!member_id,
  });
};

// Create an Add On Request (User)
export const useRequestAddOnMutation = () => {
  return useMutation({
    mutationFn: async (data: { member_id: string; requested_amount: number }) => {
      return await post("/api/packages/addon/request", data);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error submitting request");
    },
  });
};

// Evaluate the Request (Admin)
export const useEvaluateAddOnMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { request_id: string; status: "APPROVED" | "REJECTED"; admin_id?: string }) => {
      return await put(`/api/packages/addon/requests/${data.request_id}/evaluate`, {
        status: data.status,
        admin_id: data.admin_id
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["addon-requests"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error evaluating request");
    },
  });
};

// Fetch predefined Add-On Packages
export const useGetPackages = () => {
  return useQuery({
    queryKey: ["addon-packages"],
    queryFn: async () => {
      const response = await get("/api/packages/addon/list");
      return response.packages || [];
    },
  });
};

// Create a new predefined Add-On Package
export const useCreatePackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; cost: number; days_count: number; daily_percent: number }) => {
      return await post("/api/packages/addon/create", data);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Package created");
        queryClient.invalidateQueries({ queryKey: ["addon-packages"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error creating package");
    },
  });
};

// Assign a package directly to a member
export const useAssignPackageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { member_id: string; package_id: string; amount_paid: number }) => {
      return await post("/api/packages/addon/assign", data);
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Package assigned");
        queryClient.invalidateQueries({ queryKey: ["addon-packages"] });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Error assigning package");
    },
  });
};
