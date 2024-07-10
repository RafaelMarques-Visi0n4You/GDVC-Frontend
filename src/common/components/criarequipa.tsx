import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
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

export default function CriarEquipaModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [departamento, setdepartamento] = useState<Data | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    departamento_id: 0,
    cor_equipa: "",
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/departamento/get", {
          id: data.user.funcionario.empresa_id,
        });
        setdepartamento(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        // Verifique se todos os campos do formulário estão preenchidos

        // Verifique individualmente para cada campo e mostre mensagens de erro apropriadas
        if (formData.nome.trim() === "") {
          toast.error("Campo 'nome' é obrigatório.");
          return;
        }
        if (formData.departamento_id === 0) {
          toast.error("Campo 'Departamento' é obrigatório.");
          return;
        }
        if (formData.cor_equipa === "") {
          toast.error("Campo 'Cor Equipa' é obrigatório.");
          return;
        }

        // Crie a equipe
        const response = await api.post("/equipa/create", {
          nome: formData.nome,
          departamento_id: formData.departamento_id,
          cor_equipa: formData.cor_equipa,
          criado_por_id: data.user.conta_utilizador_id,
          empresa_id: data.user.funcionario.empresa_id,
        });

        console.log("Resposta da criação da equipe:", response.data);

        // Verifique se a equipe foi criada com sucesso
        if (response.data.id) {
          // Extraia o ID da equipe criada da resposta da API
          const equipeId = response.data.id;
          console.log("ID da equipe criada:", equipeId);

          // Limpe os campos do formulário se necessário
          setFormData({
            nome: "",
            departamento_id: 0,
            cor_equipa: "",
          });

          setOpen(false);
          toast.success("Equipa criada com sucesso!");
        } else {
          console.log("Erro ao criar a equipa");
          toast.error("Algo deu errado. Por favor, tente novamente.");
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
          Criar Equipa
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.nome}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    nome: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Select
                label="Departamento"
                value={
                  formData.departamento_id
                    ? formData.departamento_id.toString()
                    : undefined
                }
                onChange={(event: any) =>
                  setFormData({
                    ...formData,
                    departamento_id: event,
                  })
                }
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {departamento?.departamentos.map((departamento) => (
                  <Option
                    key={departamento.departamento_id}
                    value={departamento.departamento_id.toString()}
                  >
                    {departamento.nome}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="xl:w-83 lg:w-full">
              <Select
                label="Cor"
                onChange={(event: any) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    cor_equipa: event,
                  }));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                style={{ backgroundColor: formData.cor_equipa }}
              >
                <Option value="#DAA520" style={{ backgroundColor: "#DAA520" }}>
                  {""}
                </Option>
                <Option
                  value="#9370DB"
                  style={{ backgroundColor: "#9370DB" }}
                  className="mt-2"
                >
                  {""}
                </Option>
                <Option
                  value="#FF69B4"
                  style={{ backgroundColor: "#FF69B4" }}
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
                  value="#B0E0E6"
                  style={{ backgroundColor: "#B0E0E6" }}
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
          <br />

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
