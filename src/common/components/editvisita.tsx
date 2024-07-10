import { Dialog, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

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
    agenda_servico: {
      equipa: {
        equipa_id: number;
        nome: string;
      };
    };
  }[];
  visita: {
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
    };
    agenda_servico: {
      equipa_id: number;
    };
  };
}

export default function EditVisitaModal({
  open,
  setOpen,
  idVisita,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  idVisita: number;
}) {
  const router = useRouter();
  const id = router.query.id;
  const data = useContext(AuthContext);
  const [visitas, setVisitas] = useState<Data | null>(null);
  const [visitaunica, setVisitaUnica] = useState<Data | null>(null);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    getVisits();
  }, [open]);

  useEffect(() => {
    getVisits();
  }, []);

  async function getVisits() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (data.user.tipo_utilizador === "nivel4") {
          const response = await api.post("/visita/getByEmpresa", {
            empresa_id: data.user?.funcionario?.empresa_id,
          });
          if (response.status === 200) {
            setVisitas(response.data);
            console.log(response.data);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
      if (data.user.tipo_utilizador === "nivel3") {
        const response = await api.post("/visita/getByNivel3", {
          empresa_id: data.user.funcionario.empresa_id,
          departamento_id: data.user.funcionario.departamento_id,
        });
        if (response.status === 200) {
          setVisitas(response.data);
        }
      }
      const response = await api.get("visita/get/" + idVisita);

      setVisitaUnica(response.data);
      console.log(response.data);
    }
  }

  return (
    <Dialog open={open} size="xs" className="h-36">
      <div className="flex justify-center mt-2">
        <Typography variant="h5">Editar Horário Visita</Typography>
      </div>
      <Typography className="ml-2" variant="h6">
        Visitas de hoje
      </Typography>
      <div className="flex justify-start ml-2">
        <div className="bg-gray-200">
          <div className="grid grid-cols-2">
            {visitas?.visitas
              .filter(
                (visita) =>
                  visita.data_visita === visitaunica?.visita?.data_visita &&
                  visita.agenda_servico.equipa.equipa_id ===
                    visitaunica?.visita?.agenda_servico?.equipa_id
              )
              .map((visita) => {
                return (
                  <div key={visita.visita_id}>
                    <p>{visita.data_visita}</p>
                    <p>{visita.hora_visita_inicio}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
