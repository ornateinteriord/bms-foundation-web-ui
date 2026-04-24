// withdrawal.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";

export const useGetWithdrawalRequests = (status: string = 'All') => {
    return useQuery({
        queryKey: ["withdrawalRequests", status],
        queryFn: async () => {
            return await useApi<any>("GET", `/transaction/withdrawal-requests?status=${status}`);
        },
    });
};

export const useApproveWithdrawal = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            request_id: string;
            action: 'Pay' | 'Reject';
            transaction_id?: string;
            remarks?: string;
        }) => {
            return await useApi<any>("POST", "/transaction/approve-withdrawal", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["withdrawalRequests"] });
        },
    });
};
