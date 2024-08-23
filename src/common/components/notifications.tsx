import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Dialog, Typography } from "@material-tailwind/react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthContext } from "./AuthContext";
import EditVisitaModal from "./editvisita";
import ReagendarVisitaPendenteModal from "./editvisitapendente";
import NotasModal2 from "./notasmodal2";
import NotasModal3 from "./notasmodal3";

export default function NotificacoesModal({
  open,
  setOpen,
  setUpdateKey,
  id1,
  id2,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
  id1: number;
  id2: number;
}) {
  const router = useRouter();
  const { id, idagenda } = router.query;
  const data = useContext(AuthContext);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [idVisita, setIdVisita] = useState<number>(0);
  const [showDialog, setshowDialog] = useState<boolean>(false);
  const [showDialog2, setshowDialog2] = useState<boolean>(false);
  const [showDialog3, setshowDialog3] = useState<boolean>(false);

  const handleClose = () => {
    // Fecha o diálogo quando chamado
    setOpen(false);
  };

  useEffect(() => {
    console.log("id", id);
  }, [showEdit]);

  return (
    <Dialog open={open} size="xs" className="h-36">
      <div className="grid grid-cols-2">
        <div className="flex ml-16 w-96">
          <Typography className="p-6" variant="h5">
            Validação da Visita
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
      <div className="flex justify-center gap-5 mt-3 ">
        <Button
          className="bg-red-500 w-22"
          onClick={() => {
            setshowDialog(true);
          }}
        >
          Rejeitar
        </Button>
        <Button
          className="bg-gray-400 w-22"
          onClick={() => {
            setshowDialog2(true);
          }}
        >
          Aguardar
        </Button>
        <Button
          className="bg-green-500 w-22"
          onClick={() => {
            setshowDialog3(true);
          }}
        >
          Aceitar
        </Button>
        <EditVisitaModal open={showEdit} setOpen={setShowEdit} idVisita={id1} />
        <NotasModal2
          open={showDialog}
          setOpen={setshowDialog}
          id={id1}
          setUpdateKey={setUpdateKey}
        />
        <NotasModal3
          open={showDialog2}
          setOpen={setshowDialog2}
          id={id1}
          setUpdateKey={setUpdateKey}
        />
        <ReagendarVisitaPendenteModal
          open={showDialog3}
          setOpen={setshowDialog3}
          idvisita={id1}
          idagenda={id2}
          setUpdateKey={setUpdateKey}
        />
      </div>
    </Dialog>
  );
}
