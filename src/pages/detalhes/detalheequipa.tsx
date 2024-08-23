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
import { getCookie } from "cookies-next";

import styled from "@emotion/styled";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button, Input, Option, Select } from "@material-tailwind/react";
import Link from "next/link";

interface Data {
  Status: string;
  funcionario: {
    funcionario_id: number;
    nome_completo: string;
  };
  funcionarios: {
    funcionario_id: number;
    nome_completo: string;
  }[];

  equipa: {
    equipa_id: number;
    empresa_id: number;
    nome: string;
    criado_por_id: number;
    ativo: number;
    cor_equipa: string;
    data_criacao: string;
    departamento_id: number;
  };
  equipas: {
    equipa_id: number;
    empresa_id: number;
    nome: string;
    criado_por_id: number;
    ativo: number;
    cor_equipa: string;
    data_criacao: string;
    departamento_id: number;
  }[];
  chefesEquipa: {
    funcionario: any;
    funcionario_id: number;
    equipa_id: number;
  }[];
  empresa: {
    empresa_id: number;
    nome: string;
  };
  departamento: {
    departamento_id: number;
    nome: string;
  };
  responsavelDepartamento: {
    funcionario_id: number;
    nome_completo: string;
  }[];
  responsaveldepartamento: {
    departamento_id: number;
    funcionario_id: number;
    funcionario: {
      nome_completo: string;
    };
    departamento: {
      empresa_id: number;
    };
  }[];
  tipoServicosHasEquipas: {
    tipo_servico_id: number;
    equipa_id: number;
    tipo_servico: {
      nome: string;
    };
  }[];
  visitas: {
    visita_id: string;
    data_visita: string;
    agenda_servico_id: number;
    hora_visita_inicio: string;
    hora_visita_fim: string;
    contrato_id: number;
    estado_servico: string;
    servicos: {
      nome: string;
      descricao: string;
    }[];
    agenda_servico: {
      agenda_servico_id: number;
      equipa: {
        equipa_id: number;
        nome: string;
      };
    };
    contrato: {
      contrato_id: number;
      nome: string;
      cliente: {
        cliente_id: number;
        nome_completo: string;
      };
    };
  }[];
  clientes: {
    cliente_id: number;
    nome_completo: string;
  }[];
}

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(350px, 1fr));
  gap: -10px;
  padding: 8px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  color: #ffffff;
  margin-top: 23px;
`;

export default function DetalhesEquipa() {
  const [data, setData] = useState<Data | null>(null);
  const [empresa, setEmpresa] = useState<Data | null>(null);
  const [departamento, setDepartamento] = useState<Data | null>(null);
  const [chefe, setChefe] = useState<Data | null>(null);
  const [funcionario, setFuncionario] = useState<Data | null>(null);
  const [responsavel, setResponsavel] = useState<Data | null>(null);
  const [todoschefe, setTodosChefe] = useState<Data | null>(null);
  const user = useContext(AuthContext);
  const [tiposervicohasequipas, setTipoServicoHasEquipa] =
    useState<Data | null>(null);
  const router = useRouter();
  const id = router.query.id;
  const [isLoading, setIsLoading] = useState(true);
  const [visitas, setVisitas] = useState<Data | null>(null);
  const [contrato, setContrato] = useState<Data | null>(null);
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [showModalCreateContrato, setShowModalCreateContrato] = useState(false);
  const [showModalCreateServiceTipe, setShowModalCreateServiceTipe] =
    useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [clientesData, setClientesData] = useState<Data | null>(null); // Fix: Add 'clientesData' to the useState
  const [updateKey, setUpdateKey] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [estado, setEstado] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("Nome");
  const [ClienteID, setClienteID] = useState<number | null>(null);
  const [selectedequipaId, setselectedequipaId] = useState<number | null>(null);
  const [todasequipas, setTodasEquipas] = useState<Data | null>(null);

  const equipaID = Number(id);

  const visitasFiltradas = visitas?.visitas?.filter((visita) => {
    // Verifica se um contrato está selecionado e se o estado é especificado
    const contratoMatches = visita.agenda_servico.equipa.equipa_id === equipaID;
    const clienteMatches =
      ClienteID === null || visita.contrato.cliente.cliente_id === ClienteID;
    const estadoMatches = estado === "" || visita.estado_servico === estado;
    const selectedDates =
      selectedDate === null || new Date(visita.data_visita) <= selectedDate;

    return contratoMatches && estadoMatches && selectedDates && clienteMatches;
  });

  function filterEventsByDate(visitas: Data["visitas"], date: Date | null) {
    if (!date) return visitas; // Retorna todas as visitas se a data não estiver definida

    return visitas.filter((event) => {
      const eventDate = new Date(event.data_visita);
      return eventDate <= date;
    });
  }

  function filterByDate(visitas: Data["visitas"], date: Date | null) {
    let filteredVisits = visitas;
    if (date !== null) {
      filteredVisits = filterEventsByDate(visitas, date);
    }
    return filteredVisits;
  }

  async function loadData(id: number) {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/equipa/get/" + id);

        const servicesData = response.data;

        setData(servicesData);

        const empradadetails = await api.get(
          "/empresa/get/" + servicesData.equipa.empresa_id
        );

        setEmpresa(empradadetails.data);

        const departamentodetails = await api.get(
          "/departamento/get/" + servicesData.equipa.departamento_id
        );

        setDepartamento(departamentodetails.data);

        const funcionariodetail = await api.post(
          "/funcionario/getfuncionariosequipa/",
          {
            equipa_id: servicesData.equipa.equipa_id,
          }
        );
        setFuncionario(funcionariodetail.data);

        const reponsaveldepartamento = await api.post(
          "/responsaveldepartamento/getone",
          {
            departamento_id: servicesData.equipa.departamento_id,
          }
        );

        setResponsavel(reponsaveldepartamento.data);

        const chefeequipa = await api.get("/chefeequipa/get/");
        console.log("Chefe Equipa:", chefeequipa);
        setTodosChefe(chefeequipa.data);

        const tiposervicos = await api.post(
          "/tiposervicohasequipas/getByEquipas/",
          {
            equipa_id: servicesData.equipa.equipa_id,
          }
        );

        setTipoServicoHasEquipa(tiposervicos.data);

        const equipas = await api.post("/equipa/get", {
          empresa_id: user?.user?.funcionario?.empresa_id,
        });

        setTodasEquipas(equipas.data);

        const clientes = await api.get("/cliente/get");
        setClientesData(clientes.data);
        console.log("Clientes:", clientes.data);

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

        console.log("Tipo Serviço:", tiposervicohasequipas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    if (
      user?.user?.tipo_utilizador !== "nivel4" &&
      user?.user?.tipo_utilizador !== "nivel5"
    ) {
      router.push("/permissiondenied");
    }
    loadData(Number(id));
  }, [updateKey, equipaID]);

  function clearfilters() {
    setselectedequipaId(null);
    setSelectedDate(null);
    setEstado("");
    setClienteID(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-16 w-16 text-gray-900/50" />
      </div>
    );
  }

  return (
    <main>
      <div
        className="flex justify-center items-center py-4"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <Typography className="mt-2" variant="h4">
          Detalhes da equipa
        </Typography>
      </div>
      <div
        className="grid grid-cols-3 w-full sm:gap-7 gap-4 p-3"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div className="flex-1">
          <Card className="mt-6 w-full">
            <CardBody>
              <Typography color="blue-gray" className="mb-2">
                Equipa:
              </Typography>
              <p className="text-gray-600 ">
                Nome completo:{" "}
                <span className="text-black">{data?.equipa?.nome}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Cor Equipa:{" "}
                <span
                  className="rounded-md px-24"
                  style={{ backgroundColor: data?.equipa?.cor_equipa }}
                >
                  &nbsp;
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Empresa:
                <span className="text-black"> {empresa?.empresa?.nome}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Departamento:
                <span className="text-black">
                  {" "}
                  {departamento?.departamento?.nome}
                </span>
              </p>
              <br />
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
        </div>
        <div className="flex-1">
          <Card className="mt-6 w-full">
            <CardBody>
              <Typography color="blue-gray" className="mb-2">
                Chefe Equipa:{" "}
              </Typography>
              <p className="text-gray-600 ">
                Nome completo:{" "}
                <span className="text-black">
                  {(() => {
                    const chefesFiltrados =
                      todoschefe?.chefesEquipa?.filter(
                        (chefe) => chefe.equipa_id === data?.equipa?.equipa_id
                      ) ?? [];

                    return chefesFiltrados.length > 0 ? (
                      chefesFiltrados.map((chefe) => (
                        <span key={chefe.funcionario_id}>
                          {chefe.funcionario.nome_completo}
                        </span>
                      ))
                    ) : (
                      <div className="text-black">Não tem chefe de equipa</div>
                    );
                  })()}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Responsável Departamento:{" "}
                <span className="text-black">
                  {responsavel &&
                  responsavel.responsaveldepartamento?.length > 0 ? (
                    responsavel.responsaveldepartamento.map((responsavel) => (
                      <div key={responsavel.funcionario_id}>
                        {responsavel.funcionario.nome_completo}
                      </div>
                    ))
                  ) : (
                    <div className="text-black">
                      Não tem responsável de departamento
                    </div>
                  )}
                </span>
              </p>
              <br />
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
        </div>
        <div className="flex-1">
          <Card className="mt-6 w-full">
            <CardBody>
              <Typography color="blue-gray" className="mb-2">
                Funcionários:{" "}
              </Typography>
              <p className="text-gray-600 ">
                {funcionario?.funcionarios?.map((funcionarios) => (
                  <div className=" rounded-md w-96">
                    <div
                      className="mt-2 m-2 text-gray-700"
                      key={funcionarios.funcionario_id}
                    >
                      {funcionarios.nome_completo}
                    </div>
                    <hr></hr>
                  </div>
                ))}
              </p>
              <div className="bg-gray-200 rounded-md">
                <div className="mt2 "></div>
              </div>

              <br />
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
        </div>
      </div>
      <div className="flex ml-4 mt-10 gap-10 w-1/5">
        <Select
          label="Filtrar por cliente"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          value={String(ClienteID)}
          onChange={(value) => setClienteID(Number(value))}
        >
          {clientesData && clientesData?.clientes.length > 0 ? (
            clientesData?.clientes?.map((cliente) => (
              <Option
                key={cliente?.cliente_id}
                value={String(cliente?.cliente_id)}
              >
                {cliente?.nome_completo}
              </Option>
            ))
          ) : (
            <Option value="">Sem clientes</Option>
          )}
        </Select>
        <Select
          label="Filtrar por estado da visita"
          onChange={(value: any) => setEstado(value)}
        >
          <Option value="">Todos</Option>
          <Option value="cancelada">Cancelada</Option>
          <Option value="terminada">Terminada</Option>
        </Select>
        <Input
          type="date"
          label="Filtrar até a data:"
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />

        <div className="flex">
          <Button
            style={{ backgroundColor: "#0F124C", width: "200px" }}
            onClick={clearfilters}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      <CardGrid className="gap-2">
        {visitasFiltradas?.map((visita) => (
          <CardGrid key={visita.visita_id}>
            <Card
              className="border-l-8 flex rounded-s shadow-2xl

"
              style={
                visita.estado_servico === "terminada"
                  ? { borderColor: "#95d7b0" }
                  : visita.estado_servico === "cancelada"
                  ? { borderColor: "#fa7f72" }
                  : visita.estado_servico === "agendada"
                  ? { borderColor: "#4682b4" }
                  : visita.estado_servico === "nao aprovada"
                  ? { borderColor: "#CE5959" }
                  : visita.estado_servico === "a aguardar"
                  ? { borderColor: "#B6BBC4" }
                  : visita.estado_servico === "pendente"
                  ? { borderColor: "#0F124C" }
                  : { backgroundColor: "#B6BBC4" }
              }
            >
              <CardHeader className="flex">
                <Link
                  href={{
                    pathname: "/detalhes/detalhevisita",
                    query: { id: visita.agenda_servico_id },
                  }}
                >
                  <ChevronRightIcon className="ml-80 mt-2 h-6 w-6 text-black" />
                </Link>
              </CardHeader>
              <CardBody>
                <span className="font-semibold py-1 ">Nome: </span>
                <span>
                  {visita?.servicos?.map((servico) => (
                    <span key={servico?.nome}>{servico?.nome}</span>
                  ))}
                </span>
                <div className="py-1">
                  <span className="font-semibold">Data:</span>{" "}
                  {visita?.data_visita}
                </div>
                <div className="py-1">
                  <span className="font-semibold">Hora de Início:</span>{" "}
                  {visita?.hora_visita_inicio?.split(":").slice(0, 2).join(":")}{" "}
                  {" -"}{" "}
                  {visita?.hora_visita_fim?.split(":").slice(0, 2).join(":")}
                </div>
                <div className="py-1">
                  <span className="font-semibold">Estado:</span>{" "}
                  {visita?.estado_servico}
                </div>
                <div className="py-1">
                  <span className="font-semibold">Cliente:</span>{" "}
                  {visita?.contrato?.cliente?.nome_completo}
                </div>
              </CardBody>
            </Card>
          </CardGrid>
        ))}
      </CardGrid>
      <br />
    </main>
  );
}
