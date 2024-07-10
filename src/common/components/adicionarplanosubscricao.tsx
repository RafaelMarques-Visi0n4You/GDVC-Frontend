import {
  Button,
  Dialog,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import router from "next/router";
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
    empresa_id: number;
    plano_subscricao: {
      plano_subscricao_id: number;
      tipo_plano: string;
      limite_equipas: number;
      limite_servicos: number;
      data_criacao: string;
    };
  }[];
}

export default function AssociarPlanoDeSubscricaoModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const id = router.query.id;

  const [tipoServicoEmpresaData, setTipoServicoEmpresaData] =
    useState<Data | null>(null);
  const [formData, setFormData] = useState({
    plano_subscricao_id: 0,
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const responseTipoSubscricaoEmpresa = await api.get(
          "/planosubscricao/get"
        );
        setTipoServicoEmpresaData(responseTipoSubscricaoEmpresa.data);
        console.log("ze:", responseTipoSubscricaoEmpresa.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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
        if (formData.plano_subscricao_id !== 0) {
          // Verifique se já existe um registro para esta equipe na tabela chefeequipa
          const response = await api.post(
            "/planosubscricaoempresa/associarplanosubscricaoempresa",
            {
              empresa_id: id,
              plano_subscricao_id: formData.plano_subscricao_id,
            }
          );

          if (response.data.Status === "Existe") {
            const update = await api.put("/planosubscricaoempresa/update", {
              empresa_id: id,
              plano_subscricao_id: formData.plano_subscricao_id,
            });

            if (update.data.Status === "Success") {
              console.log("Plano atualizado com sucesso");
            }
          }

          setFormData({
            plano_subscricao_id: 0,
          });

          setOpen(false);
          toast.success("Plano de subscrição alterado/adicionado com sucesso!");
        } else {
          toast.error("Selecione um plano de subscrição");
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
          Planos de Subscrição
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-full">
              <Select
                value={String(formData.plano_subscricao_id)}
                onChange={(value) => {
                  setFormData({
                    plano_subscricao_id: parseInt(value as string),
                  });
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {tipoServicoEmpresaData?.planos.map((plano) => (
                  <Option
                    key={plano.plano_subscricao_id}
                    value={String(plano.plano_subscricao_id)}
                  >
                    {plano.tipo_plano}
                  </Option>
                ))}
              </Select>
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
