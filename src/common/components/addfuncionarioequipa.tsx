import {
  Button,
  Dialog,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
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
  chefesEquipa: {
    funcionario_id: number;
    equipa_id: number;
    funcionarios: {
      nome_completo: string;
      ativo: number;
    }[];
  }[];
  funcionarios: {
    funcionario_id: number;
    nome_completo: string;
    ativo: number;
    equipa: {
      nome: string;
    };
  }[];
  empresas: {
    empresa_id: number;
    nome: string;
  }[];
  departamentos: {
    departamento_id: number;
    nome: string;
  }[];
}

export default function AddFuncionarioEquipaModal({
  open,
  setOpen,
  setUpdateKey,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
  id: number;
}) {
  const [chefeEquipa, setChefeEquipa] = useState<Data | null>(null);
  const [funcionarios, setFuncionarios] = useState<Data | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [formData, setFormData] = useState({
    funcionario_id: 0,
  });
  const [value, setValue] = useState(0);

  const data = useContext(AuthContext);

  async function loadData(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/funcionario/get", {
          equipa_id: id,
          empresa_id: data.user.funcionario.empresa_id,
        });
        setChefeEquipa(response.data);
        console.log("Dadosgf:", response.data);

        const todosfuncionarios = await api.post(
          "/funcionario/getfuncionarioempresa",
          {
            empresa_id: data?.user.funcionario.empresa_id,
          }
        );
        console.log("Funcionários:", todosfuncionarios.data);
        setFuncionarios(todosfuncionarios.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    loadData(id);

    setRefresh(false);
  }, [id, refresh]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("funcionario:", formData);
    const funcionario_id = formData.funcionario_id;

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        // Verifique se já existe um registro para esta equipe na tabela chefeequipa
        const response = await api.put(
          "/funcionario/update/" + funcionario_id,
          {
            equipa_id: id,
          }
        );
        console.log("Dados enviados:", response.data);

        setRefresh(!refresh);
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
          Adicionar Funcionários
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <p className="mb-3">Funcionários já na equipa:</p>{" "}
              {chefeEquipa?.funcionarios.map((funcionario) => (
                <div
                  className="mb-4 h-10 flex items-center rounded-md"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="ml-3" key={funcionario.funcionario_id}>
                    {" "}
                    {funcionario.nome_completo}
                  </p>
                </div>
              ))}
            </div>
            <div className="w-1/2">
              <p className="mb-3">Restantes Funcionários:</p>{" "}
              <Select
                onChange={(value) => {
                  setFormData({ funcionario_id: parseInt(value as string) });
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {funcionarios?.funcionarios
                  .filter((funcionario) => {
                    const isActive = funcionario?.ativo;
                    const isNotInChefeEquipa = !chefeEquipa?.funcionarios.some(
                      (f) => f?.funcionario_id === funcionario?.funcionario_id
                    );
                    return isActive && isNotInChefeEquipa;
                  })
                  .map((funcionario) => (
                    <Option value={String(funcionario?.funcionario_id)}>
                      {funcionario?.nome_completo} -
                      {funcionario?.equipa
                        ? funcionario?.equipa.nome
                        : "Sem Equipa"}
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
            >
              Adicionar
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
