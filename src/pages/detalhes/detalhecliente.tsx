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
import CriarContratoModal from "@/common/components/createcontrato";
import { getCookie } from "cookies-next";

import DetalheContratoModal from "@/common/components/detalhecontrato";
import UpdateClienteModal from "@/common/components/updatecliente";
import UpdateContratoModal from "@/common/components/updatecontrato";
import styled from "@emotion/styled";
import {
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Button, Input, Option, Select } from "@material-tailwind/react";
import Link from "next/link";

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
    agenda_servico_id: number;
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
      nome: string;
      cliente: {
        cliente_id: number;
      };
    };
  }[];
  cliente: {
    nome_completo: string;
    contacto: string;
    email: string;
    cod_postal: string;
    localidade: string;
    morada: string;
    nif: string;
    cliente_id: number;
  };
  contratos: {
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

const TABLE_HEAD = ["Nome", "Ativo", "Ações"];

export default function Home() {
  const router = useRouter();
  const id = router.query.id;
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visitas, setVisitas] = useState<Data | null>(null);
  const [contrato, setContrato] = useState<Data | null>(null);
  const user = useContext(AuthContext);
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [showModalCreateContrato, setShowModalCreateContrato] = useState(false);
  const [showModalCreateServiceTipe, setShowModalCreateServiceTipe] =
    useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalUpdate2, setShowModalUpdate2] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [clientesData, setClientesData] = useState<Data | null>(null); // Fix: Add 'clientesData' to the useState
  const [updateKey, setUpdateKey] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [estado, setEstado] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("Nome");
  const [contratoID, setContratoID] = useState(0);
  const [selectedContratoID, setSelectedContratoID] = useState<number | null>(
    null
  );

  const clienteID = Number(id);

  const visitasFiltradas = visitas?.visitas.filter((visita) => {
    const abc = visita.contrato.cliente.cliente_id === clienteID;

    const contratoMatches =
      selectedContratoID === null || visita.contrato_id === selectedContratoID;
    const estadoMatches = estado === "" || visita.estado_servico === estado;
    const selectedDates =
      selectedDate === null || new Date(visita.data_visita) <= selectedDate;

    return contratoMatches && estadoMatches && selectedDates && abc;
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

  useEffect(() => {
    loadData();
    loadData2();
  }, [
    showModalCreateContrato,
    showModalCreateServiceTipe,
    updateKey,
    clienteID,
    showModalUpdate,
  ]);

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
          id: clienteID,
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

  useEffect(() => {
    if (
      user?.user?.tipo_utilizador !== "nivel4" &&
      user?.user?.tipo_utilizador !== "nivel5"
    ) {
      router.push("/permissiondenied");
    }
    loadData();
    loadData2();
  }, [
    showModalCreateContrato,
    showModalCreateServiceTipe,
    updateKey,
    clienteID,
  ]);

  function clearfilters() {
    setSelectedContratoID(null);
    setSelectedDate(null);
    setEstado("");
  }

  async function toggleUserSelection(id: number, isChecked: boolean) {
    console.log("botao clicado");
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/contrato/setAcesso/${id}`);
        console.log(response.data);
        if (response.data.Status === "Success") {
          setServiceData(response.data);
          setRefresh(!refresh);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  function ToggleButton({ initialState = false, onChange }: any) {
    const [isChecked, setIsChecked] = useState(initialState);

    const handleClick = () => {
      setIsChecked(!isChecked);
      onChange(!isChecked);
    };

    return (
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleClick}
        />
        <div
          className={`relative w-12 h-6 rounded-full ${
            isChecked ? "bg-green-600" : "bg-red-200"
          }`}
        >
          <div
            className={`relative w-6 h-6 rounded-full bg-white transition-transform transform ${
              isChecked ? "translate-x-full" : ""
            }`}
          ></div>
        </div>
      </label>
    );
  }

  const contratosFiltrados = serviceData?.contratos?.filter(
    (contrato) => contrato?.cliente_id === clienteID
  );
  console.log("Contratos Filtrados:", contratosFiltrados);

  function filterData(contratos: any[]) {
    return contratos.filter((contrato) => {
      const { nome, tipo_contrato, data_inicio, data_fim, cliente } = contrato;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome.toLowerCase().includes(searchTerm);
        case "Tipo":
          return tipo_contrato.toLowerCase().includes(searchTerm);
        case "Duracao":
          return `${data_inicio}- ${data_fim}`.toString().includes(searchTerm);
        case "NomeCliente":
          return contrato.cliente?.nome_completo
            .toLowerCase()
            .includes(searchTerm);
        default:
          return false;
      }
    });
  }

  async function loadData2() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/contrato/getClientContract", {
          id: id,
        });
        if (response.status === 200) {
          console.log(response.data);
          setServiceData(response.data);
          console.log("Data12:", serviceData);

          const clientesresponse = await api.get("/cliente/get");
          console.log(clientesresponse.data);
          setClientesData(clientesresponse.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
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
    <main>
      <div
        className="flex justify-center items-center py-4"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <Typography className="mt-2" variant="h4">
          Detalhes do Cliente
        </Typography>
      </div>
      <div
        className="grid grid-cols-2 w-full sm:gap-7 gap-4 p-3"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div className="flex-1">
          <Card className="mt-6 w-full">
            <CardBody>
              <Typography color="blue-gray" className="mb-2 flex">
                Cliente:
                <Link
                  href={{
                    query: {
                      id: data?.cliente?.cliente_id,
                    },
                  }}
                  onClick={() => setShowModalUpdate2(!showModalUpdate2)}
                >
                  <PencilSquareIcon className="h-6 w-6 ml-1" />
                </Link>
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
              <br />
            </CardBody>
            <CardFooter className="pt-0"></CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-12 gap-4 ml-7 xl:gap-56 lg:gap-56">
            <div className="xl:col-span-1 lg:col-span-1 col-span-12 w-1/6"></div>
            <div className="lg:col-span-1 lg:w- w-1/4"></div>

            <div className="ml-24">
              <button
                onClick={() =>
                  setShowModalCreateContrato(!showModalCreateContrato)
                }
              >
                <Button className="grid grid-flow-col" variant="outlined">
                  <PlusIcon className="h-5 w-5" />
                  <span className="mt-1">Contrato</span>
                </Button>
              </button>
              <CriarContratoModal
                open={showModalCreateContrato}
                setOpen={setShowModalCreateContrato}
                cliente_id={clienteID}
                setUpdateKey={setUpdateKey}
              />
            </div>
          </div>

          <br />
          <Card className=" w-full overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head, index) => (
                    <th
                      key={index}
                      className="border-b- px-14 py-4"
                      style={{ backgroundColor: "#E0DFDF" }}
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal leading-none opacity-70"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterData(contrato?.contrato || []).map((contrato, index) => (
                  <tr key={contrato.contrato_id}>
                    <td className="px-14 py-4 border-b border-blue-gray-50">
                      {contrato?.nome}
                    </td>

                    <td className="px-14 py-4 border-b border-blue-gray-50">
                      <ToggleButton
                        initialState={contrato?.ativo}
                        onChange={(isChecked: boolean) =>
                          toggleUserSelection(contrato?.contrato_id, isChecked)
                        }
                      />
                    </td>
                    <td className="px-12 py-4 border-b border-blue-gray-50">
                      <div className="font-medium flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowModalUpdate(!showModalUpdate);
                            setContratoID(contrato?.contrato_id);
                          }}
                        >
                          <PencilSquareIcon className="h-6 w-6" />
                        </button>
                        <button
                          onClick={() => {
                            setShowModalDetalhes(!showModalDetalhes);
                            setContratoID(contrato?.contrato_id);
                          }}
                        >
                          <ClipboardDocumentListIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                <UpdateContratoModal
                  open={showModalUpdate}
                  setOpen={setShowModalUpdate}
                  setUpdateKey={setUpdateKey}
                  cliente_id={contratoID}
                />
                <DetalheContratoModal
                  open={showModalDetalhes}
                  setOpen={setShowModalDetalhes}
                  contrato_id={contratoID}
                />
              </tbody>
            </table>
          </Card>
        </div>
      </div>
      <div className="flex ml-4 mt-10 gap-10 w-1/5">
        <Select
          label="Filtrar"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          value={String(selectedContratoID)}
          onChange={(value) => setSelectedContratoID(Number(value))}
        >
          {contrato && contrato.contrato.length > 0 ? (
            contrato?.contrato?.map((contrato) => (
              <Option
                key={contrato?.contrato_id}
                value={String(contrato?.contrato_id)}
              >
                {contrato?.nome}
              </Option>
            ))
          ) : (
            <Option value="">Sem contratos</Option>
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
              className="border-l-8 flex rounded-s shadow-2xl"
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
                <span className="font-semibold text-black py-1 ">Nome: </span>
                <span>
                  {visita?.servicos?.map((servico) => (
                    <span key={servico.nome} className="text-black">
                      {servico.nome}
                    </span>
                  ))}
                </span>

                <div className="py-1">
                  <span className="font-semibold text-black">Data:</span>{" "}
                  <span className="text-black">{visita.data_visita}</span>
                </div>
                <div className="py-1">
                  <span className="font-semibold text-black">
                    Hora de Início:
                  </span>{" "}
                  <span className="text-black">
                    {visita.hora_visita_inicio.split(":").slice(0, 2).join(":")}{" "}
                    {" -"}{" "}
                    {visita.hora_visita_fim.split(":").slice(0, 2).join(":")}
                  </span>
                </div>
                <div className="py-1 text-black">
                  <span className="font-semibold text-black">Estado:</span>{" "}
                  {visita.estado_servico}
                </div>
                <div className="py-1 text-black">
                  <span className="font-semibold">Equipa:</span>{" "}
                  {visita.agenda_servico.equipa.nome}
                </div>
              </CardBody>
            </Card>
          </CardGrid>
        ))}
      </CardGrid>
      <br />
      <UpdateClienteModal
        open={showModalUpdate2}
        setOpen={setShowModalUpdate2}
      />
    </main>
  );
}
