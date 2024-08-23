import api from "@/common/services/api";
import {
  Button,
  Card,
  CardBody,
  Dialog,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  funcionario: {
    funcionario_id: number;
    nome_completo: string;
  };
  funcionarios: {
    funcionario_id: number;
    nome_completo: string;
  }[];

  equipa: {
    equipa_id: number;
    empresa_id: number;
    nome: string;
    criado_por_id: number;
    ativo: number;
    cor_equipa: string;
    data_criacao: string;
    departamento_id: number;
  };
  chefesEquipa: {
    funcionario: any;
    funcionario_id: number;
    equipa_id: number;
  }[];
  empresa: {
    empresa_id: number;
    nome: string;
  };
  departamento: {
    departamento_id: number;
    nome: string;
  };
  responsavelDepartamento: {
    funcionario_id: number;
    nome_completo: string;
  }[];
  responsaveldepartamento: {
    departamento_id: number;
    funcionario_id: number;
    funcionario: {
      nome_completo: string;
    };
    departamento: {
      empresa_id: number;
    };
  }[];
  tipoServicosHasEquipas: {
    tipo_servico_id: number;
    equipa_id: number;
    tipo_servico: {
      nome: string;
    };
  }[];
}

export default function DetalheEquipaModal({
  open,
  setOpen,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
}) {
  const router = useRouter();

  const [data, setData] = useState<Data | null>(null);
  const [empresa, setEmpresa] = useState<Data | null>(null);
  const [departamento, setDepartamento] = useState<Data | null>(null);
  const [chefe, setChefe] = useState<Data | null>(null);
  const [funcionario, setFuncionario] = useState<Data | null>(null);
  const [responsavel, setResponsavel] = useState<Data | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [todoschefe, setTodosChefe] = useState<Data | null>(null);
  const user = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [tiposervicohasequipas, setTipoServicoHasEquipa] =
    useState<Data | null>(null);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    loadData(id);
  }, [id, open]);

  async function loadData(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/equipa/get/" + id);

        const servicesData = response.data;

        setData(servicesData);
        console.log("Datasd<fgdaf:", data);

        const empradadetails = await api.get(
          "/empresa/get/" + servicesData.equipa.empresa_id
        );
        console.log("Empresa:", empradadetails.data);
        setEmpresa(empradadetails.data);

        const departamentodetails = await api.get(
          "/departamento/get/" + servicesData.equipa.departamento_id
        );
        console.log("Departamento:", departamentodetails);
        setDepartamento(departamentodetails.data);

        const funcionariodetail = await api.post(
          "/funcionario/getfuncionariosequipa/",
          {
            equipa_id: servicesData.equipa.equipa_id,
          }
        );
        console.log("Funcionario:", funcionariodetail);
        setFuncionario(funcionariodetail.data);

        const chefedetails = await api.post("/funcionario/get", {
          equipa_id: servicesData.equipa.equipa_id,
          empresa_id: servicesData.equipa.empresa_id,
        });
        console.log("Chefe:", chefedetails.data);

        const reponsaveldepartamento = await api.post(
          "/responsaveldepartamento/getone",
          {
            departamento_id: servicesData.equipa.departamento_id,
          }
        );
        console.log("Responsavel:", reponsaveldepartamento);
        setResponsavel(reponsaveldepartamento.data);

        const chefeequipa = await api.get("/chefeequipa/get/");
        console.log("Chefe Equipa:", chefeequipa);
        setTodosChefe(chefeequipa.data);

        const tiposervicos = await api.post(
          "/tiposervicohasequipas/getByEquipas/",
          {
            equipa_id: servicesData.equipa.equipa_id,
          }
        );

        setTipoServicoHasEquipa(tiposervicos.data);
        console.log("Tipo Serviço:", tiposervicohasequipas);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  return (
    <>
      <Dialog open={open} size="lg" style={{ backgroundColor: "#F9FAFB" }}>
        <Typography variant="h5" className="flex justify-center mt-4">
          Detalhes Equipa
        </Typography>
        <div className="grid grid-cols-2 gap-5">
          <Card className="mt-5 w-90 ml-4 max-h-52 ">
            <CardBody>
              <p className="text-gray-600 ">
                Nome Equipa:{" "}
                <span className="text-black">{data?.equipa?.nome}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Cor Equipa:{" "}
                <span
                  className="rounded-md px-24"
                  style={{ backgroundColor: data?.equipa?.cor_equipa }}
                >
                  &nbsp;
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Empresa:
                <span className="text-black"> {empresa?.empresa?.nome}</span>
              </p>
              <p className="mt-4 text-gray-600">
                Departamento:
                <span className="text-black">
                  {" "}
                  {departamento?.departamento?.nome}
                </span>
              </p>
            </CardBody>
          </Card>

          <div className="">
            <Card className="mt-5 mr-4 h-52">
              <CardBody>
                <p className="mt-6 text-gray-600">
                  Chefe Equipa:{" "}
                  <span className="text-black">
                    {(() => {
                      const chefesFiltrados =
                        todoschefe?.chefesEquipa?.filter(
                          (chefe) => chefe.equipa_id === data?.equipa?.equipa_id
                        ) ?? [];

                      return chefesFiltrados.length > 0 ? (
                        chefesFiltrados.map((chefe) => (
                          <span key={chefe.funcionario_id}>
                            {chefe.funcionario.nome_completo}
                          </span>
                        ))
                      ) : (
                        <div className="text-black">
                          Não tem chefe de equipa
                        </div>
                      );
                    })()}
                  </span>
                </p>
                <p className="mt-7 text-gray-600">
                  Responsável Deparamento:
                  <span className="text-black">
                    {responsavel &&
                    responsavel.responsaveldepartamento?.length > 0 ? (
                      responsavel.responsaveldepartamento.map((responsavel) => (
                        <div key={responsavel.funcionario_id}>
                          {responsavel.funcionario.nome_completo}
                        </div>
                      ))
                    ) : (
                      <div className="text-black">
                        Não tem responsável de departamento
                      </div>
                    )}
                  </span>
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
        <br />
        <div className="grid grid-cols-2 gap-5">
          <Card className="mr-4 ml-4">
            <CardBody>
              <Typography variant="h6">Elementos equipa</Typography>
              <div className="max-h-40 overflow-y-scroll">
                {funcionario?.funcionarios?.map((funcionarios) => (
                  <div className=" rounded-md w-96">
                    <div
                      className="mt-2 m-2 text-gray-700"
                      key={funcionarios.funcionario_id}
                    >
                      {funcionarios.nome_completo}
                    </div>
                    <hr></hr>
                  </div>
                ))}
                <div className="bg-gray-200 rounded-md">
                  <div className="mt2 "></div>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="mr-4 ml-4">
            <CardBody>
              <Typography variant="h6">Serviço da Equipa</Typography>
              <div className="max-h-40 overflow-y-scroll">
                {tiposervicohasequipas?.tipoServicosHasEquipas?.map(
                  (tiposervico) => (
                    <div className=" rounded-md w-96">
                      <div
                        className="mt-2 m-2 text-gray-700"
                        key={tiposervico.tipo_servico_id}
                      >
                        {tiposervico.tipo_servico.nome}
                      </div>
                      <hr></hr>
                    </div>
                  )
                )}
                <div className="bg-gray-200 rounded-md">
                  <div className="mt2 "></div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              handleClose(), setChefe(null);
            }}
            className="w-40"
            style={{ backgroundColor: "#BDC2CD" }}
          >
            Voltar
          </Button>
        </div>
        <br />
      </Dialog>
    </>
  );
}
