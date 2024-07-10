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
import React, { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

const TABLE_HEAD = ["Nome", "Ações"];

interface Data {
  status: string;
  tipoServico: {
    tipo_servico_id: number;
    nome: string;
  }[];
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
}

export default function CriarTipoServicoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [text, setText] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Nome");
  const [tiposervico, setTipoServico] = useState<Data | null>(null);
  const [equipa, setEquipa] = useState<Data | null>(null);
  const [equipa_id, setEquipaId] = useState<number | null>(null);

  const data = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/tiposervico/get");
        setTipoServico(response.data);
        console.log(response.data);

        const response2 = await api.post("/equipa/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });

        setEquipa(response2.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  async function addTipoServico() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/tiposervicohasequipas/verificar", {
          nome: text,
          equipa_id: equipa_id,
        });
        if (response.status === 200) {
          loadData();
          setText("");
          setEquipaId(null);
          toast.success("Tipo de serviço criado com sucesso!");
        }
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
          const response = await api.delete("/tiposervico/delete/" + id);
          console.log(response.data);
          if (response.data.status === "Success") {
            await loadData();
            toast.success("Tipo de serviço eliminado com sucesso!");
          } else {
            console.error("Erro ao eliminar a tipo de serviço:", response.data);
            toast.error(
              "Tipo de serviço não pode ser eliminado pois tem serviços associados a ele."
            );
          }
        } else {
          console.log("Eliminação do tipo de serviço cancelada.");
        }
      } catch (error) {
        console.error("Erro ao eliminar a tipo de serviço:", error);
        toast.error(
          "Tipo de serviço não pode ser eliminado pois tem serviços associados a ele."
        );
      }
    }
  }

  function filterData(tiposervicos: any[]) {
    return tiposervicos.filter((tiposervico) => {
      const { nome } = tiposervico;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome.toLowerCase().includes(searchTerm);

        default:
          return false;
      }
    });
  }

  useEffect(() => {
    loadData();
  }, [data]);

  return (
    <Dialog open={open}>
      <main className="overflow-hidden">
        <div className="grid grid-cols-2">
          <Typography className="p-6" variant="h5">
            Tipo serviço
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
              defaultValue={"Nome"}
              onChange={(value) => setFilterType(String(value))}
            >
              <Option value="Nome">Nome</Option>
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
              {filterData(tiposervico?.tipoServico || [])?.map(
                (tipoServico, index) => (
                  <tr key={index}>
                    <td className="px-3 py-4 border-b border-blue-gray-50">
                      {tipoServico.nome}
                    </td>
                    <td className="px-5 py-4 border-b border-blue-gray-50">
                      <Typography
                        as="a"
                        href="#"
                        variant="small"
                        color="blue-gray"
                        className="font-medium flex items-center gap-2"
                      >
                        <Link href={"#"}>
                          <TrashIcon
                            className="w-6 h-6"
                            onClick={() => {
                              deleteTipoServico(tipoServico.tipo_servico_id);
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
          Criar Tipo de Serviço
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Impede o envio do formulário
              // Verifique se o campo de texto não está vazio antes de adicionar a tarefa
              if (text !== null) {
                addTipoServico(); // Adiciona a tarefa ao submeter o formulário
                setText(""); // Limpa o campo de texto após adicionar a tarefa
              }
            }}
          >
            <div className="mt-1">
              <Input
                label="Nome tipo de serviço"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <br />
            <Select
              label="Equipa"
              value={String(equipa_id)}
              onChange={(value) => {
                setEquipaId(Number(value));
              }}
            >
              {equipa?.equipas
                ?.filter((equipa) => equipa.ativo === 1)
                .map((equipa) => (
                  <Option
                    key={equipa?.equipa_id}
                    value={String(equipa?.equipa_id)}
                  >
                    {equipa?.nome}
                  </Option>
                ))}
            </Select>
            <br />

            <div className="flex justify-end">
              <Button
                style={{ backgroundColor: "#0F124C" }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onClick={() => {
                  if (text.trim() !== "") {
                    addTipoServico();
                  } else {
                    console.error(
                      "O campo do nome de tiposervico está vazio. Por favor, insira uma nome."
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
