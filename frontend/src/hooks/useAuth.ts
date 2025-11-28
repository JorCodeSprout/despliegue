// useAuth.ts
import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../contexts/AuthTypes"; 

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if(context === null) {
        throw new Error("Error: 'useAuth' debe ser usado dentro de un AuthProvider");
    }

    return context;
};