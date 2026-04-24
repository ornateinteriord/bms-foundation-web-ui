import { useQuery } from '@tanstack/react-query';
import useApi from "../useApi";

export const useGetUserTransactions = (memberId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ["userTransactions", memberId],
        queryFn: async () => {
            return await useApi<{
                success: boolean;
                message: string;
                data: Array<{
                    transaction_id: string;
                    transaction_date: Date | string;
                    account_number: string;
                    transaction_type: string;
                    description: string;
                    credit: number;
                    debit: number;
                    balance: number;
                    status: string;
                    reference_no: string;
                }>;
            }>("GET", `/user/get-user-transactions/${memberId}`);
        },
        enabled: enabled && !!memberId,
    });
};
