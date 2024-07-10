import { AuthContext } from "@/common/components/AuthContext";
import AddFuncionarioEquipaModal from "@/common/components/addfuncionarioequipa";
import CriarChefeEquipaModal from "@/common/components/createchefeequipa";
import CriarDepartamentoModal from "@/common/components/createdepartamento";
import CriarEquipaModal from "@/common/components/criarequipa";
import DetalheEquipaModal from "@/common/components/detalheequipa";
import UpdateEquipaModal from "@/common/components/updateequipa";
import api from "@/common/services/api";
import {
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon,
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
  equipas: {
    equipa_id: number;
    empresa_id: number;
    nome: string;
    criado_por_id: number;
    ativo: boolean;
    cor_equipa: string;
    data_criacao: string;
    departamento_id: number;
  }[];
  departamentos: {
    departamento_id: number;
    nome: string;
  }[];
  empresas: {
    empresa_id: number;
    nome: string;
  }[];
  chefesEquipa: {
    funcionario_id: number;
    equipa_id: number;
    funcionario: {
      nome_completo: string;
    };
  }[];
}

const TABLE_HEAD = [
  "Nome",
  "Data Criação",
  "Departamento",
  "Chefe Equipa",
  "Ativo",
  "Ações",
];

export default function DefaultTable() {
  const [ativo, setAtivo] = useState<Data | null>(null);
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [departamentos, setDepartamentos] = useState<Data | null>(null);
  const [showModalCreateEquipa, setShowModalCreateEquipa] = useState(false);
  const [showModalCreateChefeEquipa, setShowModalCreateChefeEquipa] =
    useState(false);
  const [showModalAddFuncionario, setShowModalAddFuncionario] = useState(false);
  const [showModalDetails, setShowModalDetails] = useState(false);
  const [chefeEquipa, setChefeEquipa] = useState<Data | null>(null);
  const [empresa, setEmpresa] = useState<Data | null>(null);
  const [selectedUser, setSelectedUser] = useState([]);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [showModalCreateDepartamento, setShowModalCreateDepartamento] =
    useState(false);
  const [filterType, setFilterType] = useState("Nome");
  const [searchText, setSearchText] = useState("");
  const [chefeEquipaId, setChefeEquipaId] = useState(0);
  const [detalhesId, setDetalhesId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [funcionarioId, setFuncionarioId] = useState(0);

  const data = useContext(AuthContext);

  async function toggleUserSelection(id: number, isChecked: boolean) {
    console.log("botao clicado");
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/equipa/setAcesso/${id}`);
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

  useEffect(() => {
    if (data?.user?.tipo_utilizador !== "nivel4") {
      router.push("/permissiondenied");
    }
    console.log(updateKey);
    loadData(); // Chama loadData pela primeira vez
  }, [
    showModalUpdate,
    refresh,
    showModalCreateEquipa,
    showModalCreateChefeEquipa,
    updateKey,
  ]);

  useEffect(() => {
    if (serviceData !== null) {
      // Aqui você pode executar qualquer ação que dependa dos dados carregados
      console.log("Dados carregados:", serviceData);
    }
  }, [serviceData]);

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/equipa/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        if (response.status === 200) {
          setServiceData(response.data);

          const responseDeparamentos = await api.post("/departamento/get", {
            empresa_id: data.user.funcionario.empresa_id,
          });

          setDepartamentos(responseDeparamentos.data);

          const responseEmpresas = await api.post("/empresa/get", {
            empresa_id: data.user.funcionario.empresa_id,
          });
          setEmpresa(responseEmpresas.data);

          const responseChefeEquipa = await api.get("/chefeequipa/get");
          setChefeEquipa(responseChefeEquipa.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  function filterData(equipas: any[]) {
    return equipas.filter((equipa) => {
      const { nome, data_criacao, departamento_id, chefesEquipa } = equipa;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome.toLowerCase().includes(searchTerm);
        case "Departamento":
          const departamentoNome =
            departamentos?.departamentos.find(
              (departamento) => departamento.departamento_id === departamento_id
            )?.nome || "";
          return departamentoNome.toLowerCase().includes(searchTerm);
        case "DataCriacao":
          return data_criacao.toString().includes(searchTerm);
        case "ChefeEquipa":
          const chefesEquipaNomes = chefeEquipa?.chefesEquipa.find(
            (chefe) => chefe.equipa_id === equipa.equipa_id
          )?.funcionario.nome_completo;
          return (
            chefesEquipaNomes &&
            chefesEquipaNomes.toLowerCase().includes(searchTerm)
          );
        default:
          return false;
      }
    });
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
        Equipas
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
            <Option value="DataCriacao">Data Criação</Option>
            <Option value="Departamento">Departamento</Option>
            <Option value="ChefeEquipa">Chefe Equipa</Option>
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
        <div className=" flex xl:ml-152 lg:ml-56">
          <Link
            href={"#"}
            onClick={() =>
              setShowModalCreateDepartamento(!showModalCreateDepartamento)
            }
          >
            <Button className="grid grid-flow-col w-48" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1 ml-1">Departamento</span>
            </Button>
          </Link>
          <CriarDepartamentoModal
            open={showModalCreateDepartamento}
            setOpen={setShowModalCreateDepartamento}
          />
        </div>
        <div className=" lg:ml-52 xl:ml-148">
          <Link
            href={"#"}
            onClick={() => setShowModalCreateEquipa(!showModalCreateEquipa)}
          >
            <Button className="grid grid-flow-col" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Equipa</span>
            </Button>
          </Link>

          <CriarEquipaModal
            open={showModalCreateEquipa}
            setOpen={setShowModalCreateEquipa}
          />
        </div>
      </div>
      <br />
      <Card className="h-full w-full overflow-y-scroll">
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
            {filterData(serviceData?.equipas || [])?.map((equipa, index) => (
              <tr key={index}>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {equipa.nome}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {equipa.data_criacao.split("T")[0]}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {departamentos?.departamentos
                    .filter(
                      (departamento: { departamento_id: number }) =>
                        departamento.departamento_id === equipa.departamento_id
                    )
                    .map((departamento, index2) => (
                      <span key={index2}>{departamento.nome}</span>
                    ))}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {chefeEquipa && (
                    <Link
                      href={{
                        query: {
                          id: serviceData?.equipas?.[index]?.equipa_id ?? 0,
                        },
                      }}
                      onClick={() => {
                        setChefeEquipaId(
                          serviceData?.equipas?.[index]?.equipa_id ?? 0
                        ),
                          setShowModalCreateChefeEquipa(
                            !showModalCreateChefeEquipa
                          );
                      }}
                    >
                      {chefeEquipa.chefesEquipa.some(
                        (chefe) => chefe.equipa_id === equipa.equipa_id
                      ) ? (
                        chefeEquipa.chefesEquipa
                          .filter(
                            (chefe) => chefe.equipa_id === equipa.equipa_id
                          )
                          .map((chefe, index) => (
                            <span key={index}>
                              {chefe.funcionario.nome_completo}
                            </span>
                          ))
                      ) : (
                        <span>Sem chefe de equipa</span>
                      )}
                    </Link>
                  )}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  <ToggleButton
                    initialState={equipa.ativo}
                    onChange={(isChecked: boolean) => {
                      toggleUserSelection(equipa.equipa_id, isChecked);
                    }}
                  />
                </td>
                <td className="px-18 py-4 border-b border-blue-gray-50">
                  <div className="font-medium flex items-center gap-2">
                    <Link
                      href={{
                        query: {
                          id: serviceData?.equipas?.[index]?.equipa_id,
                        },
                      }}
                      onClick={() => setShowModalUpdate(!showModalUpdate)}
                    >
                      <PencilSquareIcon className="h-6 w-6" />
                    </Link>
                    <Link
                      href={{
                        query: {
                          id: serviceData?.equipas?.[index]?.equipa_id ?? 0,
                        },
                      }}
                      onClick={() => {
                        setFuncionarioId(
                          serviceData?.equipas?.[index]?.equipa_id ?? 0
                        ),
                          setShowModalAddFuncionario(!showModalAddFuncionario);
                      }}
                    >
                      <UserGroupIcon className="h-6 w-6" />
                    </Link>
                    <Link
                      href={{
                        query: {
                          id: serviceData?.equipas?.[index]?.equipa_id,
                        },
                      }}
                      onClick={() => {
                        {
                          setDetalhesId(
                            serviceData?.equipas?.[index]?.equipa_id ?? 0
                          );
                          setShowModalDetails(!showModalDetails);
                        }
                      }}
                    >
                      <ClipboardDocumentListIcon className="h-6 w-6" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            <CriarChefeEquipaModal
              open={showModalCreateChefeEquipa}
              setOpen={setShowModalCreateChefeEquipa}
              id={chefeEquipaId}
            />
            <AddFuncionarioEquipaModal
              open={showModalAddFuncionario}
              setOpen={setShowModalAddFuncionario}
              setUpdateKey={setUpdateKey}
              id={funcionarioId}
            />
            <UpdateEquipaModal
              open={showModalUpdate}
              setOpen={setShowModalUpdate}
              setUpdateKey={setUpdateKey}
            />
            <DetalheEquipaModal
              open={showModalDetails}
              setOpen={setShowModalDetails}
              id={detalhesId}
            />
          </tbody>
        </table>
      </Card>
    </main>
  );
}
