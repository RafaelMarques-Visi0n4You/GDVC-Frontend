import api from "@/common/services/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import AnomaliaModalAdd from "@/common/components/addanomalia";
import { AuthContext } from "@/common/components/AuthContext";
import ReagendarVisitaPendenteModal from "@/common/components/editvisitapendente";
import ImagemModal from "@/common/components/imagemG";
import NotasModal2 from "@/common/components/notasmodal2";
import NotasModal3 from "@/common/components/notasmodal3";
import NotasModal4 from "@/common/components/notasmodal4";
import NotificacoesModal from "@/common/components/notifications";
import UpdateStatus from "@/common/components/updatestatus";
import {
  CalendarIcon,
  ClockIcon,
  PlusCircleIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { getCookie } from "cookies-next";
import Image from "next/image";
import toast from "react-hot-toast";
import AnomaliasModal from "../../common/components/anomaliasmodal";
import ContratoModal from "../../common/components/contratomodal";
import NotasModal from "../../common/components/notasmodal";
import TarefaModal from "../../common/components/tarefasmodal";

interface Data {
  Status: string;
  agendaServico: {
    agenda_servico_id: number;
    ativo: number;
    servico: {
      nome: string;
      descricao: string;
    };
    visita: {
      visita_id: number;
      data_visita: string;
      hora_visita_inicio: string;
      hora_visita_fim: string;
      contrato_id: number;
      estado_servico: string;
      ativo: number;
    };
    funcionarios: {
      nome_completo: string;
      cargo: string;
    }[];
    tarefa: {
      tarefas: string;
      tarefa_servico_visita_id: number;
      estado: string;
    }[];

    endereco: {
      morada: string;
    };
    cliente: {
      nome_completo: string;
      contacto: string;
      email: string;
    };
    tarefas: {
      tarefa: string;
      tarefa_servico_visita_id: number;
      estado: string;
    }[];
  };
  notaVisita: {
    nota: string;
    data_criacao: string;
  }[];
  anomaliaVisita: {
    anomalia: string;
    anomalia_visita_id: number;
    estado: string;
    fotografia: string;
  }[];
}

export default function Home() {
  const router = useRouter();
  const id = router.query.id;
  const [updateKey, setUpdateKey] = useState(0);
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [showModalContrato, SetshowModalContrato] = useState(false);
  const [showModalTarefas, SetshowModalTarefas] = useState(false);
  const [showModalNotas, SetshowModalNotas] = useState(false);
  const [showModalAnomalias, SetshowModalAnomalias] = useState(false);
  const [VisitaId, setVisitaId] = useState(0);
  const [ContratoId, setContratoId] = useState(0);
  const [tarefas, setTarefas] = useState<
    { tarefa: string; estado: string }[] | undefined | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notas, setNotas] = useState<Data | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [showModalImagem, SetshowModalImagem] = useState(false);
  const [mostrarImagem, setMostrarImagem] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showModalReagendarVisita, SetshowModalReagendarVisita] =
    useState(false);
  const [AgendaId, setAgendaId] = useState(0);
  const [Modalchangestatus, SetModalChangeStatus] = useState(false);
  const [showModalAnomaliaAdd, SetshowModalAnomaliaAdd] = useState(false);
  const [showModalAccept, setShowModalAccept] = useState(false);
  const [showDialog, setshowDialog] = useState<boolean>(false);
  const [showDialog2, setshowDialog2] = useState<boolean>(false);
  const [showDialog3, setshowDialog3] = useState<boolean>(false);
  const [showDialog4, setshowDialog4] = useState<boolean>(false);

  const [id1, setId1] = useState(0);
  const [id2, setId2] = useState(0);

  const user = useContext(AuthContext);

  useEffect(() => {
    loadData();

    if (VisitaId) {
      loadData2(VisitaId);
    }
    if (VisitaId) {
      loadData3(VisitaId);
    }
  }, [VisitaId]);

  useEffect(() => {
    loadData();
  }, [
    showModalTarefas,
    updateKey,
    showModalNotas,
    showModalAnomalias,
    Modalchangestatus,
  ]);

  useEffect(() => {
    if (VisitaId) {
      loadData2(VisitaId);
      loadData3(VisitaId);
    }
  }, [showModalNotas, updateKey]);

  useEffect(() => {
    if (VisitaId) {
      loadData3(VisitaId);
    }
  }, [showModalAnomalias, updateKey, VisitaId]);

  useEffect(() => {
    if (serviceData) {
      setTarefas(serviceData.agendaServico?.tarefas);
    }
    console.log("tarefas", tarefas);
  }, [serviceData]);

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/agendaservico/getDetails", {
          id: id,
        });
        if (response.status === 200) {
          const servicesData = response.data;
          setServiceData(servicesData);
          setVisitaId(servicesData.agendaServico.visita.visita_id);
          setAgendaId(servicesData.agendaServico.agenda_servico_id);
          setIsLoading(false);
          console.log("serviceData", serviceData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deleteNota(idnota: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accept = window.confirm("Tem a certeza que deseja eliminar?");
        if (accept) {
          const response = await api.delete("/notavisita/delete", {
            data: {
              id: idnota,
            },
          });
          toast.success("Nota eliminada com sucesso");
        }
        await loadData2(VisitaId);
        setUpdateKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao eliminar a nota:", error);
      }
    }
  }

  async function loadData2(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/notavisita/get", {
          id: id,
        });
        const servicesData = response.data;
        console.log("servicessssData", response.data);
        setNotas(servicesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deleteTarefa(idtarefa: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accept = window.confirm("Tem a certeza que deseja eliminar?");
        if (accept) {
          const response = await api.delete(
            `/tarefaservicovisita/delete/${idtarefa}`
          );
          toast.success("Tarefa eliminada com sucesso!");
        }
        setUpdateKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function loadData3(id: number) {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/anomaliavisita/get", {
          id: id,
        });
        if (!response.data) {
          console.error("Erro ao carregar dados:", response);
          return;
        }
        if (response.status === 200) {
          const servicesData = response.data;
          setData(servicesData);
          setIsLoading(false);
          console.log("dataanomalia: ", data);

          console.log("data", data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deletevisita(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accept = window.confirm("Tem a certeza que deseja eliminar?");
        if (accept) {
          const response = await api.delete("/visita/delete/" + id);
          if (response.status === 200) {
            toast.success("Visita eliminada com sucesso!");
            console.log("response", response);
            router.push("/home");
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  const getFirstAndLastName = (fullName: String) => {
    const nameParts = fullName.split(" ");
    if (nameParts.length === 1) {
      // Se houver apenas um nome, retorna-o como o primeiro e último nome
      return { firstName: nameParts[0], lastName: nameParts[0] };
    }
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    return { firstName, lastName };
  };

  return (
    <main className="overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75">
          <Spinner
            className="h-16 w-16 text-gray-900/50"
            style={{ zIndex: 9999 }}
          />
        </div>
      )}
      <div
        className="flex justify-center items-center py-4"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <Typography
          className="mt-2"
          variant="h4"
          style={{
            color:
              serviceData?.agendaServico?.visita?.estado_servico === "terminada"
                ? "#95d7b0"
                : serviceData?.agendaServico?.visita?.estado_servico ===
                  "agendada"
                ? "#4682b4"
                : serviceData?.agendaServico?.visita?.estado_servico ===
                  "cancelada"
                ? "#fa7f72"
                : serviceData?.agendaServico?.visita?.estado_servico ===
                  "em andamento"
                ? "#b2c1b8"
                : "black",
            textDecoration:
              serviceData?.agendaServico?.visita?.estado_servico === "cancelada"
                ? "line-through"
                : "none",
          }}
        >
          {serviceData?.agendaServico?.servico?.nome} {" - "}{" "}
          {serviceData?.agendaServico?.visita?.estado_servico}
        </Typography>
      </div>
      <NotificacoesModal
        open={showModalAccept}
        setOpen={setShowModalAccept}
        setUpdateKey={setUpdateKey}
        id1={id1}
        id2={id2}
      />
      <div
        className="flex justify-end gap-3"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        {user?.user?.tipo_utilizador === "nivel2" &&
          (serviceData?.agendaServico?.visita?.estado_servico === "cancelada" ||
            serviceData?.agendaServico?.visita?.estado_servico ===
              "agendada") && (
            <>
              <Button
                onClick={() => {
                  SetModalChangeStatus(!Modalchangestatus);
                  setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
                }}
                style={{ backgroundColor: "#0F124C" }}
              >
                Mudar estado
              </Button>
            </>
          )}
        <UpdateStatus
          open={Modalchangestatus}
          setOpen={SetModalChangeStatus}
          id={id1}
          setUpdateKey={setUpdateKey}
        />
        {(user?.user?.tipo_utilizador === "nivel3" ||
          user?.user?.tipo_utilizador === "nivel4" ||
          user?.user?.tipo_utilizador === "nivel5") &&
        serviceData?.agendaServico?.visita?.estado_servico === "pendente" &&
        serviceData?.agendaServico?.ativo === 0 ? (
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setshowDialog3(true);
                setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
                setId2(serviceData?.agendaServico?.agenda_servico_id ?? 0);
              }}
              style={{ backgroundColor: "#399918" }}
            >
              Aceitar
            </Button>
            <Button
              onClick={() => {
                setshowDialog(true);
                setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
              }}
              style={{ backgroundColor: "#FF7777" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setshowDialog2(true);
                setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
              }}
              style={{ backgroundColor: "#E2DAD6" }}
            >
              A aguardar
            </Button>
          </div>
        ) : null}
        {(user?.user?.tipo_utilizador === "nivel3" ||
          user?.user?.tipo_utilizador === "nivel4" ||
          user?.user?.tipo_utilizador === "nivel5") &&
          serviceData?.agendaServico?.visita?.estado_servico ===
            "a aguardar" && (
            <div>
              <Button
                onClick={() => {
                  setshowDialog3(true);
                  setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
                  setId2(serviceData?.agendaServico?.agenda_servico_id ?? 0);
                }}
                style={{ backgroundColor: "#399918" }}
                className="mr-2"
              >
                Aceitar
              </Button>
              <Button
                onClick={() => {
                  setshowDialog4(true);
                  setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
                }}
                style={{ backgroundColor: "#FF7777" }}
              >
                Não Aprovar
              </Button>
            </div>
          )}
        {(user?.user?.tipo_utilizador === "nivel3" ||
          user?.user?.tipo_utilizador === "nivel4" ||
          user?.user?.tipo_utilizador === "nivel5") &&
          serviceData?.agendaServico?.visita?.estado_servico === "agendada" && (
            <div>
              <Button
                onClick={() => {
                  setshowDialog(true);
                  setId1(serviceData?.agendaServico?.visita?.visita_id ?? 0);
                }}
                style={{ backgroundColor: "#FF7777" }}
              >
                Cancelar
              </Button>
            </div>
          )}

        {(user?.user?.tipo_utilizador === "nivel3" ||
          user?.user?.tipo_utilizador === "nivel4" ||
          user?.user?.tipo_utilizador === "nivel5") &&
        serviceData?.agendaServico?.visita?.estado_servico !== "terminada" ? (
          <>
            <Button
              onClick={() => deletevisita(VisitaId)}
              style={{ backgroundColor: "#FE0000" }}
            >
              Eliminar Visita
            </Button>
          </>
        ) : null}
        {serviceData?.agendaServico?.visita?.estado_servico === "terminada" ? (
          <>
            <Link
              href={{
                pathname: "/detalhes/pdf",
                query: {
                  id: serviceData?.agendaServico?.agenda_servico_id,
                  idVisita: serviceData?.agendaServico?.visita?.visita_id,
                },
              }}
            >
              <Button style={{ backgroundColor: "#0F124C" }}>
                Página do relatório
              </Button>
            </Link>
          </>
        ) : null}
        <div className="mr-2" style={{ backgroundColor: "#F9FAFB" }}>
          &nbsp;
        </div>
      </div>
      <div
        className="grid grid-cols-3 w-full sm:gap-7 gap-4 p-3"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div>
          <Card className="mt-6 w-200 p-1" style={{ height: "360px" }}>
            <CardBody>
              <Typography color="blue-gray" variant="h5" className="mt-2">
                Cliente:
              </Typography>
              <div className="grid grid-flow-row h-36 p-2 gap-4">
                <p>
                  Nome:
                  <span className="text-black">
                    &nbsp;{serviceData?.agendaServico?.cliente?.nome_completo}
                  </span>
                </p>
                <p>
                  Contacto:
                  <span className="text-black">
                    &nbsp;{serviceData?.agendaServico?.cliente?.contacto}
                  </span>
                </p>
                <p>
                  Email:
                  <span className="text-black">
                    &nbsp;{serviceData?.agendaServico?.cliente?.email}
                  </span>
                </p>

                <p>
                  Morada:
                  <span className="ml-2 text-black">
                    {serviceData?.agendaServico?.endereco?.morada}
                  </span>
                </p>
                <hr className=""></hr>
                <Typography color="blue-gray" variant="h6" className="mb-2">
                  Contrato:
                </Typography>
                <a
                  href="#"
                  className="text-sm underline text-black"
                  onClick={() => {
                    setContratoId(
                      serviceData?.agendaServico?.visita?.contrato_id ?? 0
                    );
                    SetshowModalContrato(!showModalContrato);
                  }}
                >
                  Ver Contrato
                </a>
                <ContratoModal
                  open={showModalContrato}
                  setOpen={SetshowModalContrato}
                  id={ContratoId}
                />
              </div>
            </CardBody>
          </Card>
        </div>
        <Card className="mt-6 w-200" style={{ height: "360px" }}>
          <CardBody>
            <Typography color="blue-gray" variant="h5" className="mb-2">
              Equipa:
            </Typography>
            <div className="overflow-auto h-64">
              {serviceData?.agendaServico?.funcionarios.map(
                (funcionario, index) => {
                  const { firstName, lastName } = getFirstAndLastName(
                    funcionario.nome_completo
                  );
                  return (
                    <div
                      key={index}
                      className="grid grid-flow-col h-fit min-h-20 max-h-40 mt-2"
                      style={{ backgroundColor: "#F9FAFB" }}
                    >
                      <UserCircleIcon
                        className="h-14 w-14 mt-3 ml-2"
                        style={{ color: "black" }}
                      />
                      <p className="mt-4 mr-40 xl:mr-80 lg:mr-80 lg:w-1/2 xl:w-80">
                        {firstName} {lastName}
                        <br></br>
                        <span className="text-black ">{funcionario.cargo}</span>
                      </p>
                    </div>
                  );
                }
              )}
            </div>
            <br></br>
          </CardBody>
          <CardFooter className="pt-0"></CardFooter>
        </Card>
        <Card className="mt-6 w-200" style={{ height: "360px" }}>
          <CardBody>
            <Typography variant="h5" color="blue-gray" className="mb-2">
              {serviceData?.agendaServico?.servico?.nome}
            </Typography>
            <Typography className="mt-5">
              Descrição:{" "}
              <span className="text-sm text-black">
                {serviceData?.agendaServico?.servico?.descricao}
              </span>
            </Typography>
            <br></br>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-flow-col justify-start rounded-xl border-2 w-36 h-8">
                <CalendarIcon className="h-6 w-6 ml-2" />
                <span className="text-sm mt-1 ml-4 text-black">
                  {serviceData?.agendaServico?.visita?.data_visita}
                </span>
              </div>
              <div className="grid grid-flow-col justify-start rounded-xl border-2 w-36 h-8">
                <ClockIcon className="h-6 w-6 ml-2" />
                <span className="text-sm mt-1 ml-4 text-black">
                  {serviceData?.agendaServico?.visita?.hora_visita_inicio.slice(
                    0,
                    5
                  )}{" "}
                  -{" "}
                  {serviceData?.agendaServico?.visita?.hora_visita_fim.slice(
                    0,
                    5
                  )}
                </span>
              </div>
            </div>
          </CardBody>
          <CardFooter className="pt-0"></CardFooter>
        </Card>
        <br />
      </div>
      <Card className="mt-6 w-92 xl:w-full lg:w-full sm:w-2/3">
        <CardBody className="mt-2">
          <div className="flex ">
            <Typography color="blue-gray" className="mb-2">
              Tarefas:
            </Typography>
            {serviceData?.agendaServico?.visita?.estado_servico ===
              "terminada" ||
            serviceData?.agendaServico?.visita?.estado_servico === "agendada" ||
            serviceData?.agendaServico?.visita?.estado_servico === "pendente" ||
            serviceData?.agendaServico?.visita?.estado_servico ===
              "cancelada" ? (
              <Link
                href={"#"}
                onClick={() => {
                  setVisitaId(
                    serviceData?.agendaServico?.visita.visita_id ?? 0
                  );
                  SetshowModalTarefas(!showModalTarefas);
                }}
              >
                <PlusCircleIcon className="w6 h-6" />
              </Link>
            ) : null}
          </div>

          <div className="">
            {tarefas && tarefas.length > 0 ? (
              <div className="grid gap-4 px-4">
                {tarefas.map((tarefa, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gray-100 p-4 flex items-center"
                  >
                    <div
                      className="w-full"
                      style={{
                        textDecoration:
                          tarefa.estado === "concluido"
                            ? "line-through"
                            : "none",
                      }}
                    >
                      {tarefa.tarefa}
                    </div>
                    <Link href={"#"}>
                      <TrashIcon
                        className="w-6 h-6"
                        onClick={() => {
                          if (tarefa.estado !== "concluido") {
                            deleteTarefa(tarefa.tarefa_servico_visita_id);
                          } else {
                            toast.error(
                              "Não pode eliminar uma tarefa concluída"
                            );
                          }
                        }}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">Não há Tarefas</div>
            )}
          </div>
          <TarefaModal
            open={showModalTarefas}
            setOpen={SetshowModalTarefas}
            tarefas={tarefas}
            id={VisitaId}
            setUpdateKey={setUpdateKey}
          />
          <hr className="mt-9"></hr>
          <br></br>
          <div className="flex ">
            <Typography color="blue-gray" className="mb-2">
              Notas:
            </Typography>
            {serviceData?.agendaServico?.visita?.estado_servico ===
              "terminada" ||
            serviceData?.agendaServico?.visita?.estado_servico === "agendada" ||
            serviceData?.agendaServico?.visita?.estado_servico === "pendente" ||
            serviceData?.agendaServico?.visita?.estado_servico ===
              "cancelada" ? (
              <Link
                href="#"
                className="text-sm underline text-black"
                onClick={() => {
                  setVisitaId(
                    serviceData?.agendaServico?.visita.visita_id ?? 0
                  );
                  SetshowModalNotas(!showModalNotas);
                }}
              >
                <PlusCircleIcon className="w6 h-6" />
              </Link>
            ) : null}
          </div>
          <div className="">
            {notas?.notaVisita && notas?.notaVisita.length > 0 ? (
              <div className="grid gap-4 px-4">
                {notas?.notaVisita.map((nota, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-gray-100 p-4 flex items-center"
                  >
                    <div className="w-100">{nota.nota} - </div>
                    <p className="text-xs text-black">{nota.data_criacao}</p>
                    <div className="ml-auto">
                      <Link href={"#"}>
                        <TrashIcon
                          className="w-6 h-6"
                          onClick={() => {
                            deleteNota(nota.notas_id);
                          }}
                        />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">Não há Notas</div>
            )}
          </div>

          <NotasModal
            open={showModalNotas}
            setOpen={SetshowModalNotas}
            id={VisitaId}
            setUpdateKey={setUpdateKey}
          />
          <hr className="mt-9"></hr>
          <br></br>
          <div className="flex ">
            <Typography color="blue-gray" className="mb-2">
              Anomalias:
            </Typography>
            {serviceData?.agendaServico?.visita?.estado_servico ===
              "terminada" ||
            serviceData?.agendaServico?.visita?.estado_servico === "agendada" ||
            serviceData?.agendaServico?.visita?.estado_servico === "pendente" ||
            serviceData?.agendaServico?.visita?.estado_servico ===
              "cancelada" ? (
              <Link
                href="#"
                className="text-sm underline text-black"
                onClick={() => {
                  setVisitaId(serviceData?.agendaServico?.visita?.visita_id);
                  SetshowModalAnomaliaAdd(!showModalAnomaliaAdd);
                }}
              >
                <PlusCircleIcon className="w6 h-6" />
              </Link>
            ) : null}
          </div>
          <div className="">
            {data?.anomaliaVisita && data?.anomaliaVisita?.length > 0 ? (
              <div className="grid gap-4 px-4">
                {data?.anomaliaVisita?.map((anomalia, index) => (
                  <div key={index} className="rounded-xl bg-gray-100 p-4">
                    <div className="w-96 ">{anomalia?.anomalia}</div>
                    <div className="mt-3">
                      <Link
                        href={"#"}
                        onClick={() => SetshowModalImagem(!showModalImagem)}
                      >
                        {anomalia?.fotografia?.length > 0 ? (
                          <Image
                            src={
                              anomalia?.fotografia.startsWith("/") ||
                              anomalia?.fotografia.startsWith("http")
                                ? anomalia.fotografia
                                : `/${anomalia.fotografia}`
                            }
                            alt="Not available"
                            width={250}
                            height={250}
                          />
                        ) : null}
                        <div>
                          <ImagemModal
                            open={showModalImagem}
                            setOpen={SetshowModalImagem}
                            descricao={anomalia.anomalia}
                          />
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                Não foram detetadas anomalias nesta visita
              </div>
            )}
          </div>
          <AnomaliasModal
            open={showModalAnomalias}
            setOpen={SetshowModalAnomalias}
            id={VisitaId}
          />
          <AnomaliaModalAdd
            open={showModalAnomaliaAdd}
            setOpen={SetshowModalAnomaliaAdd}
            id={VisitaId}
            setUpdateKey={setUpdateKey}
          />
          <NotasModal2
            open={showDialog}
            setOpen={setshowDialog}
            id={id1}
            setUpdateKey={setUpdateKey}
          />
          <NotasModal3
            open={showDialog2}
            setOpen={setshowDialog2}
            id={id1}
            setUpdateKey={setUpdateKey}
          />
          <NotasModal4
            open={showDialog4}
            setOpen={setshowDialog4}
            id={id1}
            setUpdateKey={setUpdateKey}
          />
          <ReagendarVisitaPendenteModal
            open={showDialog3}
            setOpen={setshowDialog3}
            idvisita={id1}
            idagenda={id2}
            setUpdateKey={setUpdateKey}
          />

          <br></br>
        </CardBody>
        <CardFooter className="pt-0"></CardFooter>
      </Card>
      <div
        className="flex justify-center"
        style={{ backgroundColor: "#F9FAFB" }}
      ></div>
    </main>
  );
}
