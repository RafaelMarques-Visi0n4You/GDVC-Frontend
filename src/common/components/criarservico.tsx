import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  servicos: {
    criado_por_id: number;
    data_criacao: string;
    descricao: string;
    empresa_id: number;
    nome: string;
    preco_hora: number;
    servico_id: number;
    tempo_estimado: number;
    tipo_servico_id: number;
    tipo_tempo_estimado: string;
    ultima_atualizacao: string;
  }[];
  tipoServico: {
    tipo_servico_id: number;
    nome: string;
  }[];
  contaUtilizadores: {
    conta_utilizador_id: number;
    nome: string;
    funcionario: {
      nome_completo: string;
    };
  }[];
}

export default function CriarServicoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [tiposervico, setTipoServico] = useState<Data | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco_hora: 0,
    tempo_estimado: 0,
    tipo_tempo_estimado: "",
    tipo_servico_id: 0,
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/tiposervico/get");
        console.log("Dados carregados:", response.data);
        setTipoServico(response.data);
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
        if (formData.nome.trim() === "") {
          toast.error("O nome do serviço é obrigatório");
        }
        if (formData.descricao.trim() === "") {
          toast.error("A descrição do serviço é obrigatória");
        }
        if (formData.preco_hora <= 0) {
          toast.error("O preço por hora é obrigatório");
        }
        if (formData.tempo_estimado <= 0) {
          toast.error("O tempo estimado é obrigatório");
        }
        if (formData.tipo_tempo_estimado === "") {
          toast.error("O tipo de tempo estimado é obrigatório");
        }
        if (formData.tipo_servico_id === 0) {
          toast.error("O tipo de serviço é obrigatório");
        }

        // Crie a equipe
        const response = await api.post("/servico/create", {
          nome: formData.nome,
          descricao: formData.descricao,
          preco_hora: formData.preco_hora,
          tempo_estimado: formData.tempo_estimado,
          tipo_tempo_estimado: formData.tipo_tempo_estimado,
          tipo_servico_id: formData.tipo_servico_id,
          criado_por_id: data.user.conta_utilizador_id,
          empresa_id: data.user.funcionario.empresa_id,
        });

        console.log("Resposta da criação do serviço:", response.data);

        // Verifique se a equipe foi criada com sucesso
        if (response.data.id) {
          // Extraia o ID da equipe criada da resposta da API
          const servicoId = response.data.id;
          console.log("ID do serviço criado:", servicoId);

          // Crie o chefe da equipe usando o ID da equipe
        } else {
          console.log("Erro ao criar serviço");
        }

        // Limpe os campos do formulário se necessário
        setFormData({
          nome: "",
          descricao: "",
          preco_hora: 0,
          tempo_estimado: 0,
          tipo_tempo_estimado: "",
          tipo_servico_id: 0,
        });

        setOpen(false);
        toast.success("Serviço criado com sucesso!");
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
          Criar Serviço
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
              <Input
                type="Number"
                label="Preço por Hora"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.preco_hora}
                min={0}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    preco_hora: parseFloat(event.target.value),
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Select
                label="Tipo de tempo estimado"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.tipo_tempo_estimado}
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    tipo_tempo_estimado: value as string,
                  }));
                }}
              >
                <Option value="Minutos">Minutos</Option>
                <Option value="Horas">Horas</Option>
                <Option value="Dias">Dias</Option>
                <Option value="Semanas">Semanas</Option>
                <Option value="Meses">Meses</Option>
                <Option value="Anos">Anos</Option>
              </Select>
            </div>
            <div className="w-1/2">
              <Input
                type="Number"
                label="Tempo estimado"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.tempo_estimado}
                min={0}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    tempo_estimado: parseFloat(event.target.value),
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Select
                label="Tipo de Serviço"
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    tipo_servico_id: parseInt(value as string),
                  }));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {tiposervico?.tipoServico.map((tipo) => (
                  <Option value={String(tipo?.tipo_servico_id)}>
                    {tipo?.nome}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <br />
          <div className="w-full">
            <Textarea
              label="Descrição"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              value={formData.descricao}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  descricao: event.target.value,
                })
              }
            ></Textarea>
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
