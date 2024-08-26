import { AuthContext } from "@/common/components/AuthContext";
import styled from "@emotion/styled";
import { EventContentArg, EventSourceInput } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Fragment, useContext, useEffect, useState } from "react";
import api from "../../common/services/api";

import LongDialog from "@/common/components/modalform";
import { PlusIcon } from "@heroicons/react/24/outline";
import { UsersIcon } from "@heroicons/react/24/solid";
import { Button, Spinner, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import router from "next/router";
import React from "react";

const icon = UsersIcon;

interface Event {
  title: string;
  start: any;
  allDay: boolean;
  data_visita: string;
  hora_visita_inicio: string;
  hora_visita_fim: string;
  servicos: { nome: string }[];
  id: number;
  visita_id: number;
  agenda_servico_id: number;
  id_agenda: number;
  cor_equipa: string;
  estado_servico: string;
}

export const StyleWrapper2 = styled.div`
  .fc .fc-daygrid-body-unbalanced .fc-daygrid-day-events {
    min-height: 0rem !important;
  }
  .fc .fc-toolbar-title {
    font-size: 1rem;
    margin-left: 67px;
    margin-top: -30px;
  }

  .fc button {
    height: 2rem;
    width: 2.3rem;
    margin-top: 15px;
    padding-right: 0.5rem;
    margin-right: 11rem;
  }

  .fc .fc-button .fc-icon {
    height: 2rem;

    font-size: 1rem;
  }

  .fc .fc-toolbar-chunk {
    margin-left: 2rem;
  }
  .fc .fc-toolbar {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
  }
`;

export const StyleWrapper = styled.div`
  .fc td {
    background: white;
    font-size: 1rem;
  }
  .fc th {
    border: none;
    overflow-y: hidden;
    font-size: 1rem;
  }
  .fc table {
    border-top: none;
    border-left: none;
    width: 103%;
    height: 100%;
  }
  .fc daygrid-day-frame {
    border: none;
    width: 100%;
  }

  .fc-myCustomButton-button {
    margin-top: 10px;
  }

  @media screen and (min-width: 1832px) {
    .fc-myCustomButton-button {
      margin-top: 0px;
    }
  }

  .fc .fc-button {
    border: none;
  }

  .fc-scrollgrid fc-scrollgrid-liquid {
    width: 100%;
  }

  .fc-toolbar-chunk {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  @media screen and (min-width: 1832px) {
    .fc-toolbar-chunk {
      width: 100%;
      margin-left: 50px;
    }
  }

  .fc-event {
    border: none;
  }
  .fc-event-main {
    border: none;
    background-color: none;
  }
  .fc-v-event {
    border: none;
    background-color: white;
  }
  .fc .fc-toolbar {
    gap: 195px;
    width: 103%;
  }
  .fc .fc-scroller {
    overflow-y: hidden !important;
  }

  .fc .fc-dayGridMonth-view .fc-scroller-liquid-absolute {
    overflow-y: hidden !important;
  }

  .fc .fc-scroller-liquid-absolute {
    overflow-y: scroll !important;
  }

  .fc .fc-toolbar-title {
    font-size: 1.2rem;
  }
`;

export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    start: "",
    data_visita: "",
    allDay: false,
    id: 0,
    hora_visita_inicio: "",
    hora_visita_fim: "",
    servicos: [{ nome: "" }],
    visita_id: 0,
    agenda_servico_id: 0,
    id_agenda: 0,
    cor_equipa: "",
    estado_servico: "",
  });
  const [visitas, setVisitas] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModalVisita, setShowModalVisita] = useState(false);
  const [dataVisita, setDataVisita] = useState("");
  const [dataAtual, setDataAtual] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [visitascores, setVisitascores] = useState([]);
  const [equipacor, setEquipaCor] = useState<number | null>(null);

  // get all unique equipas from visitas
  const equipas = visitas
    .filter(
      (visita, index, self) =>
        self.findIndex(
          (v) =>
            v.agenda_servico.equipa.equipa_id ===
            visita.agenda_servico.equipa.equipa_id
        ) === index
    )
    .map((visita) => visita.agenda_servico.equipa);

  console.log("equipas:", equipas);

  const data = useContext(AuthContext);
  console.log(data);

  const calendarRef = React.createRef();

  function updateCalendarDate() {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(selectedDate);
    }
  }

  //change the date of the calendar when the selected date changes
  useEffect(() => {
    updateCalendarDate();
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, []);

  function handleNavLinkDayClick(clickedDate: Date) {
    setSelectedDate(clickedDate);
  }

  function handleDateClick(arg: { date: Date; allDay: boolean }) {
    const selectedDate = arg.date;
    console.log("Data selecionada: ", selectedDate);

    // Obter dia, mês e ano da data selecionada
    const dia = selectedDate.getDate().toString().padStart(2, "0"); // Adiciona um zero à esquerda se for menor que 10
    const mes = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // Adiciona um zero à esquerda se for menor que 10
    const ano = selectedDate.getFullYear();

    // Formatar a data no formato "dd-mm-yyyy"
    const data_visita = `${ano}-${mes}-${dia}`;

    setDataVisita(data_visita);
    setShowModalVisita(true);
  }

  function addEvent(events: Event[], corequipa: String[]) {
    const filteredEvents = events.filter((event) =>
      ["agendada", "terminada", "cancelada"].includes(event.estado_servico)
    );

    const newEventList = [
      ...allEvents,
      ...filteredEvents.map((event, index) => ({
        ...event,

        start: new Date(event.data_visita + "T" + event.hora_visita_inicio),
        end: new Date(event.data_visita + "T" + event.hora_visita_fim),
        title: event.servicos[0]?.nome,
        allDay: false,
        id: event.visita_id,
        agenda_servico_id: event.agenda_servico_id,
        cor_equipa: corequipa[index],
        estado_servico: event.estado_servico,
      })),
    ] as Event[];
    console.log("newEventList:", newEventList);
    setAllEvents(newEventList);
  }

  function onEventClick(data: any) {
    console.log(
      "agenda_servico_id:",
      data.event.extendedProps.agenda_servico_id
    );
    router.push({
      pathname: "/detalhes/detalhevisita",
      query: {
        id: data.event.extendedProps.agenda_servico_id,
      },
    });
  }

  function handleDelete() {
    setAllEvents(
      allEvents.filter((event) => Number(event.id) !== Number(idToDelete))
    );
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  async function loadData() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (
          data.user.tipo_utilizador === "nivel1" ||
          data.user.tipo_utilizador === "nivel2"
        ) {
          const response = await api.post("/visita/getByNivel1", {
            equipa_id: data.user.funcionario.equipa_id,
          });
          if (response.status === 200) {
            setVisitas(response.data.visitas);

            const corequipa = response.data.visitas.map(
              (visita: any) => visita.agenda_servico.equipa.cor_equipa
            );

            setVisitascores(corequipa);

            addEvent(response.data.visitas, corequipa);
            setIsLoading(false);
          }
        }
        if (
          data.user.tipo_utilizador === "nivel4" ||
          data.user.tipo_utilizador === "nivel5"
        ) {
          const response = await api.post("/visita/getByEmpresa", {
            empresa_id: data.user.funcionario.empresa_id,
          });
          if (response.status === 200) {
            setVisitas(response.data.visitas);
            console.log("visita:", response.data.visitas);

            const corequipa = response.data.visitas.map(
              (visita: any) => visita.agenda_servico.equipa.cor_equipa
            );

            setVisitascores(corequipa);

            addEvent(response.data.visitas, corequipa);
            setIsLoading(false);
          }
        }
        if (data.user.tipo_utilizador === "nivel3") {
          const response = await api.post("/visita/getByNivel3", {
            empresa_id: data.user.funcionario.empresa_id,
            departamento_id: data.user.funcionario.departamento_id,
          });
          if (response.status === 200) {
            setVisitas(response.data.visitas);

            const corequipa = response.data.visitas.map(
              (visita: any) => visita.agenda_servico.equipa.cor_equipa
            );

            setVisitascores(corequipa);

            addEvent(response.data.visitas, corequipa);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar visitas:", error);
      }
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setNewEvent({
      title: "",
      start: "",
      data_visita: "",
      allDay: false,
      id: 0,
      hora_visita_inicio: "",
      hora_visita_fim: "",
      servicos: [{ nome: "" }],
      visita_id: 0,
      agenda_servico_id: 0,
      id_agenda: 0,
      cor_equipa: "",
      estado_servico: "",
    });
    setShowDeleteModal(false);
    setIdToDelete(null);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewEvent({
      ...newEvent,
      title: e.target.value,
    });
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Evitar que o formulário recarregue a página

    // 1. Criar um novo evento
    const createdEvent: Event = {
      title: newEvent.title,
      start: newEvent.start,
      allDay: newEvent.allDay,
      data_visita: newEvent.data_visita,
      hora_visita_inicio: newEvent.hora_visita_inicio,
      hora_visita_fim: newEvent.hora_visita_fim,
      servicos: newEvent.servicos,
      visita_id: newEvent.visita_id,
      agenda_servico_id: newEvent.agenda_servico_id,
      id_agenda: newEvent.id_agenda,
      cor_equipa: newEvent.cor_equipa,
      estado_servico: newEvent.estado_servico,

      id: new Date().getTime(), // Gerar um ID único para o novo evento
    };

    // 2. Adicionar o novo evento à lista de eventos existente
    const updatedEvents = [...allEvents, createdEvent];

    // 3. Atualizar o estado dos eventos
    setAllEvents(updatedEvents);

    // Fechar o modal após adicionar o evento
    setShowModal(false);

    // Limpar o estado do novo evento para a próxima entrada
    setNewEvent({
      title: "",
      start: "",
      data_visita: "",
      allDay: false,
      id: 0,
      hora_visita_inicio: "",
      hora_visita_fim: "",
      servicos: [{ nome: "" }],
      visita_id: 0,
      agenda_servico_id: 0,
      id_agenda: 0,
      cor_equipa: "",
      estado_servico: "",
    });
  }

  function renderEventContent(eventInfo: EventContentArg) {
    console.log("eventInfo:", eventInfo.event);

    return (
      <>
        <div
          className="fc-event-main"
          style={{
            backgroundColor:
              eventInfo.event?.extendedProps?.estado_servico === "agendada"
                ? "#4682b4"
                : eventInfo.event?.extendedProps?.estado_servico ===
                  "em andamento"
                ? "#4682b4"
                : eventInfo.event?.extendedProps?.estado_servico === "terminada"
                ? "#95d7b0"
                : eventInfo.event?.extendedProps?.estado_servico ===
                    "cancelada" ||
                  eventInfo.event?.extendedProps?.estado_servico ===
                    "nao aprovada"
                ? "#fa7f72"
                : "##b2c1b8",
            borderColor:
              eventInfo.event?.extendedProps?.estado_servico === "agendada"
                ? "#4682b4"
                : eventInfo.event?.extendedProps?.estado_servico ===
                  "em andamento"
                ? "#4682b4"
                : eventInfo.event?.extendedProps?.estado_servico === "terminada"
                ? "#95d7b0"
                : eventInfo.event?.extendedProps?.estado_servico ===
                    "cancelada" ||
                  eventInfo.event?.extendedProps?.estado_servico ===
                    "nao aprovada"
                ? "#fa7f72"
                : "#b2c1b8",
            borderStyle: "solid",
            borderWidth: "1px",
            borderRadius: "4px",
          }}
        >
          <div
            className="fc-title flex"
            style={{
              whiteSpace: "normal",
              textDecoration:
                eventInfo.event?.extendedProps?.estado_servico === "cancelada"
                  ? "line-through"
                  : "none",
            }}
          >
            {eventInfo.event?.extendedProps?.hora_visita_inicio?.slice(0, 5)} -{" "}
            {eventInfo.event?.extendedProps?.hora_visita_fim?.slice(0, 5)}
            <br />
            {eventInfo?.event?.title}
            <br />
            {eventInfo.event?.extendedProps?.agenda_servico?.equipa?.nome}
            <br />
            Cliente:{" "}
            {eventInfo.event?.extendedProps?.contrato?.cliente?.nome_completo}
          </div>
        </div>
      </>
    );
  }

  function filterdataatual() {
    const dataAtual = new Date();

    const eventosFiltrados = visitas.filter((event) => {
      const eventDate = new Date(event.data_visita); // Supondo que o campo de data do evento seja 'data_visita'
      return (
        eventDate.getDate() === dataAtual.getDate() &&
        eventDate.getMonth() === dataAtual.getMonth() &&
        eventDate.getFullYear() === dataAtual.getFullYear()
      );
    });

    eventosFiltrados.sort((a, b) => {
      const [horaA, minutoA] = a.hora_visita_inicio.split(":").map(Number);
      const [horaB, minutoB] = b.hora_visita_inicio.split(":").map(Number);

      if (horaA !== horaB) {
        return horaA - horaB;
      }
      return minutoA - minutoB;
    });

    return eventosFiltrados;
  }

  function filterEventsBySelectedDate() {
    if (selectedDate) {
      const filteredEvents = visitas.filter((event) => {
        const eventDate = new Date(event.data_visita);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      });

      filteredEvents.sort((a, b) => {
        const horaA = parseInt(a.hora_visita_inicio.split(":")[0]);
        const horaB = parseInt(b.hora_visita_inicio.split(":")[0]);

        return horaA - horaB;
      });

      return filteredEvents;
    } else {
      return [];
    }
  }

  function handleOpen(): void {
    throw new Error("Function not implemented.");
  }

  const eventosDataAtual = filterdataatual();

  function setSelectedEquipaId(equipaId: number) {
    setEquipaCor(equipaId);
  }

  function handleEquipaClick(equipaId: number, cor: string) {
    const events = visitas.filter(
      (visita) => visita.agenda_servico.equipa.equipa_id === equipaId
    );

    setAllEvents(
      events.map((event) => ({
        ...event,
        start: new Date(event.data_visita + "T" + event.hora_visita_inicio),
        end: new Date(event.data_visita + "T" + event.hora_visita_fim),
        title: event.servicos[0].nome,
        allDay: false,
        id: event.visita_id,
        agenda_servico_id: event.agenda_servico_id,
        cor_equipa: cor,
      }))
    );

    console.log("equipaId:", equipaId);
  }

  function resetEvents() {
    setAllEvents(
      visitas.map((event) => ({
        ...event,
        start: new Date(event.data_visita + "T" + event.hora_visita_inicio),
        end: new Date(event.data_visita + "T" + event.hora_visita_fim),
        title: event.servicos[0].nome,
        allDay: false,
        id: event.visita_id,
        agenda_servico_id: event.agenda_servico_id,
        cor_equipa: event.agenda_servico.equipa.cor_equipa,
      }))
    );
  }

  return (
    <>
      <main
        className="flex xl:flex-col lg:flex-col overflow-hidden xl:h-280 lg:h-240"
        style={{ backgroundColor: "#f2f2f2" }}
      >
        {isLoading && (
          <div
            className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 h-full"
            style={{ zIndex: 9999 }}
          >
            <Spinner className="h-16 w-16 text-gray-900/50" />
          </div>
        )}
        <div className="md:grid md:grid-cols-12 gap-2  lg:h-240 xl:h-280 float-start">
          <div className="col-span-12 xl:col-span-3 h-60 lg:col-span-3 lg:h-full  bg-white">
            {/* Div das visitas */}
            <div
              className="flex flex-col rounded-md lg:h-full   "
              style={{ maxHeight: "31.75rem" }}
            >
              <br></br>

              <div className="  mr-5 ml-5 h-151">
                <Link
                  href={"#"}
                  onClick={() => {
                    setDataVisita(""), setShowModalVisita(true);
                  }}
                >
                  <Button
                    className=" w-80 grid-flow-col flex items-center gap-1"
                    variant="outlined"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <Typography className="" variant="h6">
                      Visita
                    </Typography>
                  </Button>
                </Link>
                <br></br>
                <div
                  className="border-2 rounded-md"
                  style={{
                    borderColor: "#1F2A37",
                  }}
                >
                  <StyleWrapper2>
                    <FullCalendar
                      plugins={[dayGridPlugin]}
                      initialView="dayGridMonth"
                      locale={"pt-br"}
                      headerToolbar={{
                        left: "prev,next",
                        center: "title",
                        right: "",
                      }}
                      navLinkDayClick={handleNavLinkDayClick}
                      navLinks={true}
                    />
                  </StyleWrapper2>
                </div>
                <h1 className="font-bold text-lg text-left p-5 mb-2">
                  Agenda das equipas{" "}
                </h1>

                <div className="flex-col flex items-center ">
                  {equipas.length > 0 ? (
                    equipas.map((equipa) => {
                      return (
                        <button
                          onClick={() => {
                            handleEquipaClick(
                              equipa.equipa_id,
                              equipa.cor_equipa
                            ),
                              setSelectedEquipaId(equipa.equipa_id);
                          }}
                        >
                          <div
                            key={equipa.cor_equipa}
                            className=" flex w-80 mt-1 ml-9 mb-3 sm:ml-0 rounded-lg shadow-md"
                            style={{ backgroundColor: "#f2f2f2" }}
                          >
                            <div
                              className="border-l-8 h-18 flex rounded-s"
                              style={{
                                borderColor:
                                  equipa.equipa_id === equipacor
                                    ? equipa.cor_equipa
                                    : "#f2f2f2",
                              }}
                            ></div>
                            <div className="flex p-6">
                              <div className="space-y-1 text-sm">
                                {equipa.nome}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex justify-center items-center h-60">
                      <p className="text-gray-500">Sem equipas</p>
                    </div>
                  )}
                  <Button
                    className="w-80 "
                    onClick={() => {
                      resetEvents(), setSelectedEquipaId(0);
                    }}
                    style={{
                      backgroundColor: "#1F2A37",
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
                {/* <div className="flex-col flex items-center ">
                  {visitascores.length > 0 ? (
                    visitas
                      .filter((cor, index, self) => self.indexOf(cor) === index)
                      .map((visita: any) => {
                        return (
                          <button
                            onClick={() =>
                              handleEquipaClick(
                                visita?.agenda_servico?.equipa?.equipa_id
                              )
                            }
                          >
                            <div
                              key={visita.agenda_servico.equipa.cor_equipa}
                              className="w-80 mt-1 ml-9 mb-3 sm:ml-0 rounded-lg shadow-md"
                              style={{ backgroundColor: cor }}
                            >
                              <div className="flex p-6">
                                <div className="space-y-1">
                                  {visita
                                    .filter(
                                      (v: any) =>
                                        v.agenda_servico.equipa.cor_equipa ===
                                        cor
                                    )
                                    .find(
                                      (v: any) =>
                                        v?.agenda_servico?.equipa
                                          ?.cor_equipa === cor
                                    )?.agenda_servico?.equipa?.nome ||
                                    "Sem equipa"}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                  ) : (
                    <div className="flex justify-center items-center h-60">
                      <p className="text-gray-500">Sem equipas</p>
                    </div>
                  )}
                </div>
                */}
              </div>
            </div>

            <LongDialog
              open={showModalVisita}
              setOpen={setShowModalVisita}
              datacalendario={dataVisita}
            />
          </div>
          <div className="lg:col-span-8 lg:w-250 xl:col-span-8 xl:w-335  ">
            {/* Calendário */}

            <StyleWrapper className=" text-xs md:text-lg  ">
              <FullCalendar
                ref={calendarRef}
                locale={"pt-br"}
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                // customButtons={{
                //   myCustomButton: {
                //     text: "Agendar Visitas",
                //     click: () => {
                //       setDataVisita(""), setShowModalVisita(true);
                //     },
                //   },
                // }}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={allEvents as EventSourceInput}
                navLinks={true}
                navLinkDayClick={handleNavLinkDayClick}
                nowIndicator={true}
                editable={true}
                droppable={true}
                eventContent={renderEventContent}
                selectable={true}
                selectMirror={true}
                dateClick={handleDateClick}
                drop={(data) => addEvent(data)}
                eventClick={(data) => onEventClick(data)}
                eventDisplay="block"
                eventTimeFormat={{
                  hour: "2-digit",
                }}
                displayEventTime={true}
                initialDate={selectedDate}
                allDaySlot={false}
              />
            </StyleWrapper>
          </div>
        </div>

        <Transition.Root show={showDeleteModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={setShowDeleteModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel
                    className="relative transform overflow-hidden rounded-lg
                   bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                  >
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div
                          className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                        >
                          <ExclamationTriangleIcon
                            className="h-6 w-6 text-red-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <Dialog.Title
                            as="h3"
                            className="text-base font-semibold leading-6 text-gray-900"
                          >
                            Delete Event
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this event?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                        onClick={handleDelete}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        <Transition.Root show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckIcon
                          className="h-6 w-6 text-green-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Adicionar visita
                        </Dialog.Title>
                        <form action="submit" onSubmit={handleSubmit}>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="title"
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 
                            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                            focus:ring-2 
                            focus:ring-inset focus:ring-violet-600 
                            sm:text-sm sm:leading-6"
                              value={newEvent.title}
                              onChange={(e) => handleChange(e)}
                              placeholder="Título da visita"
                            />
                          </div>
                          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                            <button
                              type="submit"
                              className="inline-flex w-full justify-center rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:col-start-2 disabled:opacity-25"
                              style={{ backgroundColor: "#0F124C" }}
                              disabled={newEvent.title === ""}
                            >
                              Create
                            </button>
                            <button
                              type="button"
                              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                              onClick={handleCloseModal}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </main>
    </>
  );
}
