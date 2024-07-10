import {
  Button,
  Dialog,
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

export default function CriarResponsavelDepartamentoModal({
  open,
  setOpen,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const id = router.query.id;

  const [departamento, setDepartamento] = useState<Data | null>(null);
  const [responsavel, setResponsavel] = useState<Data | null>(null);

  const [funcdepartamento, setFuncDepartamento] = useState<Data | null>(null);

  const [formData, setFormData] = useState({
    funcionario_id: 0,
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/departamento/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setDepartamento(response.data);
        console.log(response.data);

        const response2 = await api.get("/responsaveldepartamento/get");

        setResponsavel(response2.data);
        console.log(response2.data);

        const response3 = await api.post("/funcionario/getfuncionarioempresa", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setFuncDepartamento(response3.data);
        console.log(response3.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [open]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (formData.funcionario_id !== 0) {
          // Verifique se já existe um registro para esta equipe na tabela chefeequipa
          const response = await api.post(
            "/responsaveldepartamento/getresponvalpordepartamento",
            {
              departamento_id: id,
              funcionario_id: formData.funcionario_id,
            }
          );
          console.log("abcdefg:", response.data);
          if (response.data.Status === "Existe") {
            const update = await api.put("/responsaveldepartamento/update", {
              departamento_id: id,
              funcionario_id: formData.funcionario_id,
            });

            if (update.data.Status === "Success") {
              console.log("Responsável atualizado com sucesso");
            }
          }

          setFormData({
            funcionario_id: 0,
          });
          setUpdateKey((prev) => prev + 1);
          setOpen(false);
          toast.success(
            "Responsável de departamento alterado/adicionado com sucesso!"
          );
        } else {
          toast.error("Selecione um funcionário");
        }
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
          Responsável de Departamento
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Select
                value={String(formData.funcionario_id)}
                label="Responsável"
                onChange={(value) => {
                  setFormData({ funcionario_id: parseInt(value as string) });
                }}
              >
                {funcdepartamento?.funcionarios
                  ?.filter((funcionario) => {
                    // Verifica se o funcionário não é responsável por nenhum departamento existente
                    return !responsavel?.responsavelDepartamentos?.some(
                      (resp) =>
                        resp.funcionario_id === funcionario.funcionario_id
                    );
                  })
                  .map((funcionario, index2) => (
                    <Option
                      key={index2}
                      value={String(funcionario.funcionario_id)}
                    >
                      {funcionario.nome_completo}
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
          <Toaster containerStyle={{ zIndex: 9999 }} />
        </form>
      </div>
    </Dialog>
  );
}
