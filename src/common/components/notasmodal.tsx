import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Dialog, Textarea, Typography } from "@material-tailwind/react";
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
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  notaVisita: {
    nota: string;
  }[];
}

export default function NotasModal({
  open,
  setOpen,
  id,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const router = useRouter();

  const [serviceData, setServiceData] = useState<Data | null>(null);
  const [text, setText] = useState<string>("");

  const data = useContext(AuthContext);

  const user = data.user;

  const handleClose = () => {
    setOpen(false);
  };

  async function loadData(id: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/notavisita/get", {
          id: id,
        });
        const servicesData = response.data;
        console.log("servicesData", servicesData);
        setServiceData(servicesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function addNota() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/notavisita/create", {
          visita_id: id,
          nota: text,
          criado_por_id: user.conta_utilizador_id,
        });
        loadData(id);
        setText("");
        setUpdateKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deleteNota(idnota: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accept = window.confirm("Tem a certeza que deseja eliminar?");
        if (accept) {
          const response = await api.delete("/notavisita/delete", {
            data: {
              id: idnota,
            },
          });
          toast.success("Nota eliminada com sucesso");
        }
        await loadData(id);
        handleClose();
      } catch (error) {
        console.error("Erro ao eliminar a nota:", error);
      }
    }
  }

  useEffect(() => {
    loadData(id);
  }, [open, id]);

  return (
    <Dialog open={open}>
      <div className="grid grid-cols-2">
        <Typography className="p-6" variant="h5">
          Adicionar nova nota
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

      <div className="p-3"></div>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Impede o envio do formulário
          // Verifique se o campo de texto não está vazio antes de adicionar a tarefa
          if (text !== null) {
            addNota(); // Adiciona a tarefa ao submeter o formulário
            setText(""); // Limpa o campo de texto após adicionar a tarefa
          } else {
            console.error(
              "O campo nota está vazio. Por favor, insira uma nota."
            );
          }
        }}
      >
        <div className="flex ml-4 mr-5">
          <Textarea
            typeof="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            label="Adicionar nota"
          />
        </div>
        <div className="px-5 py-3">
          <Button
            style={{ backgroundColor: "#0F124C" }}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onClick={() => {
              if (text.trim() !== "") {
                addNota();
                handleClose();
              } else {
                console.error(
                  "O campo de tarefa está vazio. Por favor, insira uma tarefa."
                );
              }
            }}
          >
            Concluído
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
