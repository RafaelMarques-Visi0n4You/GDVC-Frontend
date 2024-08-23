import { AuthContext } from "@/common/components/AuthContext";
import AssociarPlanoDeSubscricaoModal from "@/common/components/adicionarplanosubscricao";
import CriarEmpresaModal from "@/common/components/createempresa";
import CriarPlanoModal from "@/common/components/createplano";
import DetalheEmpresaModal from "@/common/components/detalheempresa";
import UpdateEmpresaModal from "@/common/components/updateempresa";
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
  empresas: {
    cod_postal: string;
    contacto: string;
    data_adesao: string;
    email: string;
    empresa_id: number;
    localidade: string;
    morada: string;
    nif: string;
    nome: string;
    plano_subscricao_empresa_id: number;
    ramo_atividade: string;
    logo_empresa: string;
  }[];
  planos: {
    plano_subscricao_id: number;
    tipo_plano: string;
    limite_equipas: number;
    limite_servicos: number;
    data_criacao: string;
  }[];
  planoSubscricaoEmpresas: {
    plano_subscricao_empresa_id: number;
    data_subscricao: string;
    ativo: boolean;
    plano_subscricao_id: number;
    empresa_id: number;
    plano_subscricao: {
      plano_subscricao_id: number;
      tipo_plano: string;
      limite_equipas: number;
      limite_servicos: number;
      data_criacao: string;
    };
  }[];
}

const TABLE_HEAD = [
  "Nome",
  "Plano de subscrição",
  "Ramo de atividade",
  "Data adesão",
  "Ações",
];

export default function DefaultTable() {
  const [serviceData, setServiceData] = useState<Data | null>(null);

  const [tiposervicoData, setTipoServicoData] = useState<Data | null>(null);
  const [tiposervicoempresaData, setTipoServicoEmpresaData] =
    useState<Data | null>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [showModalCreatePlano, setShowModalCreatePlano] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showModalCreateEmpresa, setShowModalCreateEmpresa] = useState(false);
  const [showModalUpdateEmpresa, setShowModalUpdateEmpresa] = useState(false);
  const [showModalDetalheEmpresa, setShowModalDetalheEmpresa] = useState(false);
  const [showModalAssociarPlano, setShowModalAssociarPlano] = useState(false);
  const [filterType, setFilterType] = useState("Nome");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const data = useContext(AuthContext);
  const [detalhesId, setDetalhesId] = useState(0);

  useEffect(() => {
    if (
      data?.user?.tipo_utilizador !== "nivel4" &&
      data?.user?.tipo_utilizador !== "nivel5"
    ) {
      router.push("/permissiondenied");
    }
    loadData();
  }, [
    updateKey,
    showModalCreateEmpresa,
    showModalCreatePlano,
    showModalAssociarPlano,
  ]);

  useEffect(() => {
    if (serviceData) {
      setIsLoading(false);
    }
  }, [serviceData]);

  async function toggleUserSelection(id: number, isChecked: boolean) {
    console.log("botao clicado");
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/empresa/setAcesso/${id}`);
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

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/empresa/get");
        console.log(response);
        if (response.status === 200) {
          console.log("abc: ", response.data);
          setServiceData(response.data);

          const responseTipoSubscricao = await api.get("/planosubscricao/get");
          console.log("1:", responseTipoSubscricao.data);
          setTipoServicoData(responseTipoSubscricao.data);

          const responseTipoSubscricaoEmpresa = await api.get(
            "/planosubscricaoempresa/get"
          );
          console.log("2:", responseTipoSubscricaoEmpresa.data);
          setTipoServicoEmpresaData(responseTipoSubscricaoEmpresa.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  function filterData(empresas: any[]) {
    return empresas.filter((empresa) => {
      const {
        nome,

        plano_subscricao_id,
        ramo_atividade,
        empresa_id,
        data_adesao,
      } = empresa;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome.toLowerCase().includes(searchTerm);
        case "Tipo Plano":
          const empresas = tiposervicoempresaData?.planoSubscricaoEmpresas.find(
            (plano) => plano.empresa_id === empresa_id
          )?.plano_subscricao_id;

          const final = tiposervicoData?.planos.find(
            (plano) => plano.plano_subscricao_id === empresas
          )?.tipo_plano;

          return final?.toLowerCase().includes(searchTerm);
        case "Ramo de Atividade":
          return ramo_atividade.toLowerCase().includes(searchTerm);
        case "Data adesao":
          return data_adesao.toString().includes(searchTerm);
        default:
          return false;
      }
    });
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
        Empresas
      </Typography>
      <div className="grid grid-cols-12 gap-4 ml-7 xl:gap-56  lg:gap-52">
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
            <Option value="Tipo Plano">Tipo Plano</Option>
            <Option value="Ramo de Atividade">Ramo de Atividade</Option>
            <Option value="Data adesao">Data adesão</Option>
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
        <div className="flex xl:ml-138 lg:ml-96">
          <Link
            href={"#"}
            onClick={() => setShowModalCreatePlano(!showModalCreatePlano)}
          >
            <Button className="grid grid-flow-col w-56" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Criar plano subscrição</span>
            </Button>
          </Link>
          <CriarPlanoModal
            open={showModalCreatePlano}
            setOpen={setShowModalCreatePlano}
          />
        </div>
        <div className="  xl:ml-142 lg:ml-10">
          <Link
            href={"#"}
            onClick={() => setShowModalCreateEmpresa(!showModalCreateEmpresa)}
          >
            <Button className="grid grid-flow-col" variant="outlined">
              <PlusIcon className="h-5 w-5" />
              <span className="mt-1">Empresa</span>
            </Button>
          </Link>
        </div>
      </div>
      <br />
      <Card className="h-full w-full overflow-y-auto">
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
            {filterData(serviceData?.empresas || [])?.map((empresa, index) => (
              <tr key={index}>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {empresa?.nome}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  <Link
                    href={{
                      query: {
                        id: empresa.empresa_id,
                      },
                    }}
                    onClick={() => {
                      setShowModalAssociarPlano(!showModalAssociarPlano);
                    }}
                  >
                    {tiposervicoempresaData &&
                    tiposervicoempresaData.planoSubscricaoEmpresas &&
                    tiposervicoempresaData.planoSubscricaoEmpresas?.some(
                      (plano) => plano.empresa_id === empresa.empresa_id
                    ) ? (
                      <span>
                        {
                          tiposervicoData?.planos.find(
                            (plano) =>
                              plano.plano_subscricao_id ===
                              tiposervicoempresaData.planoSubscricaoEmpresas.find(
                                (plano) =>
                                  plano.empresa_id === empresa.empresa_id
                              )?.plano_subscricao_id
                          )?.tipo_plano
                        }
                      </span>
                    ) : (
                      <span> Sem plano de subscrição</span>
                    )}
                  </Link>
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {empresa.ramo_atividade}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  {empresa?.data_adesao?.slice(0, 10)}
                </td>
                <td className="px-24 py-4 border-b border-blue-gray-50">
                  <Typography
                    as="a"
                    href="#"
                    variant="small"
                    color="blue-gray"
                    className="font-medium flex items-center gap-2"
                  >
                    <Link
                      href={{
                        query: {
                          id: serviceData?.empresas?.[index].empresa_id,
                        },
                      }}
                      onClick={() =>
                        setShowModalUpdateEmpresa(!showModalUpdateEmpresa)
                      }
                    >
                      <PencilSquareIcon className="h-6 w-6" />
                    </Link>
                    <Link
                      href={{
                        query: {
                          id: serviceData?.empresas?.[index].empresa_id,
                        },
                      }}
                      onClick={() => {
                        {
                          setDetalhesId(
                            serviceData?.empresas?.[index].empresa_id ?? 0
                          );
                          setShowModalDetalheEmpresa(!showModalDetalheEmpresa);
                        }
                      }}
                    >
                      <UserGroupIcon className="h-6 w-6" />
                    </Link>
                  </Typography>
                </td>
              </tr>
            ))}
            <CriarEmpresaModal
              open={showModalCreateEmpresa}
              setOpen={setShowModalCreateEmpresa}
            />
            <UpdateEmpresaModal
              open={showModalUpdateEmpresa}
              setOpen={setShowModalUpdateEmpresa}
              setUpdateKey={setUpdateKey}
            />
            <DetalheEmpresaModal
              open={showModalDetalheEmpresa}
              setOpen={setShowModalDetalheEmpresa}
              id={detalhesId}
            />

            <AssociarPlanoDeSubscricaoModal
              open={showModalAssociarPlano}
              setOpen={setShowModalAssociarPlano}
            />
          </tbody>
        </table>
      </Card>
    </main>
  );
}
