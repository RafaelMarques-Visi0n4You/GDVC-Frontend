import api from "@/common/services/api";
import {
  Card,
  CardBody,
  CardFooter,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { HomeIcon } from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";

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

export default function Home() {
  const router = useRouter();
  const id = router.query.id;
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  useEffect(() => {
    console.log("Data:", data);
  }, [data]);

  async function loadData() {
    setIsLoading(true);
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
        if (response.status === 200) {
          const servicesData = response.data;

          setData(servicesData);
          console.log("Data:", data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-16 w-16 text-gray-900/50" />
      </div>
    );
  }

  return (
    <main className="overflow-hidden ">
      <div
        className="flex justify-center items-center py-4"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <Typography className="mt-2" variant="h4">
          Detalhes do Contrato
        </Typography>
      </div>
      <div
        className="grid grid-span-col-12 sm:grid-flow-col w-full sm:gap-7 p-3"
        style={{ backgroundColor: "#F9FAFB", height: "50.5rem" }}
      >
        <div>
          <Card className="mt-6 w-3/5 sm:w-full">
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                {data?.contrato?.nome}
              </Typography>
              <div></div>

              <Typography className="mt-5">
                Tipo contrato:{" "}
                <span className="text-sm text-gray-400">
                  {data?.contrato?.tipo_contrato}
                </span>
              </Typography>
              <br></br>
              <br></br>
              <div className="grid grid-cols-7">
                <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-96">
                  <HomeIcon className="h-6 w-6 ml-4" />
                  <div className="ml-4">
                    {data?.contrato?.morada_servico},{" "}
                    {data?.contrato?.cod_postal_servico}{" "}
                    {data?.contrato?.localidade_servico}
                  </div>
                </div>
                <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-44 ml-72 h-8">
                  <span className="text-sm mt-1 ml-4 text-gray-400">
                    Data início: {data?.contrato?.data_inicio}
                  </span>
                </div>
                <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-52 ml-90 h-8">
                  <span className="text-sm mt-1 ml-4 text-gray-400">
                    Data término: {data?.contrato?.data_fim}
                  </span>
                </div>
              </div>
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
          <br></br>
          <Card className="mt-6 w-3/5 sm:w-full" style={{ height: "190px" }}>
            <CardBody className="mt-2">
              <Typography color="blue-gray" className="mb-2">
                Descrição:&nbsp;
                {data?.contrato?.descricao}
              </Typography>
            </CardBody>

            <CardFooter className="pt-0"></CardFooter>
          </Card>
        </div>
        <div>
          <Card className="mt-6 w-3/5 sm:w-full" style={{ height: "560px" }}>
            <CardBody>
              <Typography color="blue-gray" className="mb-2">
                Serviços:
              </Typography>
              <div className="overflow-auto h-80">
                <div
                  className="flex grid-flow-col h-20 mt-2"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="mt-4 mr-80 px-3">
                    {data?.contrato?.servico?.nome}
                    <br></br>
                    <span className="text-gray-500 w-full ">
                      {data?.contrato?.servico?.descricao}
                    </span>
                  </p>
                </div>
                <div
                  className="grid grid-flow-col h-20 mt-2"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="mt-4 mr-80 px-3">
                    {data?.contrato?.servico?.nome}
                    <br></br>
                    <span className="text-gray-500 w-full ">
                      {data?.contrato?.servico?.descricao}
                    </span>
                  </p>
                </div>
                <div
                  className="grid grid-flow-col h-20 mt-2"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="mt-4 mr-80 px-3">
                    {data?.contrato?.servico?.nome}
                    <br></br>
                    <span className="text-gray-500 w-full">
                      {data?.contrato?.servico?.descricao}
                    </span>
                  </p>
                </div>
                <div
                  className="grid grid-flow-col h-20 mt-2"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="mt-4 mr-80 px-3 ">
                    {data?.contrato?.servico?.nome}
                    <br></br>
                    <span className="text-gray-500 w-full ">
                      {data?.contrato?.servico?.descricao}
                    </span>
                  </p>
                </div>
                <div
                  className="grid grid-flow-col h-20 mt-2"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="mt-4 mr-80 px-3 ">
                    {data?.contrato?.servico?.nome}
                    <br></br>
                    <span className="text-gray-500 w-full ">
                      {data?.contrato?.servico?.descricao}
                    </span>
                  </p>
                </div>
                <div
                  className="grid grid-flow-col h-20 mt-2"
                  style={{ backgroundColor: "#F9FAFB" }}
                >
                  <p className="mt-4 mr-80 px-3 ">
                    {data?.contrato?.servico?.nome}
                    <br></br>
                    <span className="text-gray-500 w-full ">
                      {data?.contrato?.servico?.descricao}
                    </span>
                  </p>
                </div>
              </div>
              <br></br>
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
        </div>
        <div></div>
      </div>
    </main>
  );
}
