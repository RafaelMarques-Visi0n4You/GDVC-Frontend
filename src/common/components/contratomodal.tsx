import api from "@/common/services/api";
import {
  Button,
  Card,
  CardBody,
  Dialog,
  Typography,
} from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { HomeIcon } from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  contrato: {
    nome: string;
    descricao: string;
    data_inicio: string;
    data_fim: string;
    tipo_contrato: string;
    morada_servico: string;
    cod_postal_servico: string;
    localidade_servico: string;
    servico: {
      nome: string;
      descricao: string;
    };
  };
}

export default function ContratoModal({
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

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  useEffect(() => {
    console.log("Data:", data);
  }, [data]);

  async function loadData(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/contrato/get", {
          id: id,
        });
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
      <Dialog open={open} className="p-5">
        <div
          className="flex justify-center items-center"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <Typography className="mt-2" variant="h4">
            Detalhes do Contrato
          </Typography>
        </div>
        <div className="sm:gap-7 p-3" style={{ backgroundColor: "#F9FAFB" }}>
          <div>
            <Card className="mt-6 ">
              <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  {data?.contrato?.nome}
                </Typography>
                <div></div>

                <Typography className="mt-5">
                  Tipo contrato:{" "}
                  <span className="text-sm text-black">
                    {data?.contrato?.tipo_contrato}
                  </span>
                </Typography>
                <br></br>
                <div className="grid grid-cols-1 xl:grid-cols-1 xl:gap-3 lg:grid-cols-1 lg:gap-3">
                  <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-97">
                    <HomeIcon className="h-6 w-6 ml-4" />
                    <div className="ml-4 text-black">
                      {data?.contrato?.morada_servico},{" "}
                      {data?.contrato?.cod_postal_servico}{" "}
                      {data?.contrato?.localidade_servico}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-4 xl:gap-10 lg:gap-42">
                    <div className=" justify-start rounded-xl border-2 w-44 h-8">
                      <span className="text-sm mt-1 ml-4 text-black">
                        Data início: {data?.contrato?.data_inicio}
                      </span>
                    </div>
                    <div className=" grid grid-cols-1 lg:grid-flow-col xl:grid-flow-col justify-start rounded-xl border-2 w-52 xl:ml-4 lg:ml-4 h-8">
                      <span className="text-sm mt-1 ml-4 text-black">
                        Data término: {data?.contrato?.data_fim}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="mt-6 h-fit">
              <CardBody>
                <Typography color="blue-gray">
                  Descrição:&nbsp;
                  <span className="text-black">
                    {data?.contrato?.descricao}
                  </span>
                </Typography>
              </CardBody>
            </Card>
          </div>
          <div>
            <Card className="mt-6 ">
              <CardBody>
                <Typography color="blue-gray">Serviços:</Typography>
                <div className="">
                  <div
                    className="flex grid-flow-col h-24 overflow-y-scroll  mt-2"
                    style={{ backgroundColor: "#F9FAFB" }}
                  >
                    <p className="mt-1 px-3">
                      {data?.contrato?.servico?.nome} :<br></br>
                      <span className="text-black w-full ">
                        {data?.contrato?.servico?.descricao}
                      </span>
                    </p>
                  </div>
                </div>
                <br></br>
              </CardBody>
            </Card>
          </div>

          <div className="flex mt-4 mx-32">
            <Button
              className="mt-3 xl:ml-24 lg:ml-18"
              style={{
                color: "white",
                backgroundColor: "#A6A6A6",
                width: "280px",
              }}
              onClick={handleClose}
            >
              Voltar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
