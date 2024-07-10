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
  clientes: {
    cliente_id: number;
    nome_completo: string;
    nif: string;
    email: string;
    ativo: number;
    contacto: string;
    morada: string;
    localidade: string;
    cod_postal: string;
  };
}

export default function DetalheClienteModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const id = router.query.id;
  const [data, setData] = useState<Data | null>(null);
  const [refresh, setRefresh] = useState(false);

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/cliente/get/" + id);
        if (!response.data) {
          console.error("Erro ao carregar dados:", response);
          return;
        }
        const servicesData = response.data;

        setData(servicesData);
        setRefresh(!refresh);
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
          Detalhes Cliente
        </Typography>
        <div className="grid grid-cols-2 gap-5">
          <Card className="mt-5 w-90 ml-4">
            <CardBody>
              <p className="text-gray-600 ">
                Nome completo:{" "}
                <span className="text-black">
                  {data?.cliente?.nome_completo}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Email:
                <span className="text-black"> {data?.cliente?.email}</span>
              </p>

              <p className="mt-4 text-gray-600">
                Morada completa:
                <span className="text-black">
                  {" "}
                  {data?.cliente?.morada}, {data?.cliente?.localidade}{" "}
                  {data?.cliente?.cod_postal}
                </span>
              </p>
            </CardBody>
          </Card>

          <div className="">
            <Card className="mt-5 mr-4 h-48">
              <CardBody>
                <p className=" text-gray-600">
                  Contacto:
                  <span className="text-black"> {data?.cliente?.contacto}</span>
                </p>
                <p className="mt-4 text-gray-600">
                  NIF:
                  <span className="text-black"> {data?.cliente?.nif}</span>
                </p>
                <p className="mt-4 text-gray-600">
                  Conta:
                  <span className="text-black">
                    {" "}
                    {data?.cliente?.ativo === 1 ? "Ativa" : "Desativada"}
                  </span>
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="flex justify-center mt-6">
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
