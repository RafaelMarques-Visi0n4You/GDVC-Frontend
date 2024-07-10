import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Dialog, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";
import EditVisitaModal from "./editvisita";

export default function NotificacoesModal({
  open,
  setOpen,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const router = useRouter();
  const id = router.query.id;
  const data = useContext(AuthContext);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [idVisita, setIdVisita] = useState<number>(0);

  async function handleAcceptVisit() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put("/visita/acceptVisit", {
          id: id,
        });
        if (response.status === 200) {
          console.log(response.data);
          setUpdateKey((prev) => prev + 1);
          router.reload();
          setOpen(false);
        }
        if (response.data.Error) {
          setIdVisita(Number(id));
          const accepted = window.confirm(
            "Horário Sobreposto! Deseja alterar a data dessa visita?"
          );
          if (accepted) {
            setShowEdit(true);
          }
        }
      } catch (error) {
        console.error("Erro ao aceitar visita:", error);
      }
    }
  }

  async function handleRejectVisit() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.delete("/visita/delete/" + id);

        if (response.status === 200) {
          console.log(response.data);
          setUpdateKey((prev) => prev + 1);
          setOpen(false);
        }
      } catch (error) {
        console.error("Erro ao rejeitar visita:", error);
      }
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log("id", id);
  }, [showEdit]);

  return (
    <Dialog open={open} size="xs" className="h-36">
      <div className="grid grid-cols-2">
        <div className="flex ml-28 w-96">
          <Typography className="p-6" variant="h5">
            Adicionar nova nota
          </Typography>
        </div>
        <Link
          href="#"
          onClick={handleClose}
          className="flex justify-end mr-5 mt-6"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
      </div>
      <hr className="border-1" />
      <div className="flex justify-center gap-20 mt-3 ">
        <Button
          className="bg-red-500 w-32"
          onClick={() => {
            handleRejectVisit();
          }}
        >
          Rejeitar
        </Button>
        <Button
          className="bg-green-500 w-32"
          onClick={() => {
            handleAcceptVisit();
          }}
        >
          Aceitar
        </Button>
        <EditVisitaModal
          open={showEdit}
          setOpen={setShowEdit}
          idVisita={idVisita}
        />
      </div>
    </Dialog>
  );
}
