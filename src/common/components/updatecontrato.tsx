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
import router from "next/router";
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
  contrato: {
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

export default function UpdateContratoModal({
  open,
  setOpen,
  setUpdateKey,
  cliente_id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
  cliente_id: number;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cliente, setCliente] = useState<number | null>(null);
  const [apiCliente, setApiCliente] = useState<Data | null>(null);
  const [cod_postal_servico, setCodPostalServico] = useState("");
  const [data_fim, setDataFim] = useState("");
  const [data_inicio, setDataInicio] = useState("");
  const [localidade_servico, setLocalidadeServico] = useState("");
  const [morada_servico, setMoradaServico] = useState("");
  const [tipo_contrato, setTipoContrato] = useState("");
  const [servico_id, setServicoId] = useState<number | null>(null);
  const [prioridade, setPrioridade] = useState("");
  const [servicos, setServicos] = useState<Data | null>(null);

  const [refresh, setRefresh] = useState(false);
  const id = router.query.id;

  const data = useContext(AuthContext);

  const handleClose = () => {
    // Fecha o diálogo quando chamado
    setOpen(false);
    setRefresh(!refresh); // Fecha o diálogo quando chamado
  };

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/cliente/get");
        setApiCliente(response.data);

        const response2 = await api.post("/servico/getServicosEmpresa", {
          empresa_id: data?.user?.funcionario?.empresa_id,
        });
        setServicos(response2.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log("Cliente:", cliente_id);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        api
          .post("/contrato/get", {
            id: cliente_id,
          })
          .then((response) => {
            console.log(
              "Resposta:",
              response.data.contrato?.servico?.servico_id
            );
            setNome(response.data.contrato?.nome);
            setDescricao(response.data.contrato?.descricao);
            setCliente(response.data.contrato?.cliente_id);
            setCodPostalServico(response.data.contrato?.cod_postal_servico);
            setDataFim(response.data.contrato?.data_fim);
            setDataInicio(response.data.contrato?.data_inicio);
            setLocalidadeServico(response.data.contrato?.localidade_servico);
            setMoradaServico(response.data.contrato?.morada_servico);
            setTipoContrato(response.data.contrato?.tipo_contrato);
            setServicoId(response.data.contrato?.servico?.servico_id || null);
            setPrioridade(
              response.data.contrato?.contratohasservico?.prioritario
            );
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
  }, [cliente_id]);

  useEffect(() => {
    loadData();
  }, [refresh, cliente_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        console.log("Submitting servico_id:", servico_id); // Verificar o valor de servico_id
        const response = await api.put(`/contrato/update/${cliente_id}`, {
          nome: nome,
          descricao: descricao,
          cliente_id: cliente,
          cod_postal_servico: cod_postal_servico,
          data_fim: data_fim,
          data_inicio: data_inicio,
          localidade_servico: localidade_servico,
          morada_servico: morada_servico,
          tipo_contrato: tipo_contrato,
          servico_id: servico_id,
          prioritario: prioridade,
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
          Editar Contrato
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Identificação do Contrato"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Select
                label="Tipo de Contrato"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={tipo_contrato}
                onChange={(value) => setTipoContrato(String(value))}
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
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Código Postal do Serviço"
                minLength={8}
                maxLength={8}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={cod_postal_servico}
                onChange={(e) => setCodPostalServico(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="text"
                label="Localidade do Serviço"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={localidade_servico}
                onChange={(e) => setLocalidadeServico(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="w-full">
            <Input
              type="text"
              label="Morado do Serviço"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              value={morada_servico}
              onChange={(e) => setMoradaServico(e.target.value)}
              crossOrigin={undefined}
            />
          </div>

          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Select
                label="Prioritário"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={String(prioridade)}
                onChange={(value) => {
                  setPrioridade(String(value));
                }}
              >
                <Option value="Sim">Sim</Option>
                <Option value="Nao">Não</Option>
              </Select>
            </div>
            <div className="w-1/2">
              <Select
                label="Serviço"
                value={servico_id !== null ? String(servico_id) : ""}
                onChange={(value) => {
                  const newValue = Number(value);
                  console.log("Novo servico_id:", newValue); // Verificar o valor selecionado
                  setServicoId(newValue);
                }}
              >
                {loading ? (
                  <Option value="">Carregando...</Option>
                ) : servicos?.servicos?.length ? (
                  servicos.servicos.map((servico) => (
                    <Option
                      key={servico.servico_id}
                      value={String(servico.servico_id)}
                    >
                      {servico.nome}
                    </Option>
                  ))
                ) : (
                  <Option value="">Nenhum serviço disponível</Option>
                )}
              </Select>
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
                value={data_inicio}
                onChange={(e) => setDataInicio(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="date"
                label="Data de Fim"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={data_fim}
                onChange={(e) => setDataFim(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />

          <div className="w-full">
            <Textarea
              label="Descrição"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
              Editar
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
