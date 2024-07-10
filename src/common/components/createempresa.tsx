import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

interface Data {
  Status: string;
  empresas: {
    cod_postal: string;
    contacto: string;
    data_adesao: string;
    email: string;
    empresa_id: number;
    localidade: string;
    morada: string;
    nif: string;
    nome: string;
    plano_subscricao_empresa_id: number;
    ramo_atividade: string;
    logo_empresa: string;
  }[];
  planos: {
    plano_subscricao_id: number;
    tipo_plano: string;
    limite_equipas: number;
    limite_servicos: number;
    data_criacao: string;
  }[];
  planoSubscricaoEmpresas: {
    plano_subscricao_empresa_id: number;
    data_subscricao: string;
    ativo: boolean;
    plano_subscricao_id: number;
  }[];
}

export default function CriarEmpresaModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [empresa, setEmpresa] = useState<Data | null>(null);
  const [tiposervicoData, setTipoServicoData] = useState<Data | null>(null);
  const [tiposervicoempresaData, setTipoServicoEmpresaData] =
    useState<Data | null>(null);
  const [formData, setFormData] = useState({
    cod_postal: "",
    contacto: 0,
    email: "",
    localidade: "",
    morada: "",
    nif: "",
    nome: "",
    plano_subscricao_id: 0,
    ramo_atividade: "",
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const responseTipoSubscricao = await api.get("/planosubscricao/get");
        console.log("1:", responseTipoSubscricao.data);
        setTipoServicoData(responseTipoSubscricao.data);

        const responseTipoSubscricaoEmpresa = await api.get(
          "/planosubscricaoempresa/get"
        );
        console.log("2:", responseTipoSubscricaoEmpresa.data);
        setTipoServicoEmpresaData(responseTipoSubscricaoEmpresa.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [open]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (
          formData.nome != "" &&
          formData.nif != "" &&
          formData.email != "" &&
          formData.morada != "" &&
          formData.cod_postal != "" &&
          formData.localidade != "" &&
          formData.ramo_atividade != "" &&
          formData.plano_subscricao_id != 0
        ) {
          // Crie a equipe
          const response = await api.post("/empresa/create", {
            cod_postal: formData.cod_postal,
            contacto: formData.contacto,
            email: formData.email,
            localidade: formData.localidade,
            morada: formData.morada,
            nif: formData.nif,
            nome: formData.nome,
            plano_subscricao_id: formData.plano_subscricao_id,
            ramo_atividade: formData.ramo_atividade,
          });
          console.log("plano:", formData.plano_subscricao_id);
          console.log("Resposta da criação da empresa:", response.data);

          // Verifique se a equipe foi criada com sucesso
          if (response.data.id) {
            // Extraia o ID da equipe criada da resposta da API
            const empresaId = response.data.id;
            console.log("ID da empresa criada:", empresaId);

            // Crie o chefe da equipe usando o ID da equipe
          } else {
            console.log("Erro ao criar a empresa.");
          }

          // Limpe os campos do formulário se necessário
          setFormData({
            cod_postal: "",
            contacto: 0,
            email: "",
            localidade: "",
            morada: "",
            nif: "",
            nome: "",
            plano_subscricao_id: 0,
            ramo_atividade: "",
          });

          setOpen(false);
          toast.success("Empresa criada com sucesso!");
        } else {
          if (formData.nome.trim() === "") {
            toast.error("O campo Nome é obrigatório.");
          }
          if (formData.nif.trim() == "") {
            toast.error("O campo NIF é obrigatório.");
          }
          if (formData.email.trim() == "") {
            toast.error("O campo Email é obrigatório.");
          }
          if (formData.morada.trim() == "") {
            toast.error("O campo Morada é obrigatório.");
          }
          if (formData.cod_postal.trim() == "") {
            toast.error("O campo Código Postal é obrigatório.");
          }
          if (formData.localidade.trim() == "") {
            toast.error("O campo Localidade é obrigatório.");
          }
          if (formData.ramo_atividade.trim() == "") {
            toast.error("O campo Ramo de Atividade é obrigatório.");
          }
          if (formData.plano_subscricao_id == 0) {
            toast.error("O campo Plano de Subscrição é obrigatório.");
          }
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
    <Dialog open={open} size="lg">
      <div className="flex-col p-6">
        <Typography
          className="flex justify-center"
          variant="h4"
          color="blue-gray"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Criar Empresa
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.nome}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    nome: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="text"
                label="Nif"
                maxLength={9}
                minLength={9}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.nif}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    nif: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="number"
                label="Contacto"
                maxLength={9}
                minLength={9}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.contacto}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    contacto: parseInt(event.target.value),
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="email"
                label="email"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.email}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    email: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/3">
              <Input
                type="text"
                label="Morada"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.morada}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    morada: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/3">
              <Input
                type="text"
                label="Código Postal"
                maxLength={8}
                minLength={8}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.cod_postal}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    cod_postal: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/3">
              <Input
                type="text"
                label="Localidade"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.localidade}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    localidade: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Ramo de Atividade"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.ramo_atividade}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    ramo_atividade: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Select
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    plano_subscricao_id: parseInt(value as string),
                  }));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                label="Plano de subscrição"
              >
                {tiposervicoData?.planos.map((plano) => (
                  <Option value={String(plano?.plano_subscricao_id)}>
                    {plano.tipo_plano}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          <br />
          <div className="flex flex-row justify-center gap-40">
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
