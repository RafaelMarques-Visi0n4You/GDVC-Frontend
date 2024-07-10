import { Button, Dialog, Input } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  departamentos: {
    ativo: boolean;
    data_criacao: string;
    departamento_id: number;
    empresa_id: number;
    nome: string;
  }[];
  responsavelDepartamentos: {
    departamento_id: number;
    funcionario_id: number;
    funcionario: {
      nome_completo: string;
    };
  }[];
  funcionarios: {
    ativo: boolean;
    data_criacao: string;
    departamento_id: number;
    email: string;
    empresa_id: number;
    funcionario_id: number;
    nome_completo: string;
    password: string;
    role: string;
  }[];
  departamento: {
    empresa_id: number;
  };
}

const TABLE_HEAD = ["Nome", "Responsável", "Ações"];

export default function CriarContaFuncionarioModal({
  open,
  setOpen,
  id,
  id2,
  setUpdateKey,
  onAccountCreationSuccess,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number | null;
  id2: number | null;
  setUpdateKey: Dispatch<SetStateAction<number>>;
  onAccountCreationSuccess: () => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const data = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  async function createUserAccount() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (password.trim() === "") {
          toast.error("A password não pode estar vazia");
          return;
        }
        if (email.trim() === "") {
          toast.error("O email não pode estar vazio");
          return;
        }
        await api.post("/responsaveldepartamento/criarcontautilizador", {
          email: email,
          password: password,
          funcionario_id: id,
          departamento_id: id2,
        });
        toast.success(
          "Conta de utilizador criada com sucesso e associado ao departamento com sucesso!"
        );
        setUpdateKey((prev) => prev + 1);
        onAccountCreationSuccess();
        setEmail("");
        setPassword("");
      } catch (error) {
        console.error("Erro ao criar conta de utilizador:", error);
      }
    }
  }

  useEffect(() => {
    console.log("id", id);
    console.log("id2", id2);
  }, [open]);

  return (
    <Dialog className="p-8" open={open}>
      <div className="flex flex-row gap-10">
        <div className="w-1/2">
          <Input
            type="email"
            label="Email"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            crossOrigin={undefined}
          />
        </div>
        <div className="w-1/2">
          <Input
            type="password"
            label="Password"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            crossOrigin={undefined}
          />
        </div>
      </div>
      <Button
        style={{ backgroundColor: "#0F124C" }}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        className="mt-4 "
        onClick={() => {
          {
            createUserAccount(), handleClose();
          }
        }}
      >
        Concluído
      </Button>
      <Toaster containerStyle={{ zIndex: 9999 }} />
    </Dialog>
  );
}
