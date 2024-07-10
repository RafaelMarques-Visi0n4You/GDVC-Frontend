import api from "@/common/services/api";
import { Button, Spinner, Typography } from "@material-tailwind/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getCookie } from "cookies-next";

interface Data {
  Status: string;
  agendaServico: {
    servico: {
      nome: string;
      descricao: string;
    };
    visita: {
      visita_id: string;
      data_visita: string;
      hora_visita_inicio: string;
      hora_visita_fim: string;
      contrato_id: number;
    };
    funcionarios: {
      nome_completo: string;
      cargo: string;
    }[];
    tarefas: {
      tarefa: string;
    }[];
    endereco: {
      morada: string;
    };
    cliente: {
      nome_completo: string;
      contacto: string;
      email: string;
    };
  };
}

export default function Home() {
  const router = useRouter();
  const id = router.query.id;
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [tarefas, setTarefas] = useState<
    { tarefa: string }[] | undefined | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  return (
    <main style={{ backgroundColor: "#F9FAFB" }} className="overflow-hidden ">
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
        <Typography className="mt-2" variant="h4">
          Detalhes da Visita
        </Typography>
      </div>
      <div
        className="flex justify-center ml-199"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <Button
          style={{ backgroundColor: "#0F124C" }}
          onClick={() => window.print()}
        >
          Exportar
        </Button>
      </div>
      <div
        className="flex justify-center items-center"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <div className="grid grid-cols-2 gap-4 p-4 w-full max-w-4xl">
          <section className="bg-white p-4 rounded shadow-md">
            <Typography variant="h5" className="mb-4">
              Informações do Cliente
            </Typography>
            <div className="mb-2">
              <Typography variant="h6">Nome do Cliente</Typography>
              <Typography>
                {serviceData?.agendaServico?.cliente?.nome_completo}
              </Typography>
            </div>
            <div className="mb-2">
              <Typography variant="h6">Contacto</Typography>
              <Typography>
                {serviceData?.agendaServico?.cliente?.contacto}
              </Typography>
            </div>
            <div className="mb-2">
              <Typography variant="h6">Email</Typography>
              <Typography>
                {serviceData?.agendaServico?.cliente?.email}
              </Typography>
            </div>
            <div>
              <Typography variant="h6">Morada</Typography>
              <Typography>
                {serviceData?.agendaServico?.endereco?.morada}
              </Typography>
            </div>
          </section>

          <section className="bg-white p-4 rounded shadow-md">
            <Typography variant="h5" className="mb-4">
              Funcionários da equipa
            </Typography>
            <ul>
              {serviceData?.agendaServico?.funcionarios.map(
                (funcionario, index) => (
                  <li key={index} className="mb-2">
                    <Typography>
                      {funcionario.nome_completo} - {funcionario.cargo}
                    </Typography>
                  </li>
                )
              )}
            </ul>
          </section>
          <section className="bg-white p-4 rounded shadow-md w-210 ">
            <div className="grid col-span-1">
              <Typography variant="h5" className="mb-4">
                Informações da Visita
              </Typography>
              <div className="mb-2">
                <Typography variant="h6">Serviço</Typography>
                <Typography>
                  {serviceData?.agendaServico?.servico?.nome}
                </Typography>
              </div>
              <div className="mb-2">
                <Typography variant="h6">Descrição do Serviço</Typography>
                <Typography>
                  {serviceData?.agendaServico?.servico?.descricao}
                </Typography>
              </div>
              <div className="mb-2">
                <Typography variant="h6">Data da Visita</Typography>
                <Typography>
                  {serviceData?.agendaServico?.visita?.data_visita}
                </Typography>
              </div>
              <div className="mb-2">
                <Typography variant="h6">Horário</Typography>
                <Typography>
                  {serviceData?.agendaServico?.visita?.hora_visita_inicio.slice(
                    0,
                    5
                  )}{" "}
                  -{" "}
                  {serviceData?.agendaServico?.visita?.hora_visita_fim.slice(
                    0,
                    5
                  )}
                </Typography>
              </div>
            </div>
          </section>
          <br></br>
          <section className="bg-white p-4 rounded shadow-md  w-210">
            <div className="grid col-span-1 ml-7">
              <Typography variant="h5" className="mt-4">
                Tarefas
              </Typography>
              <ul>
                {serviceData?.agendaServico?.tarefas.map((tarefa, index) => (
                  <li key={index} className="mb-2">
                    <Typography>{tarefa.tarefa}</Typography>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
