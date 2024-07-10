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
  empresa: {
    cod_postal: string;
    contacto: string;
    data_adesao: string;
    email: string;
    empresa_id: number;
    localidade: string;
    morada: string;
    nif: string;
    nome: string;
    plano_subscricao_empresa_id: number;
    ramo_atividade: string;
    logo_empresa: string;
  };
  plano: {
    plano_subscricao_id: number;
    tipo_plano: string;
    limite_equipas: number;
    limite_servicos: number;
  };
  planoSubscricaoEmpresas: {
    plano_subscricao_empresa_id: number;
    data_subscricao: string;
    ativo: boolean;
    plano_subscricao_id: number;
  }[];
  tipoplano: {
    tipo_plano: string;
  };
}

export default function DetalheEmpresaModal({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
}) {
  const router = useRouter();

  const [data, setData] = useState<Data | null>(null);
  const [contautilizador, setContaUtilizador] = useState<Data | null>(null);

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    console.log("ID:", id);
    loadData(id);
  }, [id, open]);

  async function loadData(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/empresa/get/" + id);
        if (!response.data) {
          console.error("Erro ao carregar dados:", response);
          return;
        }
        const servicesData = response.data;

        setData(servicesData);
        console.log("Data:", data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }
  return (
    <>
      <Dialog open={open} style={{ backgroundColor: "#F9FAFB" }}>
        <Typography variant="h5" className="flex justify-center mt-4">
          Detalhes Empresa
        </Typography>
        <div className="grid grid-cols-2 gap-5">
          <Card className="mt-5 w-90 ml-4 max-h-56">
            <CardBody>
              <p className="text-gray-600 ">
                Nome: <span className="text-black">{data?.empresa?.nome}</span>
              </p>
              <p className="mt-2 text-gray-600">
                Plano de subscrição:{" "}
                <span className="text-black">
                  Plano {data?.tipoplano?.tipo_plano}{" "}
                </span>
              </p>
              <p className="mt-2 text-gray-600">
                Morada completa:
                <span className="text-black">
                  {" "}
                  {data?.empresa?.morada}, {data?.empresa?.cod_postal} ,{" "}
                  {data?.empresa?.localidade}
                </span>
              </p>
              <p className="mt-2 text-gray-600">
                Datas duração:
                <span className="text-black">
                  {" "}
                  {data?.empresa?.data_adesao.slice(0, 10)}
                </span>
              </p>
            </CardBody>
          </Card>
          <Card className="mt-5 mr-4 max-h-56">
            <CardBody>
              <Typography variant="h6">Dados Empresa</Typography>
              <p className="mt-2 text-gray-600">
                NIF: <span className="text-black">{data?.empresa?.nif}</span>
              </p>
              <p className="mt-2 text-gray-600">
                Contacto:
                <span className="text-black"> {data?.empresa?.contacto}</span>
              </p>
              <p className="mt-2 text-gray-600">
                Email:
                <span className="text-black"> {data?.empresa?.email}</span>
              </p>
            </CardBody>
          </Card>
          <Card className=" ml-4 xl:w-178 lg:w-120">
            <CardBody>
              <Typography variant="h6">Área e Logo da Empresa</Typography>
              <p className="mt-2 text-gray-600">
                Ramo de Atividade:{" "}
                <span className="text-black">
                  {data?.empresa?.ramo_atividade}
                </span>
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
