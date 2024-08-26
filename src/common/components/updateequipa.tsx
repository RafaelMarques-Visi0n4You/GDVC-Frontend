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
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  equipas: {
    equipa_id: number;
    empresa_id: number;
    nome: string;
    criado_por_id: number;
    ativo: number;
    cor_equipa: string;
    data_criacao: string;
    departamento_id: number;
  };
  chefe_equipa: {
    funcionario_id: number;
    equipa_id: number;
  };
  empresas: {
    empresa_id: number;
    nome: string;
  }[];
  departamentos: {
    departamento_id: number;
    nome: string;
  }[];
}

export default function UpdateEquipaModal({
  open,
  setOpen,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const [nome, setNome] = useState("");
  const [departamento, setDepartamento] = useState<number | null>(null);
  const [cor_equipa, setCorEquipa] = useState("");
  const [apidepartamento, setApiDepartamento] = useState<Data | null>(null);
  const [refresh, setRefresh] = useState(false);
  const id = router.query.id;

  const data = useContext(AuthContext);

  const handleClose = () => {
    // Fecha o diálogo quando chamado
    setOpen(false);
    setRefresh(!refresh); // Fecha o diálogo quando chamado
  };

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/departamento/get", {
          id: data.user.funcionario.empresa_id,
        });
        setApiDepartamento(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        api
          .get("/equipa/get/" + id)
          .then((response) => {
            // Atualize o estado com os dados recebidos
            setNome(response.data.equipa?.nome);
            setDepartamento(response.data.equipa?.departamento_id);
            setCorEquipa(response.data.equipa?.cor_equipa);
          })
          .catch((error) => {
            // Trate o erro adequadamente, por exemplo, exibindo uma mensagem de erro
            console.error("Erro ao obter dados da equipa:", error);
          });
      } catch (error) {
        // Trate o erro capturado pelo try-catch, se necessário
        console.error("Erro ao tentar obter dados do cliente:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (nome.trim() === "") {
          toast.error("O nome da equipa é obrigatório");
        }
        if (departamento === 0) {
          toast.error("O departamento é obrigatório");
        }
        if (cor_equipa === "") {
          toast.error("A cor da equipa é obrigatória");
        }
        const response = await api.put(`/equipa/update/${id}`, {
          nome: nome,
          departamento_id: departamento,
          cor_equipa: cor_equipa,
        });
        console.log("Resposta:", response.data);
        setUpdateKey((prev) => prev + 1);
        handleClose();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  return (
    <Dialog open={open}>
      <div className="flex-col p-6">
        <Typography
          className="flex justify-center"
          variant="h4"
          color="blue-gray"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Editar Equipa
        </Typography>

        <form className="py-10 sm:w-94" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <div className="">
                <Select
                  label="Cor"
                  value={cor_equipa}
                  onChange={(value) => setCorEquipa(String(value))}
                  placeholder={undefined}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  style={{
                    backgroundColor: cor_equipa,
                  }}
                >
                  <Option
                    value="#f44336"
                    style={{ backgroundColor: "#f44336" }}
                  >
                    {""}
                  </Option>
                  <Option
                    value="#2196f3"
                    style={{ backgroundColor: "#2196f3" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#4caf50"
                    style={{ backgroundColor: "#4caf50" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#ffeb3b"
                    style={{ backgroundColor: "#ffeb3b" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#e91e63"
                    style={{ backgroundColor: "#e91e63" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#9c27b0"
                    style={{ backgroundColor: "#9c27b0" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#ff9800"
                    style={{ backgroundColor: "#ff9800" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#795548"
                    style={{ backgroundColor: "#795548" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                  <Option
                    value="#9e9e9e"
                    style={{ backgroundColor: "#9e9e9e" }}
                    className="mt-2"
                  >
                    {""}
                  </Option>
                </Select>
              </div>
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Select
                onChange={(value) => {
                  setDepartamento(Number(value));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                label="Departamento"
              >
                {apidepartamento?.departamentos.map((departamento) => (
                  <Option
                    key={departamento.departamento_id}
                    value={String(departamento.departamento_id)}
                  >
                    {departamento.nome}
                  </Option>
                ))}
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
              onClick={handleClose}
            >
              Editar
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
