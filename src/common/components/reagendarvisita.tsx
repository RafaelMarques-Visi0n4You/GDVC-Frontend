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

export default function ReagendarVisitaModal({
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
  const [formData, setFormData] = React.useState({
    equipa_id: 0,
    data_visita_inicio: "",
    hora_visita_inicio: "",
    hora_visita_fim: "",
    data_visita_fim: "",
  });

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

  const horainicio = formData.hora_visita_inicio.padStart(5, "0");
  const horafim = formData.hora_visita_fim.padStart(5, "0");

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

  const checkEquipaDisponibilidade = (
    hora_visita_inicio: string,
    hora_visita_fim: string,
    data_visita: string,
    equipaId: number,
    data_visita_fim: string,
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
      }) => {
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
              return true; // Há sobreposição, a equipe não está disponível
            }
          }
        }
        return false;
      }
    );

    return equipeDisponivel;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (formData.hora_visita_inicio >= formData.hora_visita_fim) {
          toast.error(
            "Hora de início não pode ser maior ou igual que a hora de fim"
          );
        }

        if (
          !formData.equipa_id &&
          data.user.tipo_utilizador !== "nivel1" &&
          data.user.tipo_utilizador !== "nivel2"
        ) {
          toast.error("Selecione uma equipa");
          return;
        }

        const formattedStart = formData.data_visita_inicio.replace(/\//g, "-");
        const formattedEnd = formData.data_visita_fim.replace(/\//g, "-");
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

        if (formData.hora_visita_inicio >= formData.hora_visita_fim) {
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
            formData.hora_visita_inicio,
            formData.hora_visita_fim,
            formData.data_visita_inicio,
            data.user.funcionario.equipa_id.toString(),
            formData.data_visita_fim,
            equipasAgenda
          );
          if (!equipaDisponivel) {
            toast.error("Equipa ocupada neste horário");
            return;
          }
        } else {
          if (formData.equipa_id === 0) {
            toast.error("Selecione uma equipa");
            return;
          }
        }

        const isEquipaDisponivel = checkEquipaDisponibilidade(
          formData.hora_visita_inicio,
          formData.hora_visita_fim,
          formData.data_visita_inicio,
          formData.equipa_id,
          formData.data_visita_fim,
          equipasAgenda
        );
        if (!isEquipaDisponivel) {
          toast.error("Equipa ocupada neste horário");
          return;
        }

        const response = await api.put("/agendaservico/update/" + idagenda, {
          equipa_id: formData.equipa_id,
        });

        console.log("Agenda Serviço Atualizadaaaa:", response.data);

        const response2 = await api.put("/visita/update/" + idvisita, {
          data_visita: formData.data_visita_inicio,
          data_visita_fim: formData.data_visita_fim,
          hora_visita_inicio: formData.hora_visita_inicio,
          hora_visita_fim: formData.hora_visita_fim,
        });

        console.log("Visita Atualizadaaaa:", response2.data);

        // Verifique se a equipe foi criada com sucesso

        // Crie o chefe da equipe usando o ID da equipe

        // Limpe os campos do formulário se necessário
        setFormData({
          equipa_id: 0,
          data_visita_inicio: "",
          hora_visita_inicio: "",
          hora_visita_fim: "",
          data_visita_fim: "",
        });

        toast.success("Visita reagendada com sucesso");
        setUpdateKey((prev) => prev + 1);
        handleClose();
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };

  const equipaocupada = checkEquipaDisponibilidade(
    formData.hora_visita_inicio,
    formData.hora_visita_fim,
    formData.data_visita_inicio,
    formData.equipa_id,
    formData.data_visita_fim,
    equipasAgenda
  );

  const userLevel = data?.user?.tipo_utilizador;

  const isEquipaOcupada =
    userLevel === "nivel3" || userLevel === "nivel4" || userLevel === "nivel5";

  useEffect(() => {
    console.log("Data:", data);

    loadEquipas();
    checkEquipasAgenda();
  }, [open, formData]);

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
          Reagendar Visita
        </Typography>

        <form onSubmit={handleSubmit} className="py-7 px-10 sm:w-94 ">
          <div className="flex flex-col col-span-12 gap-7 sm:flex-row sm:gap-9">
            <div className="w-1/2">
              <Input
                aria-label="Date"
                type="date"
                label="Data Início Visita"
                value={formData.data_visita_inicio}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    data_visita_inicio: event.target.value,
                  })
                }
              />
            </div>
            <div className="w-1/2">
              <Input
                aria-label="Date"
                type="date"
                label="Data Fim Visita"
                value={formData.data_visita_fim}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    data_visita_fim: event.target.value,
                  })
                }
              />
            </div>
          </div>
          <br />
          <div className="flex flex-col col-span-12 gap-7 sm:flex-row sm:gap-9">
            <div className="w-1/2">
              <Input
                type="time"
                label="Hora Início Visita"
                value={formData.hora_visita_inicio || ""}
                onChange={(event) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    hora_visita_inicio: event.target.value,
                  }));
                }}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="time"
                label="Hora Início Visita"
                value={formData?.hora_visita_fim || ""}
                onChange={(event) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    hora_visita_fim: event.target.value,
                  }));
                }}
              />
            </div>
          </div>

          <br />
          <div className="w-full">
            <Select
              label="Equipa"
              value={String(formData.equipa_id)}
              onChange={(value) => {
                setFormData((prevData) => ({
                  ...prevData,
                  equipa_id: parseInt(value as string),
                }));
              }}
              className="w-full"
            >
              {/* Mapeia e renderiza apenas as equipes disponíveis */}
              {equipas?.equipas
                ?.filter((equipa) => equipa?.ativo === 1)
                ?.map((equipa) => {
                  const disponibilidade = checkEquipaDisponibilidade(
                    formData.hora_visita_inicio,
                    formData.hora_visita_fim,
                    formData.data_visita_inicio,
                    equipa.equipa_id,
                    formData.data_visita_fim,
                    equipasAgenda
                  );

                  return (
                    <Option
                      key={equipa?.equipa_id}
                      value={String(equipa?.equipa_id)}
                      disabled={disponibilidade ? false : true}
                    >
                      {equipa?.nome} -{" "}
                      {disponibilidade ? "Disponível" : "Ocupada"}
                    </Option>
                  );
                })}
            </Select>
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
