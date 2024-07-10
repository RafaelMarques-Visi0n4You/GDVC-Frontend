import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import router from "next/router";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

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
  }[];
}

export default function CriarPlanoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const id = router.query.id;

  const [formData, setFormData] = useState({
    tipo_plano: "",
    limite_equipas: 0,
    limite_servicos: 0,
  });
  const [refresh, setRefresh] = useState(false);

  const data = useContext(AuthContext);

  const [tipoplano, setTipoPlano] = useState<Data | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("Tipo");
  const [refreshData, setRefreshData] = useState(false);

  const TABLE_HEAD = [
    "Tipo",
    "Limite de equipas",
    "Limite de serviços",
    "Ações",
  ];

  async function loadData() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/planosubscricao/get");
        setTipoPlano(response.data);
        console.log("ababa:", response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, [open, refreshData]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (
          formData.tipo_plano !== "" &&
          formData.limite_equipas !== 0 &&
          formData.limite_servicos !== 0
        ) {
          // Verifique se já existe um registro para esta equipe na tabela chefeequipa
          const response = await api.post("/planosubscricao/create", {
            tipo_plano: formData.tipo_plano,
            limite_equipas: formData.limite_equipas,
            limite_servicos: formData.limite_servicos,
          });

          setFormData({
            tipo_plano: "",
            limite_equipas: 0,
            limite_servicos: 0,
          });

          setRefreshData(!refreshData);
          toast.success("Plano de subscrição criado com sucesso!");
        } else {
          if (formData.tipo_plano.trim() === "") {
            toast.error("O campo Tipo Plano não pode estar vazio.");
          }
          if (
            formData.limite_equipas === 0 ||
            parseInt(formData.limite_equipas.toString()) < 0
          ) {
            toast.error("O campo Limite de equipas não pode estar vazio.");
          }
          if (formData.limite_servicos === 0 || formData.limite_equipas < 0) {
            toast.error("O campo Limite de serviços não pode estar vazio.");
          }
        }
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };

  async function deleteTipoPlano(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accept = window.confirm(
          "Tem a certeza que deseja eliminar este Tipo de Serviço?"
        );
        if (accept) {
          const response = await api.delete("/planosubscricao/delete/" + id);

          if (response.data.Status === "Success") {
            await loadData();
            toast.success("Tipo de serviço eliminado com sucesso!");
          } else {
            toast.error(
              "Tipo de serviço não pode ser eliminado pois tem empresas associados a ele."
            );
          }
        } else {
          console.log("Eliminação do tipo de serviço cancelada.");
        }
      } catch (error) {
        console.error("Erro ao eliminar a tipo de serviço:", error);
        toast.error(
          "Tipo de serviço não pode ser eliminado pois tem empresas associados a ele."
        );
      }
    }
  }

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  function filterData(tipoplanos: any[]) {
    return tipoplanos.filter((tipoplano) => {
      const { tipo_plano, limite_equipas, limite_servicos } = tipoplano;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Tipo":
          return tipo_plano.toLowerCase().includes(searchTerm);
        case "Limite de equipas":
          return limite_equipas.toString().includes(searchTerm);
        case "Limite de serviços":
          return limite_servicos.toString().includes(searchTerm);
        default:
          return false;
      }
    });
  }

  return (
    <Dialog open={open} size="lg">
      <main className="overflow-hidden">
        <div className="grid grid-cols-2">
          <Typography className="p-6" variant="h5">
            Plano Subscrição
          </Typography>
          <Link
            href="#"
            onClick={handleClose}
            className="flex justify-end mr-5 mt-6"
          >
            <XMarkIcon className="w-6 h-6" />
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-4 ml-7 xl:gap-56 lg:gap-56">
          <div className="xl:col-span-1 lg:col-span-1 col-span-12 w-1/6">
            <Select
              label="Filtrar"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              value={filterType}
              defaultValue={"Tipo"}
              onChange={(value) => setFilterType(String(value))}
            >
              <Option value="Tipo">Tipo</Option>
              <Option value="Limite de equipas">Limite de equipas</Option>
              <Option value="Limite de serviços">Limite de serviços</Option>
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
        </div>
        <br />
        <Card className="max-h-60 min-h-60 w-full overflow-y-scroll p-4">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th
                    key={index}
                    className="border-b- px-5 py-4 "
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
              {filterData(tipoplano?.planos || []).map((tipoPlano, index) => (
                <tr key={index}>
                  <td className="px-5 py-4 border-b border-blue-gray-50">
                    {tipoPlano.tipo_plano}
                  </td>
                  <td className="px-14 py-4 border-b border-blue-gray-50">
                    {tipoPlano.limite_equipas}
                  </td>
                  <td className="px-14 py-4 border-b border-blue-gray-50">
                    {tipoPlano.limite_servicos}
                  </td>
                  <td className="px-6 py-4 border-b border-blue-gray-50">
                    <Typography
                      as="a"
                      href="#"
                      variant="small"
                      color="blue-gray"
                      className="font-medium flex items-center gap-2"
                    >
                      <Link
                        href="#"
                        onClick={() =>
                          deleteTipoPlano(tipoPlano.plano_subscricao_id)
                        }
                      >
                        <TrashIcon className="w-6 h-6" />
                      </Link>
                    </Typography>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <br />
        <Typography variant="h6" color="blue-gray" className="mb-2 p-7">
          Criar Plano Subscrição
          <form onSubmit={handleSubmit} className="py-10 sm:w-94">
            <div className="flex flex-row gap-10 ">
              <div className="w-1/3">
                <Input
                  type="text"
                  label="Tipo Plano"
                  value={formData.tipo_plano}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      tipo_plano: event.target.value,
                    })
                  }
                />
              </div>
              <div className="w-1/3">
                <Input
                  type="number"
                  label="Limite de equipas"
                  min={0}
                  value={formData.limite_equipas}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      limite_equipas: parseInt(event.target.value),
                    })
                  }
                />
              </div>
              <div className="w-1/3">
                <Input
                  type="number"
                  label="Limite de serviços"
                  min={0}
                  value={formData.limite_servicos}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      limite_servicos: parseInt(event.target.value),
                    })
                  }
                />
              </div>
            </div>
            <br />
            <div className="flex flex-row justify-end ">
              <Button type="submit" style={{ backgroundColor: "#0F124C" }}>
                Adicionar
              </Button>
            </div>
          </form>
        </Typography>
        <Toaster containerStyle={{ zIndex: 9999 }} />
      </main>
    </Dialog>
  );
}
