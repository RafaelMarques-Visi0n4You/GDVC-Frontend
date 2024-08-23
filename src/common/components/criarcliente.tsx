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
    empresa_id: number;
  };
  empresas: {
    empresa_id: number;
    nome: string;
  }[];
  user: {
    tipo_utilizador: string;
    funcionario: {
      empresa_id: number;
    };
  };
}

interface Data2 {
  Status: string;
  cliente: {
    cliente_id: number;
    nome_completo: string;
    nif: string;
    email: string;
    ativo: boolean;
    contacto: string;
    morada: string;
    localidade: string;
    cod_postal: string;
    empresa_id: number;
  };
  empresas: {
    empresa_id: number;
    nome: string;
  }[];
  user: {
    tipo_utilizador: string;
    funcionario: {
      empresa_id: number;
    };
  };
}

export default function CriarClienteModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [cliendId, setClientId] = useState<Data2 | null>(null);

  async function loadData() {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/empresa/get");
        setData(response.data);
        console.log("Dados carregados:", response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const utilizador = useContext(AuthContext);
  console.log(utilizador);

  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    nif: "",
    contacto: "",
    morada: "",
    localidade: "",
    cod_postal: "",
  });

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (formData.nome_completo.trim() === "") {
          toast.error("Por favor, preencha o campo Nome Completo!");
        }
        if (formData.email.trim() === "") {
          toast.error("Por favor, preencha o campo Email!");
        }
        if (formData.nif.trim() === "") {
          toast.error("Por favor, preencha o campo NIF!");
        }
        if (formData.contacto.trim() === "") {
          toast.error("Por favor, preencha o campo Contacto!");
        }
        if (formData.morada.trim() === "") {
          toast.error("Por favor, preencha o campo Morada!");
        }
        if (formData.localidade.trim() === "") {
          toast.error("Por favor, preencha o campo Localidade!");
        }
        if (formData.cod_postal.trim() === "") {
          toast.error("Por favor, preencha o campo Código Postal!");
        }

        const response = await api.post("/cliente/create", {
          nome_completo: formData.nome_completo,
          email: formData.email,
          nif: formData.nif,
          contacto: formData.contacto,
          morada: formData.morada,
          localidade: formData.localidade,
          cod_postal: formData.cod_postal,
          empresa_id: utilizador.user.funcionario.empresa_id,
        });

        if (response.status === 200) {
          const clienteId = response.data?.cliente?.cliente_id;
          setClientId(clienteId);
          console.log("clienteid", clienteId);

          setFormData({
            nome_completo: "",
            email: "",
            nif: "",
            contacto: "",
            morada: "",
            localidade: "",
            cod_postal: "",
          });

          router.push(`/detalhes/detalhecliente?id=${clienteId}`);
        }
      } catch (error) {
        console.error("Erro ao enviar dados:", error);
      }
    }
  };
  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
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
          Criar Cliente
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome Completo"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.nome_completo}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    nome_completo: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    email: event.target.value,
                  })
                }
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
                min={0}
                maxLength={9}
                minLength={9}
                value={formData.nif}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    nif: event.target.value,
                  })
                }
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Contacto"
                type="number"
                min={0}
                maxLength={9}
                minLength={9}
                value={formData.contacto}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    contacto: event.target.value,
                  })
                }
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
                label="Morada"
                type="text"
                value={formData.morada}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    morada: event.target.value,
                  })
                }
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
                label="Código Postal"
                type="text"
                maxLength={8}
                minLength={8}
                value={formData.cod_postal}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    cod_postal: event.target.value,
                  })
                }
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                label="Localidade"
                type="text"
                value={formData.localidade}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    localidade: event.target.value,
                  })
                }
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
              Adicionar
            </Button>
          </div>
          <Toaster containerStyle={{ zIndex: 9999 }} />
        </form>
      </div>
    </Dialog>
  );
}
