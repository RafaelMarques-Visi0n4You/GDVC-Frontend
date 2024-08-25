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
      contacto: string;
      email: string;
    };
    servico: {
      nome: string;
      descricao: string;
    };
  };
  clientes: {
    cliente_id: number;
    nome_completo: string;
  }[];
  contaUtilizadores: {
    conta_utilizador_id: number;
    funcionario: {
      nome_completo: string;
    };
  }[];
}

export default function DetalheContratoModal({
  open,
  setOpen,
  contrato_id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  contrato_id: number;
}) {
  const router = useRouter();
  const id = router.query.id;
  const [data, setData] = useState<Data | null>(null);
  const [contautilizador, setContaUtilizador] = useState<Data | null>(null);

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    loadData();
    console.log("ID:", contrato_id);
  }, [contrato_id]);

  async function loadData() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/contrato/get/", { id: contrato_id });
        if (!response.data) {
          console.error("Erro ao carregar dados:", response);
          return;
        }
        const servicesData = response.data;

        setData(servicesData);
        console.log("Data:", data);

        const contautilizador = await api.get("/contautilizador/get");
        if (!contautilizador.data) {
          console.error("Erro ao carregar dados:", contautilizador);
          return;
        }
        setContaUtilizador(contautilizador.data);
        console.log("Data:", contautilizador);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }
  return (
    <>
      <Dialog open={open} style={{ backgroundColor: "#F9FAFB" }}>
        <Typography variant="h5" className="flex justify-center mt-4">
          Detalhes Contrato
        </Typography>
        <div className="grid grid-cols-2 gap-5">
          <Card className="mt-5 w-90 ml-4 xl:min-h-60 xl:max-h-60">
            <CardBody>
              <p className="text-gray-600 ">
                Nome: <span className="text-black">{data?.contrato?.nome}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Tipo Contrato:
                <span className="text-black">
                  {" "}
                  {data?.contrato?.tipo_contrato}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Morada completa:
                <span className="text-black">
                  {" "}
                  {data?.contrato?.morada_servico},{" "}
                  {data?.contrato?.cod_postal_servico} ,{" "}
                  {data?.contrato?.localidade_servico}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Datas duração:
                <span className="text-black">
                  {" "}
                  {data?.contrato?.data_inicio} até {data?.contrato?.data_fim}
                </span>
              </p>
            </CardBody>
          </Card>
          <Card className="mt-5 w-90 mr-4 xl:min-h-60 xl:max-h-60">
            <CardBody>
              <Typography variant="h6">Dados do serviço</Typography>
              <p className="mt-2 text-gray-600">
                Nome:{" "}
                <span className="text-black">
                  {data?.contrato?.servico?.nome}
                </span>
              </p>
              <p className="mt-2 text-gray-600">
                Descrição:
                <span className="text-black">
                  {" "}
                  {data?.contrato?.servico?.descricao}
                </span>
              </p>
            </CardBody>
          </Card>
        </div>
        <Card className="mt-5 w-90 mr-4 ml-4 xl:max-h-60">
          <CardBody>
            <Typography variant="h6">Dados criação do contrato</Typography>
            <p className="mt-2 text-gray-600">
              Criado por:{" "}
              <span className="text-black">
                {contautilizador?.contaUtilizadores
                  ?.filter(
                    (conta) =>
                      conta.conta_utilizador_id ===
                      data?.contrato?.criado_por_id
                  )
                  .map((conta) => conta.funcionario.nome_completo)}
              </span>
            </p>
            <p className="mt-2 text-gray-600">
              Data criação:
              <span className="text-black">
                {" "}
                {data?.contrato?.data_criacao.slice(0, 10)}
              </span>
            </p>
          </CardBody>
        </Card>

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
