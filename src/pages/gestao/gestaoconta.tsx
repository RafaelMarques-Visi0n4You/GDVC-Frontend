import { AuthContext } from "@/common/components/AuthContext";
import CriarContaModal from "@/common/components/createcontautilizador";
import UpdateContaModal from "@/common/components/updateconta";
import api from "@/common/services/api";
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
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

const TABLE_HEAD = ["Nome", "Email", "Tipo de utilizador", "Ativo", "Ações"];

export default function DefaultTable() {
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);

  const [refresh, setRefresh] = useState(false);
  const [filterType, setFilterType] = useState("Nome");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [clienteData, setClienteData] = useState<Data | null>(null);
  const [detalhesId, setDetalhesId] = useState(0);
  const uniqueIds = new Set();
  const data = useContext(AuthContext);

  useEffect(() => {
    if (data?.user?.tipo_utilizador !== "nivel4") {
      router.push("/permissiondenied");
    }
    loadData();
  }, []);

  useEffect(() => {
    if (serviceData !== null) {
      // Aqui você pode executar qualquer ação que dependa dos dados carregados
      console.log("Dados carregados11:", serviceData);
    }
  }, [serviceData]);

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
        const response = await api.put(`/contautilizador/setAcesso/${id}`);

        if (response.data.Status === "Success") {
          setServiceData(response.data);
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
        const response = await api.post("contautilizador/todasAsContas", {
          empresa_id: data?.user?.funcionario?.empresa_id,
        });

        if (response.status === 200) {
          setIsLoading(false);

          setServiceData(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  function filterData(contas: any[]) {
    return contas.filter((conta) => {
      const { nome_completo, email, tipo_utilizador } = conta;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          const nome =
            conta.funcionario?.nome_completo ||
            conta.cliente?.nome_completo ||
            "N/A";
          return nome.toLowerCase().includes(searchTerm);
        case "Email":
          return email.toLowerCase().includes(searchTerm);
        case "TipoUtilizador":
          return tipo_utilizador.toLowerCase().includes(searchTerm);
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
        Conta utilizadores
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
            <Option value="TipoUtilizador">Tipo de Utilizador</Option>
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
        <div className=" lg:ml-52 xl:ml-197">
          <Link
            href={"#"}
            onClick={() =>
              setShowModalCreate((showModalCreate) => !showModalCreate)
            }
          >
            <Button className="grid grid-flow-col" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Conta</span>
            </Button>
          </Link>
          <CriarContaModal
            open={showModalCreate}
            setOpen={setShowModalCreate}
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
                  className="border-b- px-20 py-4 "
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
            {Array.from(
              new Set(
                filterData([
                  ...(serviceData?.contasFuncionarios || []),
                  ...(serviceData?.contadupla || []),
                  ...(serviceData?.contasClientes || []),
                ]).map((conta) => conta.conta_utilizador_id)
              )
            ).map((uniqueId, index) => {
              const conta = filterData([
                ...(serviceData?.contasFuncionarios || []),
                ...(serviceData?.contadupla || []),
                ...(serviceData?.contasClientes || []),
              ]).find((conta) => conta.conta_utilizador_id === uniqueId);
              return (
                <tr key={index}>
                  <td className="px-20 py-4 border-b border-blue-gray-50">
                    {conta.funcionario?.nome_completo ||
                      conta.cliente?.nome_completo ||
                      "N/A"}
                  </td>
                  <td className="px-20 py-4 border-b border-blue-gray-50">
                    {conta.email}
                  </td>
                  <td className="px-20 py-4 border-b border-blue-gray-50">
                    {conta.tipo_utilizador}
                  </td>

                  <td className="px-20 py-4 border-b border-blue-gray-50">
                    <ToggleButton
                      initialState={conta.ativo} // Estado inicial do botão com base no estado do cliente
                      onChange={(isChecked: boolean) => {
                        toggleUserSelection(
                          conta.conta_utilizador_id,
                          isChecked
                        ); // Função para alternar o estado do cliente
                      }}
                    />
                  </td>
                  <td className="px-22 py-4 border-b border-blue-gray-50">
                    <div className="font-medium flex items-center gap-2">
                      <Link
                        href={{
                          query: {
                            id: conta.conta_utilizador_id,
                          },
                        }}
                        onClick={() => {
                          {
                            setDetalhesId(conta.conta_utilizador_id ?? 0);
                            setShowModalUpdate(!showModalUpdate);
                          }
                        }}
                      >
                        <PencilSquareIcon className="h-6 w-6" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            <UpdateContaModal
              open={showModalUpdate}
              setOpen={setShowModalUpdate}
              id={detalhesId}
            />
          </tbody>
        </table>
      </Card>
    </main>
  );
}
