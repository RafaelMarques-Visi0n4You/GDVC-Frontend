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
  contratos: {
    ativo: boolean;
    cliente_id: number;
    cod_postal_servico: string;
    contrato_id: number;
    criado_por_id: number;
    data_criacao: string;
    data_fim: string;
    data_inicio: string;
    descricao: string;
    localidade_servico: string;
    morada_servico: string;
    nome: string;
    tipo_contrato: string;
    cliente: {
      nome_completo: string;
    };
  };
  clientes: {
    cliente_id: number;
    nome_completo: string;
    ativo: number;
  }[];
  servicos: {
    servico_id: number;
    nome: string;
    ativo: number;
  }[];
}

export default function CriarContratoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [clientes, setClientes] = useState<Data | null>(null);
  const [servicos, setServicos] = useState<Data | null>(null); // Adicione esta linha [1/2
  const [formData, setFormData] = useState({
    cliente_id: 0,
    cod_postal_servico: "",
    criado_por_id: 0,
    data_fim: "",
    data_inicio: "",
    descricao: "",
    localidade_servico: "",
    morada_servico: "",
    nome: "",
    tipo_contrato: "",
    servico_id: 0,
    prioritario: "",
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/cliente/get");
        console.log("Dados carregados:", response.data);
        setClientes(response.data);

        const response2 = await api.post("/servico/getServicosEmpresa", {
          empresa_id: data?.user?.funcionario?.empresa_id,
        });
        console.log("adfhadfh:", response2.data);
        setServicos(response2.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [data]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (
          formData.cliente_id != 0 &&
          formData.cod_postal_servico != "" &&
          formData.localidade_servico != "" &&
          formData.morada_servico != "" &&
          formData.nome != "" &&
          formData.tipo_contrato != "" &&
          formData.data_inicio != "" &&
          formData.data_fim != "" &&
          formData.descricao != ""
        ) {
          // Crie a equipe
          const response = await api.post("/contrato/create", {
            cliente_id: formData.cliente_id,
            cod_postal_servico: formData.cod_postal_servico,
            criado_por_id: data?.user?.conta_utilizador_id,
            data_fim: formData.data_fim,
            data_inicio: formData.data_inicio,
            descricao: formData.descricao,
            localidade_servico: formData.localidade_servico,
            morada_servico: formData.morada_servico,
            nome: formData.nome,
            tipo_contrato: formData.tipo_contrato,
            servico_id: formData.servico_id,
            prioritario: formData.prioritario,
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
            cliente_id: 0,
            cod_postal_servico: "",
            criado_por_id: 0,
            data_fim: "",
            data_inicio: "",
            descricao: "",
            localidade_servico: "",
            morada_servico: "",
            nome: "",
            tipo_contrato: "",
            servico_id: 0,
            prioritario: "",
          });

          setOpen(false);
          toast.success("Contrato criado com sucesso!");
        } else {
          if (formData.cliente_id === 0) {
            toast.error("Selecione um cliente");
          }

          if (formData.cod_postal_servico.trim() === "") {
            toast.error("Insira um código postal");
          }
          if (formData.localidade_servico.trim() === "") {
            toast.error("Insira uma localidade");
          }
          if (formData.morada_servico.trim() === "") {
            toast.error("Insira uma morada");
          }
          if (formData.nome.trim() === "") {
            toast.error("Insira um nome");
          }
          if (formData.tipo_contrato === "") {
            toast.error("Selecione um tipo de contrato");
          }
          if (formData.data_inicio === "") {
            toast.error("Insira uma data de início");
          }
          if (formData.data_fim === "") {
            toast.error("Insira uma data de fim");
          }

          if (formData.descricao.trim() === "") {
            toast.error("Insira uma descrição");
          }
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
          Criar Contrato
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
                label="Tipo de Contrato"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.tipo_contrato}
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    tipo_contrato: value as string,
                  }));
                }}
              >
                <Option value="Diário">Diário</Option>
                <Option value="Semanal">Semanal</Option>
                <Option value="Bissemanal">Bissemanal</Option>
                <Option value="Quinzenal">Quinzenal</Option>
                <Option value="Bimensal">Bimensal</Option>
                <Option value="Mensal">Mensal</Option>
                <Option value="Bimestral">Bimestral</Option>
                <Option value="Trimestral">Trimestral</Option>
                <Option value="Quadrimestral">Quadrimestral</Option>
                <Option value="Semestral">Semestral</Option>
                <Option value="Anual">Anual</Option>
                <Option value="Único">Único</Option>
              </Select>
            </div>
          </div>
          <br />
          <div className="w-full">
            <Input
              type="text"
              label="Morado do Serviço"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              value={formData.morada_servico}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  morada_servico: event.target.value,
                })
              }
              crossOrigin={undefined}
            />
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                maxLength={8}
                label="Código Postal do Serviço"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.cod_postal_servico}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    cod_postal_servico: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="text"
                label="Localidade do Serviço"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.localidade_servico}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    localidade_servico: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>

          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="date"
                label="Data de Início"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.data_inicio}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    data_inicio: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="date"
                label="Data de Fim"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.data_fim}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    data_fim: event.target.value,
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
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    cliente_id: parseInt(value as string),
                  }));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                label="Cliente"
              >
                {clientes?.clientes
                  ?.filter((cliente) => cliente?.ativo === 1)
                  ?.map((cliente) => (
                    <Option value={String(cliente?.cliente_id)}>
                      {cliente?.nome_completo}
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
