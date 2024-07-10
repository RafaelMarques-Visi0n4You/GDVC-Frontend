import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import router from "next/router";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
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
  plano: {
    plano_subscricao_id: number;
    tipo_plano: string;
    limite_equipas: number;
    limite_servicos: number;
  }[];
  planos: {
    plano_subscricao_id: number;
    tipo_plano: string;
    limite_equipas: number;
    limite_servicos: number;
  }[];
  planoSubscricaoEmpresas: {
    plano_subscricao_empresa_id: number;
    data_subscricao: string;
    ativo: boolean;
    plano_subscricao_id: number;
  }[];
}

export default function UpdateEmpresaModal({
  open,
  setOpen,
  setUpdateKey,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
}) {
  const [nome, setNome] = useState("");
  const [cod_postal, setCod_postal] = useState("");
  const [contacto, setContacto] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [empresa_id, setEmpresa_id] = useState<number | null>(null);
  const [localidade, setLocalidade] = useState("");
  const [morada, setMorada] = useState("");
  const [nif, setNif] = useState("");
  const [plano_subscricao_id, setPlano_subscricao_id] = useState<number | null>(
    null
  );
  const [ramo_atividade, setRamoAtividade] = useState("");
  const [logo_empresa, setLogoEmpresa] = useState("");
  const [planosubscricao, setPlanoSubscricao] = useState<Data | null>(null);

  const [refresh, setRefresh] = useState(false);
  const id = router.query.id;

  const data = useContext(AuthContext);

  const handleClose = () => {
    // Fecha o diálogo quando chamado
    setOpen(false);
    setRefresh(!refresh); // Fecha o diálogo quando chamado
  };

  const loadData = async () => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/planosubscricao/get");
        console.log("Dagdsgds:", response.data);
        setPlanoSubscricao(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  };

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        api
          .get("/empresa/get/" + id)
          .then((response) => {
            setNome(response.data.empresa?.nome);
            setCod_postal(response.data.empresa?.cod_postal);
            setContacto(response.data.empresa?.contacto);
            setEmail(response.data.empresa?.email);
            setEmpresa_id(response.data.empresa?.empresa_id);
            setLocalidade(response.data.empresa?.localidade);
            setMorada(response.data.empresa?.morada);
            setNif(response.data.empresa?.nif);
            setPlano_subscricao_id(response.data.plano?.plano_subscricao_id);
            setRamoAtividade(response.data.empresa?.ramo_atividade);
            setLogoEmpresa(response.data.empresa?.logo_empresa);
            console.log("Dados da empresa:", response.data);
          })

          .catch((error) => {
            // Trate o erro adequadamente, por exemplo, exibindo uma mensagem de erro
            console.error("Erro ao obter dados da equipa:", error);
          });
      } catch (error) {
        // Trate o erro capturado pelo try-catch, se necessário
        console.error("Erro ao tentar obter dados do cliente:", error);
      }
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.put(`/empresa/update/${id}`, {
          nome: nome,
          cod_postal: cod_postal,
          contacto: contacto,
          email: email,
          empresa_id: empresa_id,
          localidade: localidade,
          morada: morada,
          nif: nif,
          plano_subscricao_id: plano_subscricao_id,
          ramo_atividade: ramo_atividade,
          logo_empresa: logo_empresa,
        });
        console.log("Resposta:", response.data);
        setUpdateKey((prev) => prev + 1);
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
          Editar Empresa
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="text"
                label="Nif"
                min={0}
                maxLength={9}
                minLength={9}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={nif}
                onChange={(e) => setNif(e.target.value)}
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
                min={0}
                maxLength={9}
                minLength={9}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={contacto?.toString()}
                onChange={(e) => setContacto(Number(e.target.value))}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="email"
                label="email"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={morada}
                onChange={(e) => setMorada(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/3">
              <Input
                type="text"
                label="Código Postal"
                minLength={8}
                maxLength={8}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={cod_postal}
                onChange={(e) => setCod_postal(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/3">
              <Input
                type="text"
                label="Localidade"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={localidade}
                onChange={(e) => setLocalidade(e.target.value)}
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
                value={ramo_atividade}
                onChange={(e) => setRamoAtividade(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Select
                value={plano_subscricao_id?.toString()}
                onChange={(value) => {
                  setPlano_subscricao_id(Number(value));
                }}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                label="Plano de subscrição"
              >
                {planosubscricao?.planos.map((plano) => (
                  <Option value={String(plano?.plano_subscricao_id)}>
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
              Editar
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
