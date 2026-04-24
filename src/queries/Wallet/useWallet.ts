
import { useMutation } from "@tanstack/react-query";
import useApi from "../useApi";

export const useCreatePaymentOrder = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            return await useApi("POST", "/transaction/create-order", data);
        },
    });
};

export const useCheckPaymentStatus = () => {
    return useMutation({
        mutationFn: async (orderId: string) => {
            return await useApi("GET", `/transaction/payment-status/${orderId}`);
        },
    });
};
