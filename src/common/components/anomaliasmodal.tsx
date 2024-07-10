import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, Typography } from "@material-tailwind/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getCookie } from "cookies-next";
import ImagemModal from "../components/imagemG";
import api from "../services/api";

interface Data {
  Status: string;
  anomaliaVisita: {
    anomalia: string;
    anomalia_visita_id: number;
    estado: string;
    fotografia: string;
  }[];
}

export default function AnomaliasModal({
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
  const [showModalImagem, SetshowModalImagem] = useState(false);
  const [mostrarImagem, setMostrarImagem] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const toggleImagem = () => {
    setMostrarImagem(!isClicked);
    setMostrarImagem(isClicked);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function loadData(id: number) {
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
        const servicesData = response.data;

        setData(servicesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    loadData(id);
  }, [id, open]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <Dialog open={open}>
      <div className="grid grid-cols-2">
        <Typography className="p-6" variant="h5">
          Anomalias da visita
        </Typography>
        <Link
          href="#"
          onClick={() => {
            handleClose(), loadData(id);
          }}
          className="flex justify-end p-6"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
      </div>
      <hr className="border-1"></hr>
      <Typography className="p-6">Anomalias:</Typography>
      <div className="overflow-y-scroll max-h-60">
        {data?.anomaliaVisita && data?.anomaliaVisita.length > 0 ? (
          <div className="grid gap-4 px-4">
            {data?.anomaliaVisita.map((anomalia, index) => (
              <div
                key={index}
                className="rounded-xl bg-gray-100 p-4 flex items-center"
              >
                <div className="w-96 sm:w-1/2">{anomalia.anomalia}</div>
                <div className="xl:ml-80 lg:ml-64">
                  <Link
                    href={"#"}
                    onClick={() => SetshowModalImagem(!showModalImagem)}
                  >
                    <PhotoIcon className="w-6 h-6" />
                    {showModalImagem && (
                      <div>
                        <ImagemModal
                          open={showModalImagem}
                          setOpen={SetshowModalImagem}
                          imagem={anomalia.fotografia}
                        />
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">Não há anomalias</div>
        )}
      </div>
      <br></br>
    </Dialog>
  );
}
