import { AuthContext } from "@/common/components/AuthContext";
import api from "@/common/services/api";
import styled from "@emotion/styled";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  Input,
  Option,
  Select,
  Spinner,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

interface Data {
  Status: string;
  visitas: {
    visita_id: number;
    empresa_id: number;
    cliente_id: number;
    funcionario_id: number;
    data_visita: string;
    hora_visita_inicio: string;
    hora_visita_fim: string;
    estado_servico: string;
    descricao: string;
    data_visita_fim: string;
    agenda_servico_id: number;
    servicos: {
      servico_id: number;
      nome: string;
    }[];
    contrato: {
      contrato_id: number;
      cliente: {
        cliente_id: number;
        nome_completo: string;
      };
    };
    agenda_servico: {
      agenda_servico_id: number;
      equipa: {
        equipa_id: number;
        nome: string;
      };
    };
  }[];
}

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  padding: 20px;
`;

const Card = styled.div`
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding-left: 0.8rem;
  padding-right: 0.5rem;
  padding-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  border: 2px solid #e5e7eb;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  color: #ffffff;
  margin-top: 23px;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export default function VisitHistory() {
  const data = useContext(AuthContext);

  const [visits, setVisits] = useState<Data | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEquipa, setSelectedEquipa] = useState<number | null>(null);
  const [estado, setEstado] = useState<string>("");
  const [selectedServico, setSelectedServico] = useState<number | null>(null);

  useEffect(() => {
    getVisits();
    if (selectedDate !== null) {
      setSelectedEquipa(null);
      setSelectedServico(null);
    }
  }, [selectedDate]);

  async function getVisits() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/visita/getByEmpresa", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        if (response.status === 200) {
          setVisits(response.data);

          console.log("asgdfasdhgadhfdf: ", response.data);

          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  function filterbyequipa(equipa_id: number) {
    setSelectedEquipa(equipa_id);
  }

  function handleDateClick() {
    const dataAtual = new Date();
    console.log("Data selecionada: ", selectedDate);

    // Obter dia, mês e ano da data selecionada
    const dia = dataAtual.getDate().toString().padStart(2, "0"); // Adiciona um zero à esquerda se for menor que 10
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, "0"); // Adiciona um zero à esquerda se for menor que 10
    const ano = dataAtual.getFullYear();

    // Formatar a data no formato "dd-mm-yyyy"
    return `${ano}-${mes}-${dia}`;
  }

  function filterdataatual() {
    const dataAtual = new Date();

    const eventosFiltrados = visits?.visitas?.filter((event) => {
      const eventDate = new Date(event.data_visita); // Supondo que o campo de data do evento seja 'data_visita'
      return (
        eventDate.getDate() <= dataAtual.getDate() &&
        eventDate.getMonth() <= dataAtual.getMonth() &&
        eventDate.getFullYear() <= dataAtual.getFullYear()
      );
    });

    eventosFiltrados?.sort((a, b) => {
      const [horaA, minutoA] = a.hora_visita_inicio.split(":").map(Number);
      const [horaB, minutoB] = b.hora_visita_inicio.split(":").map(Number);
      const dataA = parseInt(a.data_visita.split("-")[2]);
      const dataB = parseInt(b.data_visita.split("-")[2]);

      return dataB - dataA || horaA - horaB;
    });

    return eventosFiltrados;
  }

  function filterEventsByDate(visitas: Data["visitas"], date: Date | null) {
    if (!date) return visitas; // Retorna todas as visitas se a data não estiver definida

    const filteredEvents = visitas.filter((event) => {
      const eventDate = new Date(event.data_visita);

      return (
        eventDate.getDate() <= date.getDate() &&
        eventDate.getMonth() <= date.getMonth() &&
        eventDate.getFullYear() <= date.getFullYear()
      );
    });

    filteredEvents.sort((a, b) => {
      const [horaA, minutoA] = a.hora_visita_inicio.split(":").map(Number);
      const [horaB, minutoB] = b.hora_visita_inicio.split(":").map(Number);
      const dataA = parseInt(a.data_visita.split("-")[2]);
      const dataB = parseInt(b.data_visita.split("-")[2]);

      return dataB - dataA || horaA - horaB;
    });

    return filteredEvents;
  }

  const dataatual = handleDateClick();

  const eventosDataAtual = filterdataatual();

  if (visits === null) return null;
  const uniqueEquipes = new Set();
  const uniqueVisitas = visits?.visitas
    ? visits?.visitas?.filter((visita) => {
        const equipeId = visita?.agenda_servico?.equipa?.equipa_id;
        if (uniqueEquipes?.has(equipeId)) {
          return false;
        }
        uniqueEquipes?.add(equipeId);
        return true;
      })
    : visits?.visitas;

  const uniqueServico = new Set();
  const uniqueServicos = visits?.visitas
    ? visits?.visitas?.filter((visita) => {
        const servicoID = visita?.servicos[0]?.servico_id;
        if (uniqueServico?.has(servicoID)) {
          return false;
        }
        uniqueServico?.add(servicoID);
        return true;
      })
    : visits?.visitas;

  function filterByEquipa(visitas: Data["visitas"], equipa_id: number | null) {
    if (equipa_id === null) return visitas;
    return visitas.filter(
      (visita) => visita.agenda_servico.equipa.equipa_id === equipa_id
    );
  }

  function filterByDate(visitas: Data["visitas"], date: Date | null) {
    let filteredVisits = visitas;
    if (date !== null) {
      filteredVisits = filterEventsByDate(visitas, date);
    }
    return filteredVisits;
  }

  function filterByEstado(visitas: Data["visitas"], estado: string) {
    if (!estado) return visitas;
    return visitas.filter((visita) => visita.estado_servico === estado);
  }

  function filterByServico(
    visitas: Data["visitas"],
    servico_id: number | null
  ) {
    if (servico_id === null) return visitas;
    return visitas.filter(
      (visita) => visita.servicos[0].servico_id === servico_id
    );
  }

  function clearfilters() {
    setSelectedEquipa(null);
    setSelectedServico(null);
    setSelectedDate(null);
    setEstado("");
  }

  const filteredByEquipa = filterByEquipa(
    visits?.visitas || [],
    selectedEquipa
  );
  const filteredByDate = filterByDate(filteredByEquipa, selectedDate);
  const filteredByEstado = filterByEstado(filteredByDate, estado);
  const filteredByServico = filterByServico(filteredByEstado, selectedServico);

  return (
    <div>
      {isLoading && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      )}
      <div className="flex justify-center p-3">
        <Typography variant="h4">Histórico de Visitas</Typography>
      </div>
      <div className="flex justify-center p-3 gap-2 w-64 ml-7">
        <Input
          type="date"
          label="Filtrar até a data:"
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      <div className="flex justify-center p-3 gap-2 w-64 ml-7">
        <Select
          label="Filtrar por Equipa"
          value={selectedEquipa !== null ? String(selectedEquipa) : ""}
          onChange={(value: any) => setSelectedEquipa(parseInt(value))}
        >
          {uniqueVisitas?.map((visita) => (
            <Option
              key={visita?.agenda_servico?.equipa?.equipa_id}
              value={
                visita?.agenda_servico?.equipa?.equipa_id !== undefined
                  ? String(visita?.agenda_servico?.equipa?.equipa_id)
                  : ""
              }
            >
              {visita?.agenda_servico?.equipa?.nome}
            </Option>
          ))}
        </Select>
      </div>
      <div className="flex justify-center p-3 gap-2 w-64 ml-7">
        <Select
          label="Filtrar por Serviço"
          value={selectedServico !== null ? String(selectedServico) : ""}
          onChange={(value: any) => setSelectedServico(parseInt(value))}
        >
          {uniqueServicos?.map((visitas) => (
            <Option
              key={visitas?.servicos[0]?.servico_id}
              value={
                visitas?.servicos[0]?.servico_id !== undefined
                  ? String(visitas?.servicos[0]?.servico_id)
                  : ""
              }
            >
              {visitas?.servicos[0]?.nome}
            </Option>
          ))}
        </Select>
      </div>
      <div className="flex justify-center p-3 gap-2 w-64 ml-7">
        <Select
          label="Filtrar por estado da visita"
          onChange={(value: any) => setEstado(value)}
        >
          <Option value="">Todos</Option>
          <Option value="cancelada">Cancelada</Option>
          <Option value="agendada">Agendada</Option>
          <Option value="terminada">Terminada</Option>
          <Option value="em andamento">Em andamento</Option>
        </Select>
      </div>
      <div className="flex  p-3 gap-2 w-64 ml-7">
        <Button style={{ backgroundColor: "#0F124C" }} onClick={clearfilters}>
          Limpar Filtros
        </Button>
      </div>
      <CardGrid>
        {filteredByServico.length > 0 ? (
          filteredByServico.map((visita) => (
            <CardGrid key={visita.visita_id}>
              <Card
                style={{
                  backgroundColor:
                    visita.estado_servico === "agendada"
                      ? "#4682b4"
                      : visita.estado_servico === "em andamento"
                      ? "#b2c1b8"
                      : visita.estado_servico === "terminada"
                      ? "#95d7b0"
                      : visita.estado_servico === "cancelada"
                      ? "#fa7f72"
                      : "#fa7f72",
                }}
              >
                <CardHeader>
                  {visita.servicos.map((servico) => (
                    <CardTitle key={servico.servico_id} className="text-white">
                      {servico.nome}
                      {visita.descricao}
                    </CardTitle>
                  ))}
                  <Link
                    href={{
                      pathname: "/detalhes/detalhevisita",
                      query: { id: visita.agenda_servico_id },
                    }}
                  >
                    <ChevronRightIcon className="mt-7 h-6 w-6 text-white" />
                  </Link>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-white">
                    Estado: {visita.estado_servico}
                  </p>
                  <hr />
                  <div>
                    <p className="text-white">
                      Data:{" "}
                      <span className="text-white ml-15">
                        {visita.data_visita}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white">
                      Horário:{" "}
                      <span className="text-white ml-10">
                        {visita?.hora_visita_inicio?.slice(0, 5)} -{" "}
                        {visita?.hora_visita_fim?.slice(0, 5)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white">
                      Cliente:
                      <span className="text-white ml-12">
                        {visita?.contrato?.cliente?.nome_completo}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white">
                      Equipa:
                      <span className="text-white ml-12">
                        {visita?.agenda_servico?.equipa?.nome}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </CardGrid>
          ))
        ) : (
          <Typography variant="h6" className="text-center">
            Não há visitas agendadas.
          </Typography>
        )}
      </CardGrid>
    </div>
  );
}
