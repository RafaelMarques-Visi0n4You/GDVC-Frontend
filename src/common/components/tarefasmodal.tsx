import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Dialog, Input, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

interface Data {
  Status: string;
  agendaServico: {
    tarefa: {
      tarefas: string;
      tarefa_servico_visita_id: number;
    }[];
  };
}

export default function TarefaModal({
  open,
  setOpen,
  tarefas,
  id,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tarefas: { tarefa: string }[] | undefined | null;
  id: number;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const router = useRouter();

  const [text, setText] = useState<string>("");

  const handleClose = () => {
    setOpen(false);
  };

  async function addTarefa() {
    const token = getCookie("token");
    console.log("id:", id);
    console.log("texto:", text);
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/tarefaservicovisita/create", {
          visita_id: id,
          tarefa: text,
        });
        setText("");
        setUpdateKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  async function deleteTarefa(idtarefa: number) {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const accept = window.confirm("Tem a certeza que deseja eliminar?");
        if (accept) {
          const response = await api.delete(
            `/tarefaservicovisita/delete/${idtarefa}`
          );
          toast.success("Tarefa eliminada com sucesso!");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    console.log("tarefas", tarefas);
    console.log("id", id);
  }, [tarefas, id]);

  return (
    <Dialog open={open}>
      <div className="grid grid-cols-2">
        <Typography className="p-6" variant="h5">
          Adicionar nova tarefa
        </Typography>
        <Link
          href={"#"}
          onClick={() => handleClose()}
          className="flex justify-end p-6 xl:justify-end xl:p-6  lg:justify-end lg:p-6"
        >
          <XMarkIcon className="w-6 h-6" />
        </Link>
      </div>
      <hr className=""></hr>
      <div className="p-3"></div>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Impede o envio do formulário
          // Verifique se o campo de texto não está vazio antes de adicionar a tarefa
          if (text !== null) {
            console.log("Tarefa não está vazia. Enviando para o backend.");
            addTarefa(); // Adiciona a tarefa ao submeter o formulário
            setText(""); // Limpa o campo de texto após adicionar a tarefa
          } else {
            console.error(
              "O campo de tarefa está vazio. Por favor, insira uma tarefa."
            );
          }
        }}
      >
        <div className="ml-4 mr-5">
          <Input
            type="text"
            label="Tarefa"
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
          />
        </div>
        <div className="px-5 py-3">
          <Button
            style={{ backgroundColor: "#0F124C" }}
            onClick={() => {
              if (text.trim() !== "") {
                addTarefa();
                handleClose();
              } else {
                console.error(
                  "O campo de tarefa está vazio. Por favor, insira uma tarefa."
                );
              }
            }}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Concluído
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
