import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import router from "next/router";
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

export default function CriarContaModal({
  open,
  setOpen,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [clientes, setClientes] = useState<Data | null>(null);
  const [funcionarios, setFuncionarios] = useState<Data | null>(null);
  const utilizador = useContext(AuthContext);
  const id = router.query.id;
  const id2 = router.query.id2;

  async function loadData() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/cliente/getMyClients", {
          empresa_id: utilizador?.user?.funcionario?.empresa_id,
        });
        console.log("Dados carregadosabc:", response.data);
        setClientes(response.data);

        const response2 = await api.post("/funcionario/getfuncionarioempresa", {
          empresa_id: utilizador?.user?.funcionario?.empresa_id,
        });
        console.log("Dados carregadosdef:", response2.data);
        setFuncionarios(response2.data);

        const response3 = await api.get("/contautilizador/get");
        console.log("Dados carregados446:", response3.data);
        setData(response3.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, [open]);

  console.log(utilizador);

  const [formData, setFormData] = useState({
    cliente_id: 0,

    email: "",
    password: "",
    tipo_utilizador: "",
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (formData.password.trim() === "") {
          toast.error("Por favor, preencha o campo Nome Password!");
        }
        if (formData.email.trim() === "") {
          toast.error("Por favor, preencha o campo Email!");
        }
        if (formData.tipo_utilizador.trim() === "") {
          toast.error("Por favor, preencha o campo NIF!");
        }

        const response = await api.post("/contautilizador/create", {
          email: formData.email,
          password: formData.password,
          tipo_utilizador: formData.tipo_utilizador,
          cliente_id: id ? id : null,
          funcionario_id: id2 ? id2 : null,

          criado_por_id: utilizador.user.conta_utilizador_id,
        });

        setFormData({
          password: "",
          email: "",
          tipo_utilizador: "",
          cliente_id: 0,
        });

        setOpen(false);
        setUpdateKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };
  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  return (
    <Dialog open={open} size="lg">
      <div className="flex-col p-6">
        <Typography
          className="flex justify-center"
          variant="h4"
          color="blue-gray"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Criar Conta Utilizador
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    email: event.target.value,
                  })
                }
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="password"
                label="Password"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.password}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    password: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              {id ? (
                <Select
                  value={formData.tipo_utilizador}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      tipo_utilizador: String(value),
                    })
                  }
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  label="Tipo de Utilizador"
                >
                  <Option value="nivel1">Nível 1</Option>
                </Select>
              ) : (
                <Select
                  value={formData.tipo_utilizador}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      tipo_utilizador: String(value),
                    })
                  }
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  label="Tipo de Utilizador"
                >
                  <Option value="nivel1">Nível 1</Option>
                  <Option value="nivel2">Nível 2</Option>
                  <Option value="nivel3">Nível 3</Option>
                  <Option value="nivel4">Nível 4</Option>
                  <Option value="nivel5">Nível 5</Option>
                </Select>
              )}
            </div>
          </div>
          <br />
          <div className="flex flex-row justify-center gap-40">
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
              Adicionar
            </Button>
          </div>
          <Toaster containerStyle={{ zIndex: 9999 }} />
        </form>
      </div>
    </Dialog>
  );
}
