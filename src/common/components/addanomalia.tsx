import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Dialog, Textarea, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  anomaliaVisita: {
    anomalia: string;
    anomalia_visita_id: number;
    estado: string;
    fotografia: string;
  }[];
}

interface AnomaliaModalAddProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: number;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}

export default function AnomaliaModalAdd({
  open,
  setOpen,
  id,
  setUpdateKey,
}: AnomaliaModalAddProps) {
  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false);
  };

  async function loadData(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/notavisita/get", { id });
        setServiceData(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  async function addAnomalia() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const formData = new FormData();
        formData.append("visita_id", id.toString());
        formData.append("anomalia", text);
        formData.append(
          "criado_por_id",
          String(user?.user?.conta_utilizador_id)
        );
        formData.append("estado", "Pendente");
        if (file) {
          formData.append("foto", file);
        }

        await api.post("/anomaliavisita/create", formData);

        setText("");
        setFile(null);
        handleClose();
        setUpdateKey((prev) => prev + 1);
        toast.success("Anomalia adicionada com sucesso.");
      } catch (error) {
        console.error("Erro ao adicionar anomalia:", error);
        toast.error("Erro ao adicionar anomalia.");
      }
    }
  }

  useEffect(() => {
    if (open) {
      loadData(id);
    }
  }, [open, id]);

  return (
    <Dialog open={open}>
      <div className="grid grid-cols-2">
        <Typography className="p-6" variant="h5">
          Adicionar nova anomalia
        </Typography>
        <Link
          href="#"
          onClick={handleClose}
          className="flex justify-end mr-5 mt-6"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
      </div>
      <hr className="border-1" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim() !== "") {
            addAnomalia();
          } else {
            toast.error(
              "O campo anomalia está vazio. Por favor, insira uma anomalia."
            );
          }
        }}
      >
        <div className="flex ml-4 mr-5">
          <Textarea
            typeof="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            label="Adicionar anomalia"
          />
        </div>
        <br />
        <div className="flex ml-4 mr-5">
          <input type="file" onChange={handleFileChange} />
        </div>
        <div className="px-5 py-3">
          <Button type="submit" style={{ backgroundColor: "#0F124C" }}>
            Concluído
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
