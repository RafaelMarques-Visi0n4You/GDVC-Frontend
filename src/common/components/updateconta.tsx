import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  contaUtilizador: {
    conta_utilizador_id: number;
    email: string;
    ativo: boolean;
    cliente_id: number;
    criado_por_id: number;
    funcionario_id: number;
    tipo_utilizador: string;
    funcionario: {
      nome_completo: string;
    };
  }[];
  contaUtilizadores: {
    conta_utilizador_id: number;
    email: string;
    ativo: boolean;
    cliente_id: number;
    criado_por_id: number;
    funcionario_id: number;
    tipo_utilizador: string;
    funcionario: {
      nome_completo: string;
    };
  }[];
  clientes: {
    cliente_id: number;
    nome_completo: string;
  }[];
  funcionarios: {
    ativo: boolean;
    cargo: string;
    cod_postal: string;
    contacto: number;
    criado_por: number;
    departamento_id: number;
    email: string;
    empresa_id: number;
    equipa_id: number;
    funcionario_id: number;
    morada: string;
    localidade: string;
    nome_completo: string;
    numero_mecanografico: number;
    equipa: {
      equipa_id: number;
      nome: string;
      data_criacao: string;
      ativo: boolean;
    };
  }[];
}

export default function UpdateContaModal({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
}) {
  const [email, setemail] = useState("");
  const [tipo_utilizador, settipo_utilizador] = useState("");
  const [cliente_id, setcliente_id] = useState(0);
  const [funcionario_id, setfuncionario_id] = useState(0);
  const [dados, setDados] = useState<Data | null>(null);
  const [clientes, setClientes] = useState<Data | null>(null);
  const [funcionarios, setFuncionarios] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const data = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      setIsLoading(true);
      try {
        api
          .get("/contautilizador/get/" + id)
          .then((response) => {
            console.log("Dados carregados444:", response.data);
            setemail(response.data.contaUtilizador?.email);
            settipo_utilizador(response.data.contaUtilizador?.tipo_utilizador);
            setcliente_id(response.data.contaUtilizador?.cliente_id);
            setfuncionario_id(response.data.contaUtilizador?.funcionario_id);
            if (response.data.Status === "Success") {
              setIsLoading(false);
            }
          })

          .catch((error) => {
            console.error("Erro ao obter dados da conta:", error);
          });
      } catch (error) {
        // Trate o erro capturado pelo try-catch, se necessário
        console.error("Erro ao tentar obter dados da conta:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/cliente/getMyClients", {
          empresa_id: data?.user?.funcionario?.empresa_id,
        });
        console.log("Dados carregadosabc:", response.data);
        setClientes(response.data);

        const response2 = await api.post("/funcionario/getfuncionarioempresa", {
          empresa_id: data?.user?.funcionario?.empresa_id,
        });
        console.log("Dados carregadosdef:", response2.data);
        setFuncionarios(response2.data);

        const response3 = await api.get("/contautilizador/get");
        console.log("Dados carregados446:", response3.data);
        setDados(response3.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      console.log("Passei aqui");
      try {
        const response = await api.put("/contautilizador/update/" + id, {
          email: email,
          tipo_utilizador: tipo_utilizador,
          cliente_id: cliente_id,
          funcionario_id: funcionario_id,
        });
        console.log("Dados carregados420:", response.data);
        handleClose();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  return (
    <Dialog open={open}>
      {isLoading && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      )}
      <div className="flex-col p-6">
        <Typography
          className="flex justify-center"
          variant="h4"
          color="blue-gray"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Editar Conta -{"  "}
          <span>
            {dados?.contaUtilizadores.map((conta) => {
              if (conta.conta_utilizador_id === id) {
                return conta.funcionario.nome_completo;
              }
            })}
          </span>
        </Typography>

        <form className="py-10 sm:w-94" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Select
                label="Tipo de Utilizador"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={tipo_utilizador}
                onChange={(value) => settipo_utilizador(String(value))}
              >
                <Option value="nivel1">Nível 1</Option>
                <Option value="nivel2">Nível 2</Option>
                <Option value="nivel3">Nível 3</Option>
                <Option value="nivel4">Nível 4</Option>
                <Option value="nivel5">Nível 5</Option>
              </Select>
            </div>
          </div>
          <br />
          <div className="flex flex-row justify-center gap-10">
            <Button
              className="w-92"
              style={{ backgroundColor: "#FE0000" }}
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-92"
              style={{ backgroundColor: "#0F124C" }}
            >
              Editar
            </Button>
          </div>
        </form>
        <Toaster containerStyle={{ zIndex: 9999 }} />
      </div>
    </Dialog>
  );
}
