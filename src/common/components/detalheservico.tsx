import api from "@/common/services/api";
import {
  Button,
  Card,
  CardBody,
  Dialog,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
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
  };
  tipoServico: {
    tipo_servico_id: number;
    nome: string;
  };
  contaUtilizador: {
    conta_utilizador_id: number;
    nome: string;
    funcionario: {
      nome_completo: string;
    };
  };
}

export default function DetalheServicoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const id = router.query.id;
  const [data, setData] = useState<Data | null>(null);
  const [tipoServico, setTipoServico] = useState<Data | null>(null);
  const [contaUtilizadores, setContaUtilizadores] = useState<Data | null>(null); // Fix: Add 'contaUtilizadores' to the useState

  const [refresh, setRefresh] = useState(false);

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setRefresh(!refresh);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/servico/get/" + id);

        const servicesData = response.data;

        setData(servicesData);

        const tiposervicoData = await api.get(
          "/tiposervico/get/" + data?.servicos?.tipo_servico_id
        );

        setTipoServico(tiposervicoData.data); // Fix: Pass the 'data' property of 'tiposervicoData' to 'setTipoServico'

        const contaUtilizadoresData = await api.get(
          "/contautilizador/get/" + data?.servicos?.criado_por_id
        );

        setContaUtilizadores(contaUtilizadoresData.data);
        console.log("Data:", contaUtilizadores);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  return (
    <>
      <Dialog open={open} style={{ backgroundColor: "#F9FAFB" }}>
        <Typography variant="h5" className="flex justify-center mt-4">
          Detalhes Serviço
        </Typography>
        <div className="grid grid-cols-2 gap-5">
          <Card className="mt-5 w-90 ml-4 max-h-60 ">
            <CardBody>
              <p className="text-gray-600 ">
                Nome Servico:{" "}
                <span className="text-black">{data?.servicos?.nome}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Tipo Serviço:
                <span className="text-black">
                  {" "}
                  {tipoServico?.tipoServico?.nome}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Preço por hora:
                <span className="text-black">
                  {" "}
                  {data?.servicos?.preco_hora} €
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Tempo estimado:
                <span className="text-black">
                  {" "}
                  {data?.servicos?.tempo_estimado}{" "}
                  {data?.servicos?.tipo_tempo_estimado}{" "}
                </span>
              </p>
            </CardBody>
          </Card>

          <div className="">
            <Card className="mt-5 mr-4 h-60">
              <CardBody>
                <p className="mt-8 text-gray-600">
                  Criado por:{" "}
                  <span className="text-black">
                    {
                      contaUtilizadores?.contaUtilizador?.funcionario
                        ?.nome_completo
                    }
                  </span>
                </p>
                <p className="mt-8 text-gray-600">
                  Data criação:{" "}
                  <span className="text-black">
                    {data?.servicos?.data_criacao.slice(0, 10)}
                  </span>
                </p>
              </CardBody>
            </Card>
          </div>
          <Card className=" xl:w-178 lg:w-120 max-h-40 ml-4 overflow-y-scroll">
            <CardBody>
              <p className="mt-2 text-gray-600 max-h-40 ">
                Descrição:{" "}
                <span className="text-black ">{data?.servicos?.descricao}</span>
              </p>
            </CardBody>
          </Card>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleClose}
            className="w-40"
            style={{ backgroundColor: "#BDC2CD" }}
          >
            Voltar
          </Button>
        </div>
        <br />
      </Dialog>
    </>
  );
}
