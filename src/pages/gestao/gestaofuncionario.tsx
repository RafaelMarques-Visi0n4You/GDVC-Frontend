import { AuthContext } from "@/common/components/AuthContext";
import CriarContaModal from "@/common/components/createcontautilizador";
import CriarFuncionarioModal from "@/common/components/createfuncionario";
import DetalheFuncionarioModal from "@/common/components/detalhefuncionario";
import UpdateFuncionarioModal from "@/common/components/updatefuncionario";
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
  funcionarios: {
    ativo: boolean;
    cargo: string;
    cod_postal: string;
    contacto: string;
    criado_por: number;
    departamento_id: number;
    email: string;
    empresa_id: number;
    equipa_id: number;
    funcionario_id: number;
    morada: string;
    localidade: string;
    nome_completo: string;
    numero_mecanografico: string;
    equipa: {
      equipa_id: number;
      nome: string;
      data_criacao: string;
      ativo: boolean;
    };
  }[];
  equipas: {
    ativo: boolean;
    data_criacao: string;
    empresa_id: number;
    equipa_id: number;
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

const TABLE_HEAD = ["Número mecanográfico", "Nome", "Conta", "Ativo", "Ações"];

export default function DefaultTable() {
  const [serviceData, setServiceData] = useState<Data | null>(null);

  const [showModalCreateFuncionario, setShowModalCreateFuncionario] =
    useState(false);

  const [showModalAddFuncionario, setShowModalAddFuncionario] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);

  const [equipa, setEquipa] = useState<Data | null>(null);

  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [servicesData, setServicesData] = useState<Conta | null>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("Nome");
  const [isLoading, setIsLoading] = useState(true);
  const [updateId, setUpdateId] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const data = useContext(AuthContext);

  function filterData(funcionarios: any[]) {
    return funcionarios.filter((funcionario) => {
      const { nome_completo, numero_mecanografico, cargo, equipa_id } =
        funcionario;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome_completo.toLowerCase().includes(searchTerm);
        case "NumeroMecanografico":
          return numero_mecanografico.toString().includes(searchTerm);
        case "Cargo":
          return cargo.toLowerCase().includes(searchTerm);
        case "Equipa":
          const equipanome = equipa?.equipas?.find(
            (equipa) => equipa.equipa_id === funcionario.equipa_id
          )?.nome;
          return equipanome && equipanome.toLowerCase().includes(searchTerm);
        default:
          return false;
      }
    });
  }

  async function toggleUserSelection(id: number, isChecked: boolean) {
    console.log("botao clicado");
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/funcionario/setAcesso/${id}`);
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

  useEffect(() => {
    if (
      data?.user?.tipo_utilizador !== "nivel4" &&
      data?.user?.tipo_utilizador !== "nivel5"
    ) {
      router.push("/permissiondenied");
    }
    loadData();
  }, []);

  useEffect(() => {}, [
    updateKey,
    serviceData,
    showModalCreateFuncionario,
    refresh,
  ]);

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/funcionario/getfuncionarioempresa", {
          empresa_id: data.user.funcionario.empresa_id,
        });

        if (response.status === 200) {
          setServiceData(response.data);
          console.log(response.data);

          const response2 = await api.post("/equipa/get", {
            empresa_id: data.user.funcionario.empresa_id,
          });
          setEquipa(response2.data);
          console.log(response2.data);

          const response3 = await api.post("contautilizador/todasAsContas", {
            empresa_id: data?.user?.funcionario?.empresa_id,
          });

          setServicesData(response3.data);
          console.log("Contas: ", servicesData);

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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

  return (
    <main className="overflow-y-hidden">
      {isLoading && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      )}
      <Typography variant="h5" color="blue-gray" className="mb-2 p-7">
        Funcionários
      </Typography>
      <div className="grid grid-cols-12 gap-4 ml-7 xl:gap-56 lg:gap-56">
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
            <Option value="NumeroMecanografico">Número Mecanográfico</Option>
            <Option value="Cargo">Cargo</Option>
            <Option value="Equipa">Equipa</Option>
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
        <div className="lg:ml-40 xl:ml-137">
          <Link
            href={"#"}
            onClick={() =>
              setShowModalCreateFuncionario(!showModalCreateFuncionario)
            }
          >
            <Button className="grid grid-flow-col" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1 ml-1">Funcionário</span>
            </Button>
          </Link>
          <CriarFuncionarioModal
            open={showModalCreateFuncionario}
            setOpen={setShowModalCreateFuncionario}
          />
        </div>
      </div>
      <br />
      <Card className="h-full w-full overflow-y-hidden">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={index}
                  className="border-b-2 px-12 py-4 "
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
            {filterData(serviceData?.funcionarios || [])?.map(
              (funcionario, index) => (
                <tr key={index}>
                  <td className=" py-4 px-12 border-b border-blue-gray-50">
                    {funcionario.numero_mecanografico}
                  </td>
                  <td className=" py-4 px-12 border-b border-blue-gray-50">
                    {funcionario.nome_completo}
                  </td>

                  <td className="py-4 px-10 border-b border-blue-gray-50">
                    {servicesData?.contasFuncionarios
                      ? servicesData?.contasFuncionarios.map((conta, index) => {
                          if (
                            conta.funcionario_id === funcionario.funcionario_id
                          ) {
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
                  <td className=" py-4 px-10 border-b border-blue-gray-50">
                    <ToggleButton
                      initialState={funcionario.ativo}
                      onChange={(isChecked: boolean) =>
                        toggleUserSelection(
                          funcionario.funcionario_id,
                          isChecked
                        )
                      }
                    />
                  </td>
                  <td className=" py-4 px-12 border-b border-blue-gray-50">
                    <div
                      className="font-medium flex items-center gap-2"
                      style={{ paddingRight: "100px" }}
                    >
                      <Link
                        href={{
                          query: {
                            id:
                              serviceData?.funcionarios?.[index]
                                .funcionario_id ?? 0,
                          },
                        }}
                        onClick={() => {
                          {
                            setUpdateId(
                              serviceData?.funcionarios?.[index]
                                .funcionario_id ?? 0
                            );
                            setShowModalUpdate(!showModalUpdate);
                          }
                        }}
                      >
                        <PencilSquareIcon className="h-6 w-6" />
                      </Link>
                      <Link
                        href={{
                          query: {
                            id: serviceData?.funcionarios?.[index]
                              .funcionario_id,
                          },
                        }}
                        onClick={() => setShowModalDetails(!showModalDetails)}
                      >
                        <UserIcon className="h-6 w-6" />
                      </Link>
                      <Link
                        href={{
                          query: {
                            id2: serviceData?.funcionarios?.[index]
                              ?.funcionario_id,
                          },
                        }}
                        onClick={() => setShowModal(!showModal)}
                      >
                        <LockClosedIcon className="h-6 w-6" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            )}
            <UpdateFuncionarioModal
              open={showModalUpdate}
              setOpen={setShowModalUpdate}
              setUpdateKey={setUpdateKey}
              id={updateId}
            />
            <DetalheFuncionarioModal
              open={showModalDetails}
              setOpen={setShowModalDetails}
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
