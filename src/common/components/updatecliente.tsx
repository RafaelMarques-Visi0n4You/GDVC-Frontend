import { Button, Dialog, Input, Typography } from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import router from "next/router";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  clientes: {
    cliente_id: number;
    nome_completo: string;
    nif: string;
    email: string;
    ativo: boolean;
    contacto: string;
    morada: string;
    localidade: string;
    cod_postal: string;
  };
}

export default function UpdateClienteModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [nome, setnome] = useState("");
  const [email, setemail] = useState("");
  const [nif, setnif] = useState("");
  const [contacto, setcontacto] = useState("");
  const [morada, setmorada] = useState("");
  const [localidade, setlocalidade] = useState("");
  const [cod_postal, setcod_postal] = useState("");
  const id = router.query.id;
  const data = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        api
          .get("/cliente/get/" + id)
          .then((response) => {
            // Atualize o estado com os dados recebidos
            setnome(response.data.cliente?.nome_completo);
            setemail(response.data.cliente?.email);
            setnif(response.data.cliente?.nif);
            setcontacto(response.data.cliente?.contacto);
            setmorada(response.data.cliente?.morada);
            setlocalidade(response.data.cliente?.localidade);
            setcod_postal(response.data.cliente?.cod_postal);
          })
          .catch((error) => {
            // Trate o erro adequadamente, por exemplo, exibindo uma mensagem de erro
            console.error("Erro ao obter dados do cliente:", error);
          });
      } catch (error) {
        // Trate o erro capturado pelo try-catch, se necessário
        console.error("Erro ao tentar obter dados do cliente:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    console.log("id", id);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (nome.trim() === "") {
      toast.error("Por favor, preencha o campo Nome Completo!");
      return;
    }
    if (email.trim() === "") {
      toast.error("Por favor, preencha o campo Email!");
      return;
    }
    if (nif.trim() === "") {
      toast.error("Por favor, preencha o campo NIF!");
      return;
    }
    if (contacto.trim() === "") {
      toast.error("Por favor, preencha o campo Contacto!");
      return;
    }
    if (morada.trim() === "") {
      toast.error("Por favor, preencha o campo Morada!");
      return;
    }
    if (localidade.trim() === "") {
      toast.error("Por favor, preencha o campo Localidade!");
      return;
    }
    if (cod_postal.trim() === "") {
      toast.error("Por favor, preencha o campo Código Postal!");
      return;
    }

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/cliente/update/${id}`, {
          nome_completo: nome,
          email: email,
          nif: nif,
          contacto: contacto,
          morada: morada,
          localidade: localidade,
          cod_postal: cod_postal,
        });
        handleClose();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  return (
    <Dialog open={open}>
      <div className="flex-col p-6">
        <Typography
          className="flex justify-center"
          variant="h4"
          color="blue-gray"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Editar Cliente
        </Typography>

        <form className="py-10 sm:w-94" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome Completo"
                value={nome}
                onChange={(e) => setnome(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                label="NIF"
                type="number"
                maxLength={9}
                minLength={9}
                min={0}
                value={nif}
                onChange={(e) => setnif(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Contacto"
                type="number"
                maxLength={9}
                minLength={9}
                value={contacto}
                onChange={(e) => setcontacto(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                label="Morada"
                type="text"
                value={morada}
                onChange={(e) => setmorada(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Localidade"
                type="text"
                value={localidade}
                onChange={(e) => setlocalidade(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Input
                label="Código Postal"
                type="text"
                maxLength={8}
                minLength={8}
                value={cod_postal}
                onChange={(e) => setcod_postal(e.target.value)}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />

          <div className="flex flex-row justify-center gap-10">
            <Button
              className="w-92"
              style={{ backgroundColor: "#FE0000" }}
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-92"
              style={{ backgroundColor: "#0F124C" }}
            >
              Editar
            </Button>
          </div>
        </form>
        <Toaster containerStyle={{ zIndex: 9999 }} />
      </div>
    </Dialog>
  );
}
