import { useQuery } from "@tanstack/react-query";
import useApi from "../useApi";
import { GetTransactionsResponse } from "../../types/Transaction";

// User transaction hook (for USER role)
export const useGetUserTransactions = (memberId: string, accountType?: string) => {
    return useQuery<GetTransactionsResponse>({
        queryKey: ["user-transactions", memberId, accountType],
        queryFn: async () => {
            const params = accountType ? `?account_type=${accountType}` : '';
            return await useApi<GetTransactionsResponse>(
                "GET",
                `/user/get-user-transactions/${memberId}${params}`
            );
        },
        enabled: !!memberId,
        retry: 2
    });
};

// Member transaction hook (for USER role - member flow)
export const useGetMemberTransactions = (memberId: string, accountType?: string) => {
    return useQuery<GetTransactionsResponse>({
        queryKey: ["member-transactions", memberId, accountType],
        queryFn: async () => {
            const params = accountType ? `?account_type=${accountType}` : '';
            return await useApi<GetTransactionsResponse>(
                "GET",
                `/member/transactions/${memberId}${params}`
            );
        },
        enabled: !!memberId,
        retry: 2
    });
};

// Admin transaction hook (for ADMIN role)
export const useGetAdminTransactions = (memberId: string, accountType?: string) => {
    return useQuery<GetTransactionsResponse>({
        queryKey: ["admin-transactions", memberId, accountType],
        queryFn: async () => {
            const params = accountType ? `?account_type=${accountType}` : '';
            return await useApi<GetTransactionsResponse>(
                "GET",
                `/admin/accounts/transactions/${memberId}${params}`
            );
        },
        enabled: !!memberId,
        retry: 2
    });
};
