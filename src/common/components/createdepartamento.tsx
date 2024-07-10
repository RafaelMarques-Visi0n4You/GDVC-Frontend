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
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import CriarResponsavelDepartamentoModal from "./createresponsaveldepartamento";
import CriarContaFuncionarioModal from "./criarcontafuncionario";

interface Data {
  Status: string;
  departamentos: {
    ativo: boolean;
    data_criacao: string;
    departamento_id: number;
    empresa_id: number;
    nome: string;
  }[];
  responsavelDepartamentos: {
    departamento_id: number;
    funcionario_id: number;
    funcionario: {
      nome_completo: string;
    };
  }[];
  funcionarios: {
    ativo: boolean;
    data_criacao: string;
    departamento_id: number;
    email: string;
    empresa_id: number;
    funcionario_id: number;
    nome_completo: string;
    password: string;
    role: string;
  }[];
  departamento: {
    empresa_id: number;
  };
}

const TABLE_HEAD = ["Nome", "Responsável", "Ações"];

export default function CriarDepartamentoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [departamento, setDepartamento] = useState<Data | null>(null);
  const [responsavel, setResponsavel] = useState<Data | null>(null);
  const [text, setText] = useState<string>("");
  const [funcionario_id, setFuncionario_id] = useState<number | null>(null);
  const [funcdepartamento, setFuncDepartamento] = useState<Data | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("Nome");
  const [showModalCreateResponsavel, setShowModalCreateResponsavel] =
    useState<boolean>(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [departamento_id, setDepartamento_id] = useState<number | null>(null);
  const [showCreateAccountDialog, setShowCreateAccountDialog] =
    useState<boolean>(false);
  const [refresh, setRefresh] = useState(false);

  const data = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/departamento/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setDepartamento(response.data);
        console.log(response.data);

        const response2 = await api.get("/responsaveldepartamento/get");

        setResponsavel(response2.data);
        console.log(response2.data);

        const response3 = await api.post("/funcionario/getfuncionarioempresa", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setFuncDepartamento(response3.data);
        console.log(response3.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  async function addDepartamento() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (text.trim() === "") {
          toast.error("Por favor insira um nome para o departamento.");
          return;
        }

        const response = await api.post(
          "/responsaveldepartamento/verficarresponsavel",
          {
            empresa_id: data.user.funcionario.empresa_id,
            nome: text,
            funcionario_id: funcionario_id,
          }
        );
        console.log("departamentoid:", response.data);

        if (response.data.Error) {
          setDepartamento_id(response.data.departamento.departamento_id);
          const accepted = window.confirm(
            "Este funcionario não tem conta de utilizador. Deseja criar uma conta de utilizador para este funcionario?"
          );
          if (accepted) {
            setShowCreateAccountDialog(true);
          }
        } else {
          loadData();
          setText("");

          toast.success("Departamento criado com sucesso!");
          setRefresh(!refresh);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deleteDepartamento(idDepartamento: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accepted = window.confirm(
          "Tem a certeza que deseja eliminar este departamento?"
        );
        if (accepted) {
          const response = await api.delete(
            "/departamento/delete/" + idDepartamento
          );
          if (response.data.Status === "Success") {
            await loadData();
            toast.success("Departamento eliminado com sucesso!");
          } else {
            toast.error(
              "Departamento não pode ser eliminado pois tem equipas e/ou funcionários associados a ele."
            );
          }
        } else {
          console.log("Eliminação do departamento cancelada.");
        }
      } catch (error) {
        console.error("Erro ao eliminar a departamento:", error);
      }
    }
  }

  function filterData(departamentos: any[]) {
    return departamentos.filter((departamento) => {
      const { nome, funcionario_id } = departamento;
      const searchTerm = searchText.toLowerCase();

      switch (filterType) {
        case "Nome":
          return nome.toLowerCase().includes(searchTerm);
        case "ResponsavelDepartamento":
          const funcionarios = responsavel?.responsavelDepartamentos
            ?.filter(
              (resp) => resp.departamento_id === departamento.departamento_id
            )
            .map((resp) => resp.funcionario.nome_completo.toLowerCase())
            .join(" ");

          return funcionarios?.includes(searchTerm) ?? false;

        default:
          return false;
      }
    });
  }

  useEffect(() => {
    if (updateKey) {
      loadData();
    }
    loadData();
  }, [data, updateKey, showCreateAccountDialog, refresh]);

  return (
    <Dialog open={open}>
      <main className="overflow-hidden">
        <div className="grid grid-cols-2">
          <Typography className="p-6" variant="h5">
            Departamentos
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
              <Option value="ResponsavelDepartamento">
                Responsável Departamento
              </Option>
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
              {filterData(departamento?.departamentos || [])?.map(
                (departamento, index) => (
                  <tr key={index}>
                    <td className="px-5 py-4 border-b border-blue-gray-50">
                      {departamento.nome}
                    </td>
                    {/* Responsável */}

                    <td className="px-5 py-4 border-b border-blue-gray-50">
                      <Link
                        href={{
                          query: {
                            id: departamento.departamento_id,
                          },
                        }}
                        onClick={() => {
                          setShowModalCreateResponsavel(
                            !showModalCreateResponsavel
                          );
                        }}
                      >
                        {responsavel &&
                        responsavel?.responsavelDepartamentos.some(
                          (resp) =>
                            resp.departamento_id ===
                            departamento.departamento_id
                        ) ? (
                          responsavel?.responsavelDepartamentos
                            .filter(
                              (resp) =>
                                resp.departamento_id ===
                                departamento.departamento_id
                            )
                            .map((resp, index) => (
                              <span key={index}>
                                {resp?.funcionario?.nome_completo}
                              </span>
                            ))
                        ) : (
                          <span>Nenhum responsável designado</span>
                        )}
                      </Link>
                    </td>

                    {/* Ações */}
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
                              deleteDepartamento(departamento.departamento_id);
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
          Criar Departamento
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Impede o envio do formulário
              // Verifique se o campo de texto não está vazio antes de adicionar a tarefa
              if (text !== null) {
                addDepartamento(); // Adiciona a tarefa ao submeter o formulário
                setText(""); // Limpa o campo de texto após adicionar a tarefa
              }
            }}
          >
            <div className="mt-1">
              <Input
                label="Nome do Departamento"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <br />
            <div>
              <Select
                value={String(funcionario_id)}
                label="Responsável"
                onChange={(value) => setFuncionario_id(Number(value))}
              >
                {funcdepartamento?.funcionarios
                  ?.filter((funcionario) => {
                    const isActive = funcionario?.ativo;
                    const isNotInChefeEquipa =
                      !responsavel?.responsavelDepartamentos.some(
                        (resp) =>
                          resp.funcionario_id === funcionario.funcionario_id
                      );
                    return isActive && isNotInChefeEquipa;
                  })
                  .map((funcionario, index2) => (
                    <Option
                      key={index2}
                      value={String(funcionario.funcionario_id)}
                    >
                      {funcionario.nome_completo}
                    </Option>
                  ))}
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                style={{ backgroundColor: "#0F124C" }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                className="mt-4 "
                onClick={() => {
                  if (text.trim() !== "") {
                    addDepartamento();
                  } else {
                    toast.error(
                      "O campo do nome de departamento está vazio. Por favor, insira uma nome."
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
        <CriarResponsavelDepartamentoModal
          open={showModalCreateResponsavel}
          setOpen={setShowModalCreateResponsavel}
          setUpdateKey={setUpdateKey}
        />
        <CriarContaFuncionarioModal
          open={showCreateAccountDialog}
          setOpen={setShowCreateAccountDialog}
          id={funcionario_id}
          id2={departamento_id}
          setUpdateKey={setUpdateKey}
          onAccountCreationSuccess={() => setFuncionario_id(null)}
        />
      </main>
    </Dialog>
  );
}
