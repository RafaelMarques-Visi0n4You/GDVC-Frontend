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
  servico: {
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

export default function UpdateServicoModal({
  open,
  setOpen,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco_hora, setPrecoHora] = useState<number | null>(null);
  const [tempo_estimado, setTempoEstimado] = useState<number | null>(null);
  const [tipo_tempo_estimado, setTipoTempoEstimado] = useState("");
  const [tipo_servico_id, setTipoServicoId] = useState<number | null>(null);
  const [tiposervico, setTipoServico] = useState<Data | null>(null);
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
        const response = await api.get("/tiposervico/get");
        console.log("Dados carregados:", response.data);
        setTipoServico(response.data);
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
          .get("/servico/get/" + id)
          .then((response) => {
            // Atualize o estado com os dados recebidos
            setNome(response.data.servicos?.nome);
            setDescricao(response.data.servicos?.descricao);
            setPrecoHora(response.data.servicos?.preco_hora);
            setTempoEstimado(response.data.servicos?.tempo_estimado);
            setTipoTempoEstimado(response.data.servicos?.tipo_tempo_estimado);
            setTipoServicoId(response.data.servicos?.tipo_servico_id);
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
        const response = await api.put(`/servico/update/${id}`, {
          nome: nome,
          descricao: descricao,
          preco_hora: preco_hora,
          tempo_estimado: tempo_estimado,
          tipo_tempo_estimado: tipo_tempo_estimado,
          tipo_servico_id: tipo_servico_id,
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
        >
          Editar Serviço
        </Typography>
        <form className="py-10 sm:w-94" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="text"
                label="Preço por hora"
                min={0}
                value={preco_hora?.toString() || ""}
                onChange={(e) => setPrecoHora(Number(e.target.value))}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Select
                label="Tipo de tempo estimado"
                value={tipo_tempo_estimado}
                onChange={(value) => {
                  setTipoTempoEstimado(value as string);
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
                min={0}
                type="number"
                label="Tempo estimado"
                value={tempo_estimado?.toString() || ""}
                onChange={(e) => setTempoEstimado(Number(e.target.value))}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Select
                value={tipo_servico_id?.toString() || ""}
                onChange={(value) => {
                  setTipoServicoId(Number(value));
                }}
              >
                {tiposervico?.tipoServico.map((tipo) => (
                  <Option
                    key={tipo.tipo_servico_id}
                    value={tipo.tipo_servico_id.toString()}
                  >
                    {tipo.nome}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Textarea
                label="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              ></Textarea>
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
      </div>
    </Dialog>
  );
}
