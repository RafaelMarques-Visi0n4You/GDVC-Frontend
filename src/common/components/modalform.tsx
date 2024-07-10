import styled from "@emotion/styled";
import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Textarea,
  Typography,
} from "@material-tailwind/react";

import { getCookie } from "cookies-next";

import React, { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import Router from "next/router";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import { NavList } from "./navbar";

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

export default function LongDialog({
  open,
  setOpen,
  datacalendario,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  datacalendario: String;
}) {
  const data = useContext(AuthContext);

  const [clienteselected, setClienteselected] = useState<number | null>(null);
  const [clientes, setClientes] = useState<Data | null>(null);
  const [contratos, setContratos] = useState<Data | null>(null);
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
    contrato_id: 0,
    nota: "",
    tarefas: "",
    tempo_estimado: 0,
    tipo_tempo_estimado: "",
    data_visita_fim: "",
  });

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
  const dataFormatada = datacalendario.toString().split("T")[0];

  useEffect(() => {
    console.log("Data:", data);
    loadClientes();
    console.log("Data:", dataFormatada);
    loadContratos(clienteselected || 0);
    loadEquipas();
    checkEquipasAgenda();
  }, [open, formData, dataFormatada]);

  async function loadClientes() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/cliente/getMyClients", {
          id: data.user.funcionario.empresa_id,
        });
        setClientes(response.data);
        console.log("Clientes:", response.data);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
      }
    }
  }

  async function loadContratos(cliente_id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/contrato/getClientContract", {
          id: cliente_id,
        });

        setContratos(response.data);
        console.log("Contratos:", contratos);
      } catch (error) {
        console.error("Erro ao carregar contratos:", error);
      }
    }
  }

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

  async function loadmyequipa() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const id = data.user.funcionario.equipa_id;
        const response = await api.post("/equipa/get/" + id);
        setMyEquipa(response.data);
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
        if (formData.contrato_id === 0) {
          toast.error("Selecione um contrato");
          return;
        }

        if (formData.hora_visita_inicio >= formData.hora_visita_fim) {
          toast.error(
            "Hora de início não pode ser maior ou igual que a hora de fim"
          );
        }

        if (!clienteselected) {
          toast.error("Selecione um cliente");
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
        console.log("Data Atual:", dataFormatada);

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

        const response = await api.post("/agendaservico/create", {
          equipa_id:
            data.user.tipo_utilizador === "nivel1" ||
            data.user.tipo_utilizador === "nivel2"
              ? data.user.funcionario.equipa_id
              : formData.equipa_id,

          empresa_id: data.user.funcionario.empresa_id,
          criado_por_id: data.user.conta_utilizador_id,
          data_visita: formattedStart,
          hora_visita_inicio: horainicio,
          hora_visita_fim: horafim,
          contrato_id: formData.contrato_id,
          nota: formData.nota,
          departamento_id: data.user.funcionario.departamento_id,
          tempo_estimado: formData.tempo_estimado,
          tipo_tempo_estimado: formData.tipo_tempo_estimado,
          data_visita_fim: formattedEnd,
          ativo:
            data.user.tipo_utilizador === "nivel4" ||
            data.user.tipo_utilizador === "nivel3"
              ? 1
              : 0,
        });

        console.log("Resposta da criação da visita:", response.data);

        // Verifique se a equipe foi criada com sucesso

        // Crie o chefe da equipe usando o ID da equipe

        // Limpe os campos do formulário se necessário
        setFormData({
          equipa_id: 0,
          data_visita_inicio: "",
          hora_visita_inicio: "",
          hora_visita_fim: "",
          contrato_id: 0,
          nota: "",
          tarefas: "",
          tempo_estimado: 0,
          tipo_tempo_estimado: "",
          data_visita_fim: "",
        });

        setClienteselected(null);
        toast.success("Visita agendada com sucesso");
        handleClose();
        if (data.user.tipo_utilizador === "nivel3" || "nivel4") {
          Router.reload();
        }
        NavList();
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  const checkEquipaDisponibilidade2 = (
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

    const horainicio =
      hora_visita_inicio < hora_visita_fim
        ? hora_visita_inicio
        : hora_visita_fim;
    const horafim =
      hora_visita_inicio < hora_visita_fim
        ? hora_visita_fim
        : hora_visita_inicio;

    const horaInicioFormatada = formatTime(horainicio);
    const horaFimFormatada = formatTime(horafim);

    const equipeDisponivel = !equipasagenda.agendaServicos.some(
      (agenda: {
        data_visita: string;
        hora_visita_inicio: string;
        hora_visita_fim: string;
        equipa_id: number;
      }) => {
        const dataVisitaAgenda = formatDate(agenda.data_visita);
        const horaInicioVisita = formatTime(agenda.hora_visita_inicio);
        const horaFimVisita = formatTime(agenda.hora_visita_fim);

        if (
          agenda.equipa_id === equipaId &&
          dataVisitaAgenda >= datainicioformatada &&
          dataVisitaAgenda <= datafimformatada
        ) {
          return (
            (horaInicioFormatada >= horaInicioVisita &&
              horaInicioFormatada < horaFimVisita) ||
            (horaFimFormatada > horaInicioVisita &&
              horaFimFormatada <= horaFimVisita) ||
            (horaInicioFormatada <= horaInicioVisita &&
              horaFimFormatada >= horaFimVisita)
          );
        }
        return false;
      }
    );

    return equipeDisponivel;
  };

  const equipaunica = checkEquipaDisponibilidade2(
    formData.hora_visita_inicio,
    formData.hora_visita_fim,
    formData.data_visita_inicio,
    data?.user?.funcionario?.equipa_id,
    formData.data_visita_fim,
    equipasAgenda
  );

  const equipaocupada = checkEquipaDisponibilidade(
    formData.hora_visita_inicio,
    formData.hora_visita_fim,
    formData.data_visita_inicio,
    formData.equipa_id,
    formData.data_visita_fim,
    equipasAgenda
  );

  const userLevel = data?.user?.tipo_utilizador;

  const isEquipaUnica = userLevel === "nivel1" || userLevel === "nivel2";
  const isEquipaOcupada = userLevel === "nivel3" || userLevel === "nivel4";

  console.log("Equipa Unica:", isEquipaUnica);
  console.log("Equipa Ocupada:", isEquipaOcupada);

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
          Agendar Visita
        </Typography>

        <div className=" px-10 mt-10 w-full">
          <Select
            label="Cliente"
            value={String(clienteselected)}
            onChange={(value) => {
              setClienteselected(Number(value));
              loadContratos(Number(value));
            }}
            className="w-full"
          >
            {clientes?.clientes
              ?.filter((cliente) => cliente?.ativo === 1)
              ?.map((cliente) => (
                <Option
                  key={cliente?.cliente_id}
                  value={String(cliente?.cliente_id)}
                >
                  {cliente?.nome_completo}
                </Option>
              ))}
          </Select>
        </div>

        <form onSubmit={handleSubmit} className="py-7 px-10 sm:w-94 ">
          <div className="w-full">
            <Select
              label="Contrato"
              onChange={(value) => {
                setFormData((prevData) => ({
                  ...prevData,
                  contrato_id: parseInt(value as string),
                }));
              }}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              {contratos?.contrato
                ?.filter((contrato) => contrato?.ativo === 1)
                ?.map((contrato) => (
                  <Option
                    key={contrato?.contrato_id}
                    value={String(contrato?.contrato_id)}
                  >
                    {contrato?.nome}
                  </Option>
                ))}
            </Select>
          </div>
          <br />

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
            {data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel3" ? (
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
            ) : (
              <Select
                label="Equipa"
                disabled
                className="w-full"
                value={String(data?.user?.funcionario?.equipa_id)}
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    equipa_id: data?.user?.funcionario?.equipa_id,
                  }));
                }}
              >
                {!equipaunica ? (
                  <Option
                    value={String(data?.user?.funcionario?.equipa_id)}
                    style={{ color: "red" }}
                  >
                    Equipa ocupada neste horário!
                  </Option>
                ) : (
                  <Option value={String(data?.user?.funcionario?.equipa_id)}>
                    {data.user?.funcionario?.equipa?.nome}
                  </Option>
                )}
              </Select>
            )}
          </div>

          <br />
          <div className="flex flex-row ml-1"></div>
          <div className="flex flex-row ">
            <Textarea
              label="Notas adicionais"
              style={{ minHeight: "100px" }}
              value={formData.nota}
              onChange={(event) =>
                setFormData({ ...formData, nota: event.target.value })
              }
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            />
          </div>
          <br />

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
            {isEquipaUnica ? (
              <Button
                type="submit"
                style={{
                  color: "white",
                  backgroundColor: "#0F124C",
                }}
                className="sm:w-1/3  md:mt-0"
                disabled={!equipaunica}
              >
                Agendar
              </Button>
            ) : isEquipaOcupada ? (
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
