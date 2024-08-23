import { AuthContext } from "@/common/components/AuthContext";
import CriarContaModal from "@/common/components/createcontautilizador";
import CriarClienteModal from "@/common/components/criarcliente";
import DetalheClienteModal from "@/common/components/detalhecliente";
import UpdateClienteModal from "@/common/components/updatecliente";
import api from "@/common/services/api";
import {
  LockClosedIcon,
  PencilSquareIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  Input,
  Option,
  Select,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import router from "next/router";
import { useContext, useEffect, useState } from "react";

interface Data {
  Status: string;
  clientes: {
    cliente_id: number;
    nome_completo: string;
    nif: string;
    email: string;
    ativo: boolean;
    contacto: string;
    morada: string;
    localidade: string;
    cod_postal: string;
  }[];
}

interface Contrato {
  Status: string;
  contratos: {
    contrato_id: number;
    cliente_id: number;
    data_inicio: string;
    data_fim: string;
    valor: number;
    ativo: boolean;
    nome: string;
  }[];
}

interface Conta {
  Status: string;
  contasFuncionarios: {
    conta_utilizador_id: number;
    email: string;
    ativo: boolean;
    cliente_id: number;
    criado_por_id: number;
    funcionario_id: number;
    tipo_utilizador: string;
    funcionario: {
      nome_completo: string;
    };
  }[];
  contasClientes: {
    conta_utilizador_id: number;
    email: string;
    ativo: boolean;
    cliente_id: number;
    criado_por_id: number;
    funcionario_id: number;
    tipo_utilizador: string;
    cliente: {
      nome_completo: string;
    };
  }[];
  contadupla: {
    conta_utilizador_id: number;
    email: string;
    ativo: boolean;
    cliente_id: number;
    criado_por_id: number;
    funcionario_id: number;
    tipo_utilizador: string;
    cliente: {
      nome_completo: string;
    };
    funcionario: {
      nome_completo: string;
    };
  }[];
}

const TABLE_HEAD = ["Nome", "Email", "Contacto", "Conta", "Ações"];

export default function DefaultTable() {
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [servicesData, setServicesData] = useState<Conta | null>(null);
  const [Contratos, setContratos] = useState<Contrato | null>(null);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [filterType, setFilterType] = useState("Nome");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const data = useContext(AuthContext);

  useEffect(() => {
    if (
      data?.user?.tipo_utilizador !== "nivel4" &&
      data?.user?.tipo_utilizador !== "nivel5"
    ) {
      router.push("/permissiondenied");
    }
    loadData();
    loadData2();
    loadData3();
  }, [updateKey]);

  useEffect(() => {
    if (serviceData !== null) {
      // Aqui você pode executar qualquer ação que dependa dos dados carregados
      console.log("Dados carregados:", serviceData);
    }
  }, [serviceData, Contratos]);

  useEffect(() => {
    loadData();
  }, [showModalCreate]);

  useEffect(() => {
    loadData();
  }, [showModalUpdate]);

  useEffect(() => {
    loadData();
  }, [showModalDetalhes]);

  async function toggleUserSelection(id: number, isChecked: boolean) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/cliente/setAcesso/${id}`);

        if (response.data.Status === "Success") {
          setServiceData(response.data);
          setRefresh(!refresh);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function toggleUserSelection2(id: number, isChecked: boolean) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/contautilizador/setAcesso/${id}`);

        if (response.data.Status === "Success") {
          setServicesData(response.data);
          setRefresh(!refresh);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/cliente/get");
        const clientes = response.data.clientes.map((cliente: any) => ({
          ...cliente,
          isSelected: false,
        }));
        if (response.status === 200) {
          setIsLoading(false);

          setServiceData({ Status: response.data.Status, clientes });
          console.log("data: ", serviceData);
        }
        const response2 = await api.get("contrato/get");

        const contratos = response2.data.contratos.map((contrato: any) => ({
          ...contrato,
          isSelected: false,
        }));
        if (response2.status === 200) {
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function loadData2() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("contautilizador/todasAsContas", {
          empresa_id: data?.user?.funcionario?.empresa_id,
        });

        if (response.status === 200) {
          setIsLoading(false);

          setServicesData(response.data);
          console.log("Contas: ", servicesData);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function loadData3() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("contrato/get");
        const contratos = response.data.contratos.map((contrato: any) => ({
          ...contrato,
          isSelected: false,
        }));
        if (response.status === 200) {
          setIsLoading(false);

          setContratos({ Status: response.data.Status, contratos });
          console.log("abc: ", Contratos);
        }

        const response2 = await api.get("visita/getAll");
        console.log("Visitas: ", response2.data);
      } catch (error) {
        console.log(error);
      }
    }
  }

  function splitName(fullName: string) {
    const name = fullName.split(" ");
    return `${name[0]} ${name[name.length - 1]}`;
  }

  function filterData(clientes: any[]) {
    return clientes.filter((cliente) => {
      const { nome_completo, email, contacto, morada, localidade, cod_postal } =
        cliente;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome_completo.toLowerCase().includes(searchTerm);
        case "Email":
          return email.toLowerCase().includes(searchTerm);
        case "Contacto":
          return contacto.toString().includes(searchTerm);
        case "Morada":
          return `${morada}, ${localidade}, ${cod_postal}`
            .toLowerCase()
            .includes(searchTerm);
        default:
          return false;
      }
    });
  }

  function ToggleButton({ initialState = false, onChange }: any) {
    const [isChecked, setIsChecked] = useState(initialState);

    const handleClick = () => {
      setIsChecked(!isChecked);
      onChange(!isChecked); // Chama a função de retorno de chamada com o novo estado
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

  function onEventClick(data: any) {
    router.push({
      pathname: "/detalhes/detalhecliente",
      query: {
        id: serviceData?.clientes?.[data]?.cliente_id,
      },
    });
  }

  function ToggleButton2({ initialState = false, onChange }: any) {
    const [isChecked, setIsChecked] = useState(initialState);

    const handleClick = () => {
      setIsChecked(!isChecked);
      onChange(!isChecked); // Chama a função de retorno de chamada com o novo estado
    };

    return (
      <label className="inline-flex items-center ml-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleClick}
          className="hidden"
        />
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
            isChecked ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isChecked ? (
            <svg
              className="w-4 h-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 15.172l-3.586-3.586-1.414 1.414L10 18l9-9-1.414-1.414L10 15.172z" />
            </svg>
          ) : (
            <div className="w-4 h-4"></div>
          )}
        </div>
      </label>
    );
  }

  return (
    <main>
      {isLoading && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      )}
      <Typography variant="h5" color="blue-gray" className="mb-2 p-7">
        Clientes
      </Typography>
      <div className="grid grid-cols-12 gap-4 ml-7 xl:gap-56  lg:gap-56">
        <div className="xl:col-span-1 lg:col-span-1 col-span-12 w-1/6">
          <Select
            label="Filtrar"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            value={filterType}
            defaultValue={"Nome"}
            onChange={(value) => setFilterType(String(value))}
          >
            <Option value="Nome">Nome</Option>
            <Option value="Email">Email</Option>
            <Option value="Contacto">Contacto</Option>
            <Option value="Morada">Morada</Option>
          </Select>
        </div>
        <div className="lg:col-span-3 lg:w- col-span-11 w-1/4 ">
          <Input
            label="Procurar"
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            icon={<i className="fas fa-heart" />}
          />
        </div>
        <div></div>
        <div className=" lg:ml-48 xl:ml-197">
          <Link href={"#"} onClick={() => setShowModalCreate(!showModalCreate)}>
            <Button className="grid grid-flow-col" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Cliente</span>
            </Button>
          </Link>
          <CriarClienteModal
            open={showModalCreate}
            setOpen={setShowModalCreate}
          />
        </div>
      </div>
      <br />
      <Card className="h-full w-full overflow-x-scroll">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={index}
                  className="border-b- px-24 py-4 "
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
            {filterData(serviceData?.clientes || []).map((cliente, index) => (
              <tr key={index}>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  <Link
                    href={{
                      query: {
                        id: serviceData?.clientes?.[index]?.cliente_id,
                      },
                      pathname: "/detalhes/detalhecliente",
                    }}
                  >
                    {splitName(cliente.nome_completo)}
                  </Link>
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {cliente.email}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {cliente.contacto}
                </td>

                <td className="px-22 py-4 border-b border-blue-gray-50">
                  {servicesData?.contasClientes
                    ? servicesData?.contasClientes.map((conta, index) => {
                        if (conta.cliente_id === cliente.cliente_id) {
                          return (
                            <span key={index}>
                              <ToggleButton2
                                initialState={conta.ativo} // Estado inicial do botão com base no estado do cliente
                                onChange={(isChecked: boolean) => {
                                  toggleUserSelection2(
                                    conta.conta_utilizador_id,
                                    isChecked
                                  ); // Função para alternar o estado do cliente
                                }}
                              />
                            </span>
                          );
                        }
                      })
                    : null}
                </td>
                <td className="px-18 py-4 border-b border-blue-gray-50">
                  <div className="font-medium flex items-center gap-2">
                    <Link
                      href={{
                        query: {
                          id: serviceData?.clientes?.[index]?.cliente_id,
                        },
                      }}
                      onClick={() =>
                        setShowModalUpdate(
                          (showModalUpdate) => !showModalUpdate
                        )
                      }
                    >
                      <PencilSquareIcon className="h-6 w-6" />
                    </Link>
                    <Link
                      href={{
                        query: {
                          id: serviceData?.clientes?.[index]?.cliente_id,
                        },
                        pathname: "/detalhes/detalhecliente",
                      }}
                    >
                      <UserIcon className="h-6 w-6" />
                    </Link>
                    <Link
                      href={{
                        query: {
                          id: serviceData?.clientes?.[index]?.cliente_id,
                        },
                      }}
                      onClick={() => setShowModal(!showModal)}
                    >
                      <LockClosedIcon className="h-6 w-6" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            <UpdateClienteModal
              open={showModalUpdate}
              setOpen={setShowModalUpdate}
            />
            <DetalheClienteModal
              open={showModalDetalhes}
              setOpen={setShowModalDetalhes}
            />
            <CriarContaModal
              open={showModal}
              setOpen={setShowModal}
              setUpdateKey={setUpdateKey}
            />
          </tbody>
        </table>
      </Card>
    </main>
  );
}
