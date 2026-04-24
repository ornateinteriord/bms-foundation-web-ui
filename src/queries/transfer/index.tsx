import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";
import {
    MemberBasicInfoResponse,
    AccountsPublicResponse,
    TransferRequest,
    TransferResponse
} from "../../types";

// Get member basic info by member_id (for recipient lookup)
export const useGetMemberBasicInfo = (memberId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ["memberBasicInfo", memberId],
        queryFn: async () => {
            return await useApi<MemberBasicInfoResponse>("GET", `/member/basic-info/${memberId}`);
        },
        enabled: enabled && !!memberId,
    });
};

// Get member's accounts without balances (for recipient account selection)
export const useGetMemberAccountsPublic = (memberId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ["memberAccountsPublic", memberId],
        queryFn: async () => {
            return await useApi<AccountsPublicResponse>("GET", `/member/accounts/${memberId}`);
        },
        enabled: enabled && !!memberId,
    });
};

// Transfer money mutation
export const useTransferMoney = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TransferRequest) => {
            return await useApi<TransferResponse>("POST", "/transaction/transfer-money", data);
        },
        onSuccess: () => {
            // Invalidate accounts to refresh balances
            queryClient.invalidateQueries({ queryKey: ["myAccounts"] });
        },
    });
};

// Withdraw request mutation
export const useWithdrawRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            member_id: string;
            account_id: string;
            account_no: string;
            account_type: string;
            amount: number;
            bank_account_number: string;
            ifsc_code: string;
            account_holder_name: string;
        }) => {
            return await useApi<{
                success: boolean;
                message: string;
                data: {
                    withdraw_request_id: string;
                    member_name: string;
                    account_no: string;
                    account_type: string;
                    amount: number;
                    bank_account_number: string;
                    ifsc_code: string;
                    account_holder_name: string;
                    status: string;
                    requested_date: string;
                };
            }>("POST", "/transaction/withdraw-request", data);
        },
        onSuccess: () => {
            // Invalidate accounts to refresh balances
            queryClient.invalidateQueries({ queryKey: ["myAccounts"] });
        },
    });
};

