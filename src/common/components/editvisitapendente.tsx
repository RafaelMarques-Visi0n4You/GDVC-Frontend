import styled from "@emotion/styled";

import { getCookie } from "cookies-next";

import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const StyleWrapper = styled.div`
  .ant-picker {
    z-index: 9999 !important;
  }
`;

interface Data {
  Status: string;
  visita: {
    visita_id: number;
    cliente_id: number;
    data_visita: string;
    hora_visita_inicio: string;
    hora_visita_fim: string;
    agenda: number;
    nota: string;
    ativo: number;
    agenda_servico: {
      empresa_id: number;
      equipa: {
        equipa_id: number;
        empresa_id: number;
        nome: string;
        descricao: string;
        ativo: number;
      };
    };
  };
  clientes: {
    cliente_id: number;
    empresa_id: number;
    nome_completo: string;
    nif: string;
    email: string;
    contacto: string;
    morada: string;
    cod_postal: string;
    localidade: string;
    ativo: number;
  }[];
  contrato: {
    contrato_id: number;
    cliente_id: number;
    data_inicio: string;
    data_fim: string;
    tipo_contrato: string;
    descricao: string;
    ativo: number;
    nome: string;
  }[];
  equipas: {
    equipa_id: number;
    empresa_id: number;
    nome: string;
    descricao: string;
    ativo: number;
  }[];
}

export default function ReagendarVisitaPendenteModal({
  open,
  setOpen,
  idvisita,
  idagenda,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idvisita: number;
  idagenda: number;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const data = useContext(AuthContext);
  const [equipas, setEquipas] = useState<Data | null>(null);
  const [equipasAgenda, setEquipasAgenda] = useState<{
    Status: string;
    agendaServicos: {
      data_visita: string;
      equipa_id: number;
      hora_visita_fim: string;
      hora_visita_inicio: string;
    }[];
  }>({ Status: "", agendaServicos: [] });
  const [myequipa, setMyEquipa] = useState<Data | null>(null);
  const [visita, setVisita] = useState<Data | null>(null);
  const [idusado, setIdUsado] = useState<number | null>(null);

  const [equipa_id, setEquipaId] = useState<number | null>(null);
  const [data_visita_inicio, setDataVisitaInicio] = useState<string>("");
  const [hora_visita_inicio, setHoraVisitaInicio] = useState<string>("");
  const [hora_visita_fim, setHoraVisitaFim] = useState<string>("");
  const [data_visita_fim, setDataVisitaFim] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  const formatTime = (timeString: string) => {
    return timeString.padStart(5, "0") + ":00";
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}-${month}-${year}`;
  };

  async function loadEquipas() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/equipa/get", {
          id: data.user.funcionario.empresa_id,
        });
        setEquipas(response.data);
        console.log("Equipas:", response.data);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    }
  }

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        api
          .get("/visita/get/" + idvisita)
          .then((response) => {
            setIdUsado(response.data.visita.agenda_servico.equipa.equipa_id);
            setEquipaId(response.data.visita.agenda_servico.equipa.equipa_id);
            setDataVisitaInicio(response.data.visita.data_visita);
            setHoraVisitaInicio(response.data.visita.hora_visita_inicio);
            setHoraVisitaFim(response.data.visita.hora_visita_fim);
            setDataVisitaFim(response.data.visita.data_visita);
          })
          .catch((error) => {
            // Trate o erro adequadamente, por exemplo, exibindo uma mensagem de erro
            console.error("Erro ao obter dados da equipa:", error);
          });
      } catch (error) {
        // Trate o erro capturado pelo try-catch, se necessário
        console.error("Erro ao tentar obter dados do cliente:", error);
      }
    }
  }, [idvisita]);

  async function checkEquipasAgenda() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/agendaservico/getByEquipas", {
          id: data.user.funcionario.empresa_id,
        });
        setEquipasAgenda(response.data);
        console.log("Agenda Serviço:", response.data);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    }
  }

  async function handleAcceptVisit() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put("/visita/acceptVisit", {
          id: idvisita,
        });
        if (response.status === 200) {
          console.log(response.data);
          setUpdateKey((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Erro ao aceitar visita:", error);
      }
    }
  }

  const checkEquipaDisponibilidade = (
    hora_visita_inicio: string,
    hora_visita_fim: string,
    data_visita: string,
    equipaId: number | null,
    data_visita_fim: string,
    idvisita: number,
    idusado: number | null,
    equipasagenda: { Status?: string; agendaServicos: any }
  ) => {
    if (!equipasagenda || !equipasagenda.agendaServicos) {
      return true; // Se não houver agenda de serviços, a equipe está disponível
    }

    const datainicio =
      data_visita < data_visita_fim ? data_visita : data_visita_fim;
    const datafim =
      data_visita < data_visita_fim ? data_visita_fim : data_visita;

    const datainicioformatada = formatDate(datainicio);
    const datafimformatada = formatDate(datafim);

    const horainicio = formatTime(hora_visita_inicio);
    const horafim = formatTime(hora_visita_fim);

    const equipeDisponivel = !equipasagenda.agendaServicos.some(
      (agenda: {
        data_visita: string;
        hora_visita_inicio: string;
        hora_visita_fim: string;
        equipa_id: number;
        visita_id: number;
      }) => {
        if (agenda.equipa_id === idusado) {
          console.log("Mesma visita encontrada, equipe disponível");
          return false; // Se for a mesma visita, considera como disponível
        }
        console.log("Agenda:", agenda.visita_id);

        const dataVisitaAgenda = formatDate(agenda.data_visita);

        if (agenda.equipa_id === equipaId) {
          const horaInicioVisita = formatTime(agenda.hora_visita_inicio);
          const horaFimVisita = formatTime(agenda.hora_visita_fim);

          if (
            dataVisitaAgenda >= datainicioformatada &&
            dataVisitaAgenda <= datafimformatada
          ) {
            if (
              (horainicio >= horaInicioVisita && horainicio < horaFimVisita) ||
              (horafim > horaInicioVisita && horafim <= horaFimVisita) ||
              (horainicio <= horaInicioVisita && horafim >= horaFimVisita)
            ) {
              console.log(
                "Horário sobreposto encontrado, equipe não disponível"
              );
              return true; // Há sobreposição, a equipe não está disponível
            }
          }
        }
      }
    );

    console.log(`Equipe ${equipaId} disponível: ${equipeDisponivel}`);
    return equipeDisponivel;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (hora_visita_inicio >= hora_visita_fim) {
          toast.error(
            "Hora de início não pode ser maior ou igual que a hora de fim"
          );
        }

        if (
          !equipa_id &&
          data.user.tipo_utilizador !== "nivel1" &&
          data.user.tipo_utilizador !== "nivel2"
        ) {
          toast.error("Selecione uma equipa");
          return;
        }

        const formattedStart = data_visita_inicio.replace(/\//g, "-");
        const formattedEnd = data_visita_fim.replace(/\//g, "-");
        const currentDate = new Date().toISOString().split("T")[0];
        const dataAtual = currentDate.replace(/\//g, "-");
        console.log("Data Atual:", dataAtual);
        console.log("Data Início:", formattedStart);
        console.log("Data Fim:", formattedEnd);

        if (formattedStart > formattedEnd) {
          toast.error("Data de início não pode ser maior que a data de fim");
          return;
        }

        if (formattedStart < dataAtual || formattedEnd < dataAtual) {
          toast.error(
            "Data de início e data de fim não podem ser menores que a data atual"
          );
          return;
        }

        if (hora_visita_inicio >= hora_visita_fim) {
          toast.error(
            "Hora de início não pode ser maior ou igual que a hora de fim"
          );
          return;
        }

        if (
          data.user.tipo_utilizador === "nivel1" ||
          data.user.tipo_utilizador === "nivel2"
        ) {
          const equipaDisponivel = checkEquipaDisponibilidade(
            hora_visita_inicio,
            hora_visita_fim,
            data_visita_inicio,
            data.user.funcionario.equipa_id.toString(),
            data_visita_fim,
            idvisita,
            idusado,
            equipasAgenda
          );
          if (!equipaDisponivel) {
            toast.error("Equipa ocupada neste horário");
            return;
          }
        } else {
          if (equipa_id === 0) {
            toast.error("Selecione uma equipa");
            return;
          }
        }

        const isEquipaDisponivel = checkEquipaDisponibilidade(
          hora_visita_inicio,
          hora_visita_fim,
          data_visita_inicio,
          equipa_id,
          data_visita_fim,
          idvisita,
          idusado,
          equipasAgenda
        );
        if (!isEquipaDisponivel) {
          toast.error("Equipa ocupada neste horário");
          return;
        }

        const response = await api.put("/agendaservico/update/" + idagenda, {
          equipa_id: equipa_id,
        });

        console.log("Agenda Serviço Atualizadaaaa:", response.data);

        const response2 = await api.put("/visita/update/" + idvisita, {
          data_visita: data_visita_inicio,
          data_visita_fim: data_visita_fim,
          hora_visita_inicio: hora_visita_inicio,
          hora_visita_fim: hora_visita_fim,
          nota: nota,
        });

        console.log("Visita Atualizadaaaa:", response2.data);

        // Verifique se a equipe foi criada com sucesso

        // Crie o chefe da equipe usando o ID da equipe

        // Limpe os campos do formulário se necessário

        if (response.status === 200) {
          const response2 = await api.put("/visita/acceptVisit", {
            id: idvisita,
          });
          if (response2.status === 200) {
            console.log(response2.data);
            setUpdateKey((prev) => prev + 1);
          }
          toast.success("Visita reagendada com sucesso");
          setUpdateKey((prev) => prev + 1);
          handleClose();
        }
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };

  const equipaocupada = checkEquipaDisponibilidade(
    hora_visita_inicio,
    hora_visita_fim,
    data_visita_inicio,
    equipa_id,
    data_visita_fim,
    idvisita,
    idusado,
    equipasAgenda
  );

  const userLevel = data?.user?.tipo_utilizador;

  const isEquipaOcupada =
    userLevel === "nivel3" || userLevel === "nivel4" || userLevel === "nivel5";

  useEffect(() => {
    console.log("Data:", data);

    loadEquipas();
    checkEquipasAgenda();
  }, [open]);

  return (
    <>
      <Dialog open={open}>
        <Typography
          className="flex justify-center mt-5"
          variant="h4"
          color="blue-gray"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Aceitar Visita
        </Typography>

        <form onSubmit={handleSubmit} className="py-7 px-10 sm:w-94 ">
          <div className="flex flex-col col-span-12 gap-7 sm:flex-row sm:gap-9">
            <div className="w-1/2">
              <Input
                aria-label="Date"
                type="date"
                label="Data Início Visita"
                onChange={(e) => setDataVisitaInicio(e.target.value)}
                value={data_visita_inicio}
              />
            </div>
            <div className="w-1/2">
              <Input
                aria-label="Date"
                type="date"
                label="Data Fim Visita"
                onChange={(e) => setDataVisitaFim(e.target.value)}
                value={data_visita_fim}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-col col-span-12 gap-7 sm:flex-row sm:gap-9">
            <div className="w-1/2">
              <Input
                type="time"
                label="Hora Início Visita"
                onChange={(e) => setHoraVisitaInicio(e.target.value)}
                value={hora_visita_inicio}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="time"
                label="Hora Fim Visita"
                onChange={(e) => setHoraVisitaFim(e.target.value)}
                value={hora_visita_fim}
              />
            </div>
          </div>

          <br />
          <div className="w-full">
            <Select
              label="Equipa"
              value={String(equipa_id)}
              onChange={(event) => setEquipaId(Number(event))}
              className="w-full"
            >
              {/* Mapeia e renderiza apenas as equipes disponíveis */}
              {equipas?.equipas
                ?.filter((equipa) => equipa?.ativo === 1)
                ?.map((equipa) => {
                  const disponibilidade = checkEquipaDisponibilidade(
                    hora_visita_inicio,
                    hora_visita_fim,
                    data_visita_inicio,
                    equipa.equipa_id,
                    data_visita_fim,
                    idvisita,
                    idusado,
                    equipasAgenda
                  );

                  return (
                    <Option
                      key={equipa?.equipa_id}
                      value={String(equipa?.equipa_id)}
                      disabled={!disponibilidade}
                    >
                      {equipa?.nome} -{" "}
                      {disponibilidade ? "Disponível" : "Ocupada"}
                    </Option>
                  );
                })}
            </Select>
            <br />
            <div className="flex flex-row ">
              <Textarea
                label="Notas adicionais"
                style={{ minHeight: "100px" }}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              />
            </div>
          </div>

          <div className="mt-4 sm:flex sm:justify-center flex justify-center gap-10">
            <Button
              className="mt-3 md:mt-0 sm:w-1/3"
              style={{
                color: "white",
                backgroundColor: "#A6A6A6",
              }}
              onClick={handleClose}
            >
              Cancelar
            </Button>
            {isEquipaOcupada ? (
              <Button
                type="submit"
                style={{
                  color: "white",
                  backgroundColor: "#0F124C",
                }}
                className="sm:w-1/3  md:mt-0"
                disabled={!equipaocupada}
              >
                Agendar
              </Button>
            ) : (
              <Button
                type="submit"
                style={{
                  color: "white",
                  backgroundColor: "#0F124C",
                }}
                className="sm:w-1/3  md:mt-0"
              >
                Agendar
              </Button>
            )}
          </div>
        </form>
        <Toaster containerStyle={{ zIndex: 9999 }} />
      </Dialog>
    </>
  );
}
