import { Spinner } from "@material-tailwind/react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

// Defina o tipo para o contexto de autenticação
interface AuthContextType {
  signed: boolean;
  user: any; // Defina o tipo apropriado para o usuário
  Login: (userData: any) => Promise<void>;
  Logout: () => void;
}

// Passe o tipo como argumento para createContext
export const AuthContext = createContext<AuthContextType>({
  signed: false,
  user: null,
  Login: async () => {},
  Logout: () => {},
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<any>(undefined); // Inicialmente indefinido
  const router = useRouter();

  async function loadUser() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/me");
        setUser(response.data.user);
      } catch (error) {
        console.log(error);
        deleteCookie("token");
        setUser(null);
        if (router.pathname !== "/") {
          router.push("/");
        }
      }
    } else {
      setUser(null);
      if (router.pathname !== "/") {
        router.push("/");
      }
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function Login(userData: any) {
    try {
      const response = await api.post("/login", userData);
      setCookie("token", response.data.token, {
        path: "/",
      });
      api.defaults.headers["Authorization"] = `Bearer ${response.data.token}`;
      const userResponse = await api.get("/me");
      if (userResponse.data.user.ativo === 1) {
        setUser(userResponse.data.user);
        router.push("/home");
      } else {
        deleteCookie("token");
        throw new Error("Conta inativa!");
      }
    } catch (error: any) {
      console.log(error);
      if (error.message === "Conta inativa!") {
        throw error;
      }
      throw new Error("Email ou password incorretos!");
    }
  }

  function Logout() {
    deleteCookie("token");
    setUser(null);
    router.push("/");
  }

  // Retorne apenas quando o estado do usuário for definido (autenticado ou não autenticado)
  if (user === undefined)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-16 w-16 text-gray-900/50" />
      </div>
    );

  return (
    <AuthContext.Provider
      value={{
        signed: Boolean(user),
        user,
        Login,
        Logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
