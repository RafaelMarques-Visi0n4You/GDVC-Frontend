import {
  Button,
  Dialog,
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
  chefesEquipa: {
    funcionario_id: number;
    equipa_id: number;
    funcionarios: {
      nome_completo: string;
    }[];
  }[];
  funcionarios: {
    funcionario_id: number;
    nome_completo: string;
    equipa_id: number;
    ativo: number;
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

export default function CriarChefeEquipaModal({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
}) {
  const [chefeEquipa, setChefeEquipa] = useState<Data | null>(null);
  const [formData, setFormData] = useState({
    funcionario_id: 0,
  });
  const [refresh, setRefresh] = useState(false);

  const data = useContext(AuthContext);

  async function loadData(id: number) {
    console.log("Entrei", id);

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/funcionario/get", {
          equipa_id: id,
          empresa_id: data.user.funcionario.empresa_id,
        });

        setChefeEquipa(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    console.log("IdEquipa:", id);
    loadData(id);
    setRefresh(true);
  }, [open, id]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    console.log("funcionario:", formData.funcionario_id);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (formData.funcionario_id !== 0) {
          // Verifique se já existe um registro para esta equipe na tabela chefeequipa
          const response = await api.post("/chefeequipa/get", {
            equipa_id: id,
            funcionario_id: formData.funcionario_id,
          });

          if (response.data.Status === "Existe") {
            const update = await api.put("/chefeequipa/update", {
              equipa_id: id,
              funcionario_id: formData.funcionario_id,
            });
            if (update.data.Status === "Success") {
              console.log("Chefe de equipa atualizado com sucesso");
            }
          }

          setFormData({
            funcionario_id: 0,
          });

          setRefresh(!refresh);
          setOpen(false);
          toast.success("Chefe de equipa alterado/adicionado com sucesso!");
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
          Chefe Equipa
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-full">
              {" "}
              <Select
                onChange={(value) => {
                  setFormData({ funcionario_id: parseInt(value as string) });
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {chefeEquipa?.funcionarios
                  .filter((funcionario) => {
                    return (
                      funcionario?.equipa_id === Number(id) &&
                      funcionario.ativo === 1
                    );
                  })
                  ?.map((funcionario) => (
                    <Option
                      value={String(funcionario?.funcionario_id)}
                      key={funcionario?.funcionario_id}
                    >
                      {funcionario?.nome_completo}
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
