import { AuthContext } from "@/common/components/AuthContext";
import CriarContratoModal from "@/common/components/createcontrato";

import DetalheContratoModal from "@/common/components/detalhecontrato";
import UpdateContratoModal from "@/common/components/updatecontrato";
import api from "@/common/services/api";
import {
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  PlusIcon,
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

const TABLE_HEAD = [
  "Nome",
  "Tipo",
  "Duração",
  "Nome Cliente",
  "Ativo",
  "Ações",
];

export default function DefaultTable() {
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [showModalCreateContrato, setShowModalCreateContrato] = useState(false);
  const [showModalCreateServiceTipe, setShowModalCreateServiceTipe] =
    useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showModalDetalhes, setShowModalDetalhes] = useState(false);
  const [clientesData, setClientesData] = useState<Data | null>(null); // Fix: Add 'clientesData' to the useState
  const [updateKey, setUpdateKey] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("Nome");
  const [isLoading, setIsLoading] = useState(true);
  const data = useContext(AuthContext);

  useEffect(() => {
    if (
      data?.user?.tipo_utilizador !== "nivel4" &&
      data?.user?.tipo_utilizador !== "nivel5"
    ) {
      router.push("/permissiondenied");
    }
    loadData();
  }, [showModalCreateContrato, showModalCreateServiceTipe, updateKey]);

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

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/contrato/get");
        if (response.status === 200) {
          console.log(response.data);
          setServiceData(response.data);

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

  return (
    <main className="overflow-hidden">
      {isLoading && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      )}
      <Typography variant="h5" color="blue-gray" className="mb-2 p-7">
        Contratos
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
            <Option value="Duracao">Duração</Option>
            <Option value="NomeCliente">Nome Cliente</Option>
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

        <div className="flex lg:ml-101 xl:ml-200">
          <Link
            href={"#"}
            onClick={() => setShowModalCreateContrato(!showModalCreateContrato)}
          >
            <Button className="grid grid-flow-col" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Contrato</span>
            </Button>
          </Link>
          <CriarContratoModal
            open={showModalCreateContrato}
            setOpen={setShowModalCreateContrato}
          />
        </div>
      </div>
      <br />
      <Card className="h-full w-full overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head, index) => (
                <th
                  key={index}
                  className="border-b- px-14 py-4 "
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
            {filterData(serviceData?.contratos || [])?.map(
              (contrato, index) => (
                <tr key={index}>
                  <td className="px-14  py-4 border-b border-blue-gray-50">
                    {contrato?.nome}
                  </td>
                  <td className="px-14  py-4 border-b border-blue-gray-50">
                    {contrato?.tipo_contrato}
                  </td>
                  <td className="px-14  py-4 border-b border-blue-gray-50 ">
                    {contrato?.data_inicio} - {contrato?.data_fim}
                  </td>
                  <td className="px-14  py-4 border-b border-blue-gray-50">
                    {contrato?.cliente?.nome_completo}
                  </td>
                  <td className="px-14  py-4 border-b border-blue-gray-50">
                    <ToggleButton
                      initialState={contrato?.ativo}
                      onChange={(isChecked: boolean) =>
                        toggleUserSelection(contrato?.contrato_id, isChecked)
                      }
                    />
                  </td>
                  <td className="px-12 py-4 border-b border-blue-gray-50">
                    <div className="font-medium flex items-center gap-2">
                      <Link
                        href={{
                          query: {
                            id: serviceData?.contratos?.[index]?.contrato_id,
                          },
                        }}
                        onClick={() => setShowModalUpdate(!showModalUpdate)}
                      >
                        <PencilSquareIcon className="h-6 w-6" />
                      </Link>
                      <Link
                        href={{
                          query: {
                            id: serviceData?.contratos?.[index]?.contrato_id,
                          },
                        }}
                        onClick={() => setShowModalDetalhes(!showModalDetalhes)}
                      >
                        <ClipboardDocumentListIcon className="h-6 w-6" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            )}
            <UpdateContratoModal
              open={showModalUpdate}
              setOpen={setShowModalUpdate}
              setUpdateKey={setUpdateKey}
            />
            <DetalheContratoModal
              open={showModalDetalhes}
              setOpen={setShowModalDetalhes}
            />
          </tbody>
        </table>
      </Card>
    </main>
  );
}
