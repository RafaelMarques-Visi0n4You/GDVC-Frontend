import { AuthContext } from "@/common/components/AuthContext";
import AssociarModal from "@/common/components/associartiposervicoequipa";
import CriarTipoServicoModal from "@/common/components/createtiposervico";
import CriarServicoModal from "@/common/components/criarservico";
import DetalheServicoModal from "@/common/components/detalheservico";
import UpdateServicoModal from "@/common/components/updateservico";
import api from "@/common/services/api";
import {
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
  servicos: {
    criado_por_id: number;
    data_criacao: string;
    descricao: string;
    empresa_id: number;
    nome: string;
    preco_hora: number;
    servico_id: number;
    tempo_estimado: number;
    tipo_servico_id: number;
    tipo_tempo_estimado: string;
    ultima_atualizacao: string;
    ativo: boolean;
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

const TABLE_HEAD = [
  "Nome",
  "Tipo",
  "Criado por",
  "Data criação",
  "Ativo",
  "Ações",
];

export default function DefaultTable() {
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [showModalCreateService, setShowModalCreateService] = useState(false);
  const [showModalCreateServiceTipe, setShowModalCreateServiceTipe] =
    useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [tiposervicoData, setTipoServicoData] = useState<Data | null>(null);
  const [contautilizadorData, setContaUtilizadorData] = useState<Data | null>(
    null
  );
  const [updateKey, setUpdateKey] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("Nome");
  const [createKey, setCreateKey] = useState(0);
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
  }, [showModalCreateService, showModalCreateServiceTipe, updateKey]);

  useEffect(() => {
    if (serviceData !== null) {
      // Aqui você pode executar qualquer ação que dependa dos dados carregados
      console.log("Dados carregados:", serviceData);
    }
  }, [serviceData]);

  async function toggleUserSelection(id: number, isChecked: boolean) {
    console.log("botao clicado");
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/servico/setAcesso/${id}`);
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

  function filterData(servicos: any[]) {
    return servicos.filter((servico) => {
      const { nome, tipo_id, criado_por_id, data_criacao } = servico;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome.toLowerCase().includes(searchTerm);
        case "Tipo":
          const TipoNome =
            tiposervicoData?.tipoServico.find(
              (tipo) => tipo.tipo_servico_id === servico.tipo_servico_id
            )?.nome || "";
          return TipoNome.toLowerCase().includes(searchTerm);
        case "DataCriacao":
          return data_criacao.toString().includes(searchTerm);
        case "CriadoPor":
          const CriadoPor =
            contautilizadorData?.contaUtilizadores.find(
              (conta) => conta.conta_utilizador_id === servico.criado_por_id
            )?.funcionario?.nome_completo || "";

          return CriadoPor.toLowerCase().includes(searchTerm);
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

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/servico/get");
        if (response.status === 200) {
          console.log(response.data);
          setServiceData(response.data);

          const response2 = await api.get("/tiposervico/get");
          console.log(response2.data);
          setTipoServicoData(response2.data);

          const response3 = await api.get("/contautilizador/get");
          console.log(response3.data);
          setContaUtilizadorData(response3.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
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
        Servicos
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
            <Option value="Tipo">Tipo</Option>
            <Option value="CriadoPor">Criado Por</Option>
            <Option value="DataCriacao">Data Criação</Option>
          </Select>
        </div>
        <div className="lg:col-span-1 xl:col-span-2 w-1/4 ">
          <Input
            label="Procurar"
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            icon={<i className="fas fa-heart" />}
          />
        </div>
        <div className="flex xl:ml-251 lg:ml-136">
          <Link
            href={"#"}
            onClick={() =>
              setShowModalCreateServiceTipe(!showModalCreateServiceTipe)
            }
          >
            <Button className="grid grid-flow-col w-60" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Criar Categoria Serviço</span>
            </Button>
          </Link>
          <CriarTipoServicoModal
            open={showModalCreateServiceTipe}
            setOpen={setShowModalCreateServiceTipe}
          />
        </div>
        <div className=" lg:ml-36 xl:ml-250">
          <Link
            href={"#"}
            onClick={() => setShowModalCreateService(!showModalCreateService)}
          >
            <Button className="grid grid-flow-col w-32" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Serviço</span>
            </Button>
          </Link>
          <CriarServicoModal
            open={showModalCreateService}
            setOpen={setShowModalCreateService}
          />
        </div>
        <div className="xl:ml-32 lg:ml-80">
          <Link href={"#"} onClick={() => setShowModal(!showModal)}>
            <Button className="grid grid-flow-col w-56" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Associar Tipo Serviço</span>
            </Button>
          </Link>
          <AssociarModal open={showModal} setOpen={setShowModal} />
        </div>
      </div>
      <br />
      <Card className="h-full w-full overflow-x-scrol">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={index}
                  className="border-b- px-12 py-4 "
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
            {filterData(serviceData?.servicos || [])?.map((servico, index) => (
              <tr key={index}>
                <td className="px-12 py-4 border-b border-blue-gray-50">
                  {servico?.nome}
                </td>
                <td className="px-12 py-4 border-b border-blue-gray-50">
                  {tiposervicoData?.tipoServico
                    .filter(
                      (tipoServico: { tipo_servico_id: number }) =>
                        tipoServico.tipo_servico_id === servico.tipo_servico_id
                    )
                    .map((departamento, index) => (
                      <span key={index}>{departamento.nome}</span>
                    ))}
                </td>
                <td className="px-12 py-4 border-b border-blue-gray-50">
                  {contautilizadorData?.contaUtilizadores
                    .filter(
                      (contaUtilizadores: { conta_utilizador_id: number }) =>
                        contaUtilizadores.conta_utilizador_id ===
                        servico.criado_por_id
                    )
                    .map((contaUtilizadores, index2) => (
                      <span key={index2}>
                        {contaUtilizadores?.funcionario?.nome_completo}
                      </span>
                    ))}
                </td>
                <td className="px-12 py-4 border-b border-blue-gray-50">
                  {servico.data_criacao.slice(0, 10)}
                </td>
                <td className="px-12 py-4 border-b border-blue-gray-50">
                  <ToggleButton
                    initialState={servico.ativo} // Estado inicial do botão com base no estado do cliente
                    onChange={(isChecked: boolean) => {
                      toggleUserSelection(servico.servico_id, isChecked); // Função para alternar o estado do cliente
                    }}
                  />
                </td>
                <td className="px-10 py-4 border-b border-blue-gray-50">
                  <div className="font-medium flex items-center gap-2">
                    <Link
                      href={{
                        query: {
                          id: serviceData?.servicos?.[index]?.servico_id,
                        },
                      }}
                      onClick={() => setShowModalUpdate(!showModalUpdate)}
                    >
                      <PencilSquareIcon className="h-6 w-6" />
                    </Link>
                    <Link
                      href={{
                        query: {
                          id: serviceData?.servicos?.[index]?.servico_id,
                        },
                      }}
                      onClick={() => setShowModalDetalhes(!showModalDetalhes)}
                    >
                      <UserGroupIcon className="h-6 w-6" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            <UpdateServicoModal
              open={showModalUpdate}
              setOpen={setShowModalUpdate}
              setUpdateKey={setUpdateKey}
            />
            <DetalheServicoModal
              open={showModalDetalhes}
              setOpen={setShowModalDetalhes}
            />
          </tbody>
        </table>
      </Card>
    </main>
  );
}
