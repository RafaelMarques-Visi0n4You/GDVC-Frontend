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
  funcionarios: {
    ativo: boolean;
    cargo: string;
    cod_postal: string;
    contacto: number;
    criado_por: number;
    departamento_id: number;
    email: string;
    empresa_id: number;
    equipa_id: number;
    funcionario_id: number;
    morada: string;
    localidade: string;
    nome_completo: string;
    numero_mecanografico: number;
    equipa: {
      equipa_id: number;
      nome: string;
      data_criacao: string;
      ativo: boolean;
    };
  }[];
  equipas: {
    ativo: number;
    data_criacao: string;
    empresa_id: number;
    equipa_id: number;
    nome: string;
  }[];
  departamentos: {
    ativo: boolean;
    data_criacao: string;
    departamento_id: number;
    empresa_id: number;
    nome: string;
  }[];
}

export default function CriarFuncionarioModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [departamentoData, setDepartamentoData] = useState<Data | null>(null);
  const [equipaData, setEquipaData] = useState<Data | null>(null);
  const [formData, setFormData] = useState({
    cargo: "",
    cod_postal: "",
    contacto: 0,
    criado_por: 0,
    departamento_id: 0,
    email: "",
    empresa_id: 0,
    equipa_id: 0,
    morada: "",
    localidade: "",
    nome_completo: "",
    numero_mecanografico: 0,
  });

  const data = useContext(AuthContext);

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.post("/departamento/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setDepartamentoData(response.data);
        console.log("Resposta da obtenção dos departamentos:", response.data);

        const response2 = await api.post("/equipa/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setEquipaData(response2.data);
        console.log("Resposta da obtenção das equipas:", response2.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    console.log(data);
    loadData();
  }, [open]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (formData.nome_completo.trim() === "") {
          toast.error("O campo Nome é obrigatório!");
        }
        if (formData.numero_mecanografico === 0) {
          toast.error("O campo Número Mecanográfico é obrigatório!");
        }
        if (formData.contacto === 0) {
          toast.error("O campo Contacto é obrigatório!");
        }
        if (formData.email.trim() === "") {
          toast.error("O campo Email é obrigatório!");
        }
        if (formData.morada.trim() === "") {
          toast.error("O campo Morada é obrigatório!");
        }
        if (formData.cod_postal.trim() === "") {
          toast.error("O campo Código Postal é obrigatório!");
        }
        if (formData.localidade.trim() === "") {
          toast.error("O campo Localidade é obrigatório!");
        }
        if (formData.cargo.trim() === "") {
          toast.error("O campo Cargo é obrigatório!");
        }
        if (formData.departamento_id === 0) {
          toast.error("O campo Departamento é obrigatório!");
        }
        if (formData.equipa_id === 0) {
          toast.error("O campo Equipa é obrigatório!");
        }
        // Crie a equipe
        const response = await api.post("/funcionario/create", {
          cargo: formData.cargo,
          cod_postal: formData.cod_postal,
          contacto: formData.contacto,
          criado_por_id: data.user.conta_utilizador_id,
          departamento_id: formData.departamento_id,
          email: formData.email,
          empresa_id: data.user.funcionario.empresa_id,
          equipa_id: formData.equipa_id,
          morada: formData.morada,
          localidade: formData.localidade,
          nome_completo: formData.nome_completo,
          numero_mecanografico: formData.numero_mecanografico,
        });

        console.log("Resposta da criação do funcinario:", response.data);

        // Verifique se a equipe foi criada com sucesso
        if (response.data.id) {
          // Extraia o ID da equipe criada da resposta da API
          const funcionarioId = response.data.id;
          console.log("ID da empresa criada:", funcionarioId);

          // Crie o chefe da equipe usando o ID da equipe
        } else {
          console.log("Erro ao criar a empresa.");
        }

        // Limpe os campos do formulário se necessário
        setFormData({
          cargo: "",
          cod_postal: "",
          contacto: 0,
          criado_por: 0,
          departamento_id: 0,
          email: "",
          empresa_id: 0,
          equipa_id: 0,
          morada: "",
          localidade: "",
          nome_completo: "",
          numero_mecanografico: 0,
        });

        setOpen(false);
        toast.success("Funcionário criado com sucesso!");
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
          Criar Funcionário
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
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
                type="number"
                label="Número Mecanográfico"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.numero_mecanografico}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    numero_mecanografico: parseInt(event.target.value),
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
            <div className="w-full">
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
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Código Postal"
                minLength={8}
                maxLength={8}
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
            <div className="w-1/2">
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

          <div className="flex flex-row gap-10 lg:gap-4">
            <div className="w-1/3">
              <Input
                type="text"
                label="Cargo"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={formData.cargo}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    cargo: event.target.value,
                  })
                }
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/3">
              <Select
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    departamento_id: parseInt(value as string),
                  }));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                label="Departamento"
              >
                {departamentoData?.departamentos?.map((departamento) => (
                  <Option value={String(departamento?.departamento_id)}>
                    {departamento?.nome}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="w-1/3">
              <Select
                onChange={(value) => {
                  setFormData((prevData) => ({
                    ...prevData,
                    equipa_id: parseInt(value as string),
                  }));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                label="Equipa"
              >
                {equipaData?.equipas
                  ?.filter((equipa) => equipa?.ativo === 1)
                  ?.map((equipa) => (
                    <Option value={String(equipa?.equipa_id)}>
                      {equipa?.nome}
                    </Option>
                  ))}
              </Select>
            </div>
          </div>
          <br />
          <div className="flex flex-row justify-center gap-28">
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
