import { AuthContext } from "@/common/components/AuthContext";
import NotificacoesModal from "@/common/components/notifications";
import api from "@/common/services/api";
import styled from "@emotion/styled";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Spinner, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { default as router } from "next/router";
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
  }[];
}

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  padding: 20px;
`;

const Card = styled.div`
  background-color: #fff;
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
  color: #333;
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
  const [showModalAccept, setShowModalAccept] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  async function getVisits() {
    setIsLoading(true);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (data.user?.tipo_utilizador === "nivel3") {
          const response = await api.post("/visita/getVisitasPendentes", {
            empresa_id: data.user?.funcionario?.empresa_id,
            departamento_id: data.user?.funcionario?.departamento_id,
          });
          if (response.status === 200) {
            setVisits(response.data);

            console.log(response.data);
            setIsLoading(false);
          }
        }
        if (data.user?.tipo_utilizador === "nivel4") {
          const response = await api.post("/visita/getVisitasPendentesnivel4", {
            empresa_id: data.user?.funcionario?.empresa_id,
          });
          if (response.status === 200) {
            setVisits(response.data);

            console.log(response.data);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    if (
      data?.user?.tipo_utilizador !== "nivel4" &&
      data?.user?.tipo_utilizador !== "nivel3"
    ) {
      router.push("/permissiondenied");
    }

    getVisits();
  }, [showModalAccept, updateKey]);

  return (
    <div>
      {isLoading && (
        <div
          className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 h-full"
          style={{ zIndex: 9999 }}
        >
          <Spinner className="h-16 w-16 text-gray-900/50" />
        </div>
      )}
      <div className="flex justify-center p-3">
        <Typography variant="h4">Aprovação visitas</Typography>
      </div>
      <CardGrid>
        {visits && visits?.visitas?.length > 0 ? (
          visits?.visitas.map((visita) => (
            <CardGrid key={visita.visita_id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">
                    {visita.servicos.map((servico) => servico.nome)}
                  </CardTitle>
                  <Link
                    href={{
                      query: {
                        id: visita.visita_id,
                      },
                    }}
                    onClick={() =>
                      setShowModalAccept((showModalAccept) => !showModalAccept)
                    }
                  >
                    <ExclamationTriangleIcon className="mt-7 h-6 w-6 text-gray-500" />
                  </Link>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-400">
                    Estado: {visita.estado_servico}
                  </p>
                  <hr />
                  <div>
                    <p className="text-gray-500">
                      Data:{" "}
                      <span className="text-black ml-15">
                        {visita.data_visita}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">
                      Hora Início:{" "}
                      <span className="text-black ml-4">
                        {visita.hora_visita_inicio.slice(0, 5)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">
                      Hora Fim:{" "}
                      <span className="text-black ml-7">
                        {visita.hora_visita_fim.slice(0, 5)}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            </CardGrid>
          ))
        ) : (
          <div className="flex justify-center xl:ml-148 w-162 mt-20 lg:ml-101">
            <Typography variant="h4">Não há visitas pendentes</Typography>
          </div>
        )}
      </CardGrid>
      <NotificacoesModal
        open={showModalAccept}
        setOpen={setShowModalAccept}
        setUpdateKey={setUpdateKey}
      />
    </div>
  );
}
