import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Dialog,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useContext } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  notaVisita: {
    nota: string;
  }[];
}

export default function UpdateStatus({
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

  const data = useContext(AuthContext);

  const user = data.user;

  const handleClose = () => {
    setOpen(false);
  };

  const [estado, setEstado] = React.useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (estado === "") {
          toast.error("Selecione um novo estado para o serviço");
          return;
        }

        const response = await api.put("/visita/updateStatus", {
          id: id,
          estado: estado,
        });

        console.log("Visita Atualizadaaaa:", response.data);

        // Verifique se a equipe foi criada com sucesso

        // Crie o chefe da equipe usando o ID da equipe

        // Limpe os campos do formulário se necessário

        toast.success("Estado alterado com sucesso");
        setUpdateKey((prev) => prev + 1);
        handleClose();
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };

  return (
    <Dialog open={open}>
      <div className="grid grid-cols-2">
        <Typography className="p-6" variant="h5">
          Atualizar estado
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
      <form onSubmit={handleSubmit}>
        <div className="flex ml-4 mr-5">
          <Select
            label="Estado da visita"
            onChange={(value) => setEstado(String(value))}
          >
            <Option value="cancelada">Cancelada</Option>
            <Option value="terminada">Terminada</Option>
          </Select>
        </div>
        <div className="mt-4 sm:flex sm:justify-center flex justify-center gap-10">
          <Button
            className="mt-3 md:mt-0 sm:w-1/3"
            style={{
              color: "white",
              backgroundColor: "#A6A6A6",
            }}
            onClick={handleClose}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            style={{
              color: "white",
              backgroundColor: "#0F124C",
            }}
            className="sm:w-1/3  md:mt-0"
          >
            Mudar estado
          </Button>
        </div>
        <br />
      </form>
    </Dialog>
  );
}
