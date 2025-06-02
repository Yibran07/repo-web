import axios from "../api/axios";
import { showErrorToast, showSuccessToast } from "./toastUtils";

import { useEffect } from "react";

export default function BackendCheck({ children }) {
    useEffect(() => {
        axios.get(import.meta.env.VITE_API_URL)
            .then(res => {
                if (res.status === 200) {
                    showSuccessToast("Servicio", "habilitado");
                } else {
                    showErrorToast("Servicio", "no habilitado");
                }
            })
            .catch(err => {
                showErrorToast("Algo paso con el servicio, consulte con el administrador");
                console.error(err);
            });
    }, []);

    return children;
}