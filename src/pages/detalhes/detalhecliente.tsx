import api from "@/common/services/api";
import {
  Card,
  CardBody,
  CardFooter,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "@/common/components/AuthContext";
import { HomeIcon } from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";

interface Data {
  Status: string;
  contrato: {
    nome: string;
    descricao: string;
    data_inicio: string;
    contrato_id: number;
    data_fim: string;
    tipo_contrato: string;
    morada_servico: string;
    cod_postal_servico: string;
    localidade_servico: string;
    servico: {
      nome: string;
      descricao: string;
    };
  }[];
  visitas: {
    visita_id: string;
    data_visita: string;
    hora_visita_inicio: string;
    hora_visita_fim: string;
    contrato_id: number;
    estado_servico: string;
    servicos: {
      nome: string;
      descricao: string;
    }[];
  }[];
  cliente: {
    nome_completo: string;
    contacto: string;
    email: string;
    cod_postal: string;
    localidade: string;
    morada: string;
    nif: string;
  };
}

export default function Home() {
  const router = useRouter();
  const id = router.query.id;
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visitas, setVisitas] = useState<Data | null>(null);
  const [contrato, setContrato] = useState<Data | null>(null);
  const user = useContext(AuthContext);

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
        const response = await api.get("/cliente/get/" + id);
        if (!response.data) {
          console.error("Erro ao carregar dados:", response);
          return;
        }
        const servicesData = response.data;

        setData(servicesData);

        const response3 = await api.post("contrato/getClientContract", {
          id: id,
        });

        setContrato(response3.data);
        console.log("Data:", response3.data);

        const response2 = await api.post("/visita/getByEmpresa", {
          empresa_id: user?.user?.funcionario?.empresa_id,
        });
        if (!response2.data) {
          console.error("Erro ao carregar dados:", response2);
          return;
        }
        if (response2.status === 200) {
          setVisitas(response2.data);
          console.log("Data:", response2.data);
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
          Detalhes do Cliente
        </Typography>
      </div>
      <div
        className="grid grid-span-col-12 sm:grid-flow-col w-full sm:gap-7 p-3"
        style={{ backgroundColor: "#F9FAFB", height: "50.5rem" }}
      >
        <div>
          <Card className="mt-6 sm:w-full">
            <CardBody>
              <Typography variant="h5" color="blue-gray" className="mb-2">
                Contratos
              </Typography>
              <div></div>

              <div className="mt-5 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {contrato?.contrato.map((contrato) => (
                  <div
                    key={contrato.contrato_id}
                    className="bg-gray-100 shadow-md rounded-lg p-6"
                  >
                    <h2 className="text-xl font-semibold text-black mb-4">
                      Contrato
                    </h2>
                    <div className="mb-2">
                      <span className="text-black font-semibold">Nome:</span>{" "}
                      <span className="text-black">{contrato.nome}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-black">
                        Descrição:
                      </span>{" "}
                      <span className="text-black">{contrato.descricao}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-black">
                        Tipo de contrato:
                      </span>{" "}
                      <span className="text-black">
                        {contrato.tipo_contrato}
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-black">
                        Data do contrato:
                      </span>{" "}
                      <span className="text-black">
                        {contrato.data_inicio} {" - "} {contrato.data_fim}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-black">
                        Visitas:
                      </h3>
                      <div className="max-h-32 overflow-y-auto">
                        {visitas?.visitas
                          .filter(
                            (visita) =>
                              visita.contrato_id === contrato.contrato_id
                          )
                          .map((visita) => (
                            <div
                              key={visita.visita_id}
                              className="bg-white shadow-md rounded-lg p-4 mt-2 "
                            >
                              <div>
                                <span className="font-semibold">Nome: </span>
                                <span>
                                  {visita?.servicos?.map((servico) => (
                                    <span key={servico.nome}>
                                      {servico.nome}
                                    </span>
                                  ))}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">Data:</span>{" "}
                                {visita.data_visita}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  Hora de Início:
                                </span>{" "}
                                {visita.hora_visita_inicio
                                  .split(":")
                                  .slice(0, 2)
                                  .join(":")}{" "}
                                {" -"}{" "}
                                {visita.hora_visita_fim
                                  .split(":")
                                  .slice(0, 2)
                                  .join(":")}
                              </div>
                              <div></div>
                              <span className="font-semibold">
                                Estado:
                              </span>{" "}
                              {visita.estado_servico}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <br></br>
              <br></br>
              <div className="grid grid-cols-7">
                <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-96">
                  <HomeIcon className="h-6 w-6 ml-4" />
                  <div className="ml-4">
                    {data?.cliente?.morada}, {data?.cliente?.cod_postal}{" "}
                    {data?.cliente?.localidade}
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
          <br></br>
        </div>
        <div>
          <Card className="mt-6 w-3/5 sm:w-full" style={{ height: "260px" }}>
            <CardBody>
              <Typography color="blue-gray" className="mb-2">
                Cliente:
              </Typography>
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
                Contacto:
                <span className="text-black"> {data?.cliente?.contacto}</span>
              </p>
              <p className="mt-4 text-gray-600">
                NIF:
                <span className="text-black"> {data?.cliente?.nif}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Morada Completa:
                <span className="text-black">
                  {" "}
                  {data?.cliente?.morada}, {data?.cliente?.cod_postal}
                  {" - "}
                  {data?.cliente?.localidade}
                </span>
              </p>
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
