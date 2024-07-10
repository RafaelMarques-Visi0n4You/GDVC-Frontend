import {
  Button,
  Card,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { useRouter } from "next/router";

import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
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
  tipoServico: {
    tipo_servico_id: number;
    nome: string;
    descricao: string;
    criado_por_id: number;
    ativo: number;
    data_criacao: string;
  }[];
  tipoServicosHasEquipas: {
    tipoServicos_has_equipas_id: number;
    equipa_id: number;
    equipa: {
      equipa_id: number;
      nome: string;
    };
    tipo_servico: {
      tipo_servico_id: number;
      nome: string;
    };
  }[];
}

const TABLE_HEAD = ["Equipa", "Tipo Serviço", "Ações"];

export default function AssociarModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const data = useContext(AuthContext);

  const [equipa, setEquipa] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tipoServico, setTipoServico] = useState<Data | null>(null);
  const [TipoServicoEquipa, setTipoServicoEquipa] = useState<Data | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Equipa");

  const handleClose = () => {
    setOpen(false);
  };

  const [formData, setFormData] = useState({
    equipa_id: 0,
    tipo_servico_id: 0,
  });

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
          setEquipa(response.data);

          const response2 = await api.get("/tiposervico/get");

          setTipoServico(response2.data);

          const response3 = await api.get("/tiposervicohasequipas/get");
          setTipoServicoEquipa(response3.data);
          console.log("TipoServicoEquipa: ", response3.data);

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, [open]);

  async function addTipoServioEquipa() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/tiposervicohasequipas/create", {
          equipa_id: formData.equipa_id,
          tipo_servico_id: formData.tipo_servico_id,
        });
        setFormData({
          tipo_servico_id: 0,
          equipa_id: 0,
        });
        loadData();
        toast.success("Tipo de serviço criado com sucesso!");
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deleteTipoServico(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const userConfirmed = window.confirm(
          "Tem a certeza que deseja eliminar este tipo de serviço?"
        );
        if (userConfirmed) {
          const response = await api.delete(
            "/tiposervicohasequipas/delete/" + id
          );
          console.log(response.data);
          if (response.data.Status === "Success") {
            await loadData();
            toast.success(
              "Tipo de serviço associado à equipa eliminado com sucesso!"
            );
          } else {
            toast.error(
              "Tipo de serviço associado à equipa não pode ser eliminado."
            );
          }
        } else {
          console.log(
            "Eliminação do tipo de serviço associado à equipa cancelada."
          );
        }
      } catch (error) {
        toast.error(
          "Tipo de serviço associado à equipa não pode ser eliminado."
        );
      }
    }
  }

  function filterData(tipoServicosHasEquipas: any[]) {
    return tipoServicosHasEquipas.filter((tipoServicosHasEquipa) => {
      const { nome } = tipoServicosHasEquipa;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "TipoServico":
          const nome = tipoServicosHasEquipa.tipo_servico.nome;
          return nome.toLowerCase().includes(searchTerm);
        case "Equipa":
          const nome2 = tipoServicosHasEquipa.equipa.nome;
          return nome2.toLowerCase().includes(searchTerm);
        default:
          return false;
      }
    });
  }

  return (
    <Dialog open={open}>
      <main className="overflow-hidden">
        <div className="grid grid-cols-2">
          <Typography className="p-6" variant="h5">
            Associar tipo serviço a equipa
          </Typography>
          <Link
            href="#"
            onClick={handleClose}
            className="flex justify-end mr-5 mt-6"
          >
            <XMarkIcon className="w-6 h-6" />
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-4 ml-7 xl:gap-56  lg:gap-56">
          <div className="xl:col-span-1 lg:col-span-1 col-span-12 w-1/6">
            <Select
              label="Filtrar"
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              value={filterType}
              defaultValue={"Equipa"}
              onChange={(value) => setFilterType(String(value))}
            >
              <Option value="TipoServico">Tipo Serviço</Option>
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
        </div>
        <br />
        <Card className="max-h-60 min-h-60 w-full overflow-y-scroll p-4">
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head, index) => (
                  <th
                    key={index}
                    className="border-b- px-3 py-4 "
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
              {filterData(TipoServicoEquipa?.tipoServicosHasEquipas || [])?.map(
                (tiposervicoequipa) => (
                  <tr key={tiposervicoequipa.tipoServicos_has_equipas_id}>
                    <td className="px-3 py-4 border-b border-blue-gray-50">
                      {tiposervicoequipa?.equipa?.nome}
                    </td>
                    <td className="px-5 py-4 border-b border-blue-gray-50">
                      {tiposervicoequipa.tipo_servico?.nome}
                    </td>
                    <td className="px-5 py-4 border-b border-blue-gray-50">
                      <Typography
                        as="a"
                        href="#"
                        variant="small"
                        color="blue-gray"
                        className="font-medium flex items-center gap-2"
                      >
                        <Link href="#">
                          <TrashIcon
                            className="w-6 h-6"
                            onClick={() => {
                              deleteTipoServico(
                                tiposervicoequipa.tipoServicos_has_equipas_id
                              );
                            }}
                          />
                        </Link>
                      </Typography>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </Card>
        <br />

        <Typography variant="h6" color="blue-gray" className="mb-2 p-7">
          Adicionar tipo de serviço à equipa
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Impede o envio do formulário
              // Verifique se o campo de texto não está vazio antes de adicionar a tarefa
            }}
          >
            <br />
            <div className="mt-1">
              <Select
                label="Equipa"
                value={String(formData?.equipa_id)}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    equipa_id: parseInt(value as string),
                  });
                }}
              >
                {equipa?.equipas?.map((equipa) => (
                  <Option
                    key={equipa?.equipa_id}
                    value={String(equipa.equipa_id)}
                  >
                    {equipa?.nome}
                  </Option>
                ))}
              </Select>
            </div>
            <br />
            <div className="mt-1">
              <Select
                label="Tipo de serviço"
                value={String(formData?.tipo_servico_id)}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    tipo_servico_id: parseInt(value as string),
                  });
                }}
              >
                {tipoServico?.tipoServico?.map((tiposervico) => (
                  <Option
                    key={tiposervico?.tipo_servico_id}
                    value={String(tiposervico.tipo_servico_id)}
                  >
                    {tiposervico?.nome}
                  </Option>
                ))}
              </Select>
            </div>
            <br />
            <div className="flex justify-end">
              <Button
                style={{ backgroundColor: "#0F124C" }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={() => {
                  if (
                    formData.tipo_servico_id !== 0 &&
                    formData.equipa_id !== 0
                  ) {
                    addTipoServioEquipa();
                  } else {
                    console.error(
                      "O campo do nome de equipa e/ou tipo serviço está vazio. Por favor, selecione as opções."
                    );
                  }
                }}
              >
                Concluído
              </Button>
            </div>
            <Toaster containerStyle={{ zIndex: 9999 }} />
          </form>
        </Typography>
      </main>
    </Dialog>
  );
}
