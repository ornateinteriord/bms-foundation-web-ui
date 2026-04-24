// commission.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "../useApi";

// Commission Withdrawal Request
export const useWithdrawCommission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            member_id: string;
            amount: number;
            bank_account_number: string;
            ifsc_code: string;
            account_holder_name: string;
        }) => {
            return await useApi<{
                success: boolean;
                message: string;
                data: any;
            }>("POST", "/transaction/withdraw-commission", data);
        },
        onSuccess: () => {
            // Invalidate commission transactions to refresh balance
            queryClient.invalidateQueries({ queryKey: ["memberCommissionTransactions"] });
        },
    });
};
