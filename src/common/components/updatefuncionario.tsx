import {
  Button,
  Dialog,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
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
  funcionario: {
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
  };
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

export default function UpdateFuncionarioModal({
  open,
  setOpen,
  setUpdateKey,
  id,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateKey: Dispatch<SetStateAction<number>>;
  id: number;
}) {
  const [nome_completo, setNome_completo] = useState("");
  const [cargo, setCargo] = useState("");
  const [cod_postal, setCod_postal] = useState("");
  const [contacto, setContacto] = useState(0);
  const [email, setEmail] = useState("");
  const [morada, setMorada] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [numero_mecanografico, setNumero_mecanografico] = useState(0);
  const [departamento_id, setDepartamento_id] = useState(0);
  const [equipa_id, setEquipa_id] = useState(0);
  const [departamentoData, setDepartamentoData] = useState<Data | null>(null);
  const [equipaData, setEquipaData] = useState<Data | null>(null);

  const [funcionario, setFuncionario] = useState<Data | null>(null);
  const [refresh, setRefresh] = useState(false);

  const data = useContext(AuthContext);

  const handleClose = () => {
    // Fecha o diálogo quando chamado
    setOpen(false);
    setRefresh(!refresh); // Fecha o diálogo quando chamado
  };

  const loadData = async (id: number) => {
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/funcionario/get/" + id);
        setFuncionario(response.data);

        const response2 = await api.post("/departamento/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setDepartamentoData(response2.data);
        console.log("Resposta da obtenção dos departamentos:", response2.data);

        const response3 = await api.post("/equipa/get", {
          empresa_id: data.user.funcionario.empresa_id,
        });
        setEquipaData(response3.data);
        console.log("Resposta da obtenção das equipas:", response3.data);
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
          .get("/funcionario/get/" + id)
          .then((response) => {
            // Atualize o estado com os dados recebidos
            setNome_completo(response.data.funcionario.nome_completo);
            setCargo(response.data.funcionario.cargo);
            setCod_postal(response.data.funcionario.cod_postal);
            setContacto(response.data.funcionario.contacto);
            setEmail(response.data.funcionario.email);
            setMorada(response.data.funcionario.morada);
            setLocalidade(response.data.funcionario.localidade);
            setNumero_mecanografico(
              response.data.funcionario.numero_mecanografico
            );
            setDepartamento_id(response.data.funcionario.departamento_id);
            setEquipa_id(response.data.funcionario.equipa_id);
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
    loadData(id);
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        if (nome_completo.trim() === "") {
          toast.error("O campo Nome é obrigatório!");
        }
        if (numero_mecanografico === 0) {
          toast.error("O campo Número Mecanográfico é obrigatório!");
        }
        if (contacto === 0) {
          toast.error("O campo Contacto é obrigatório!");
        }
        if (email.trim() === "") {
          toast.error("O campo Email é obrigatório!");
        }
        if (morada.trim() === "") {
          toast.error("O campo Morada é obrigatório!");
        }
        if (cod_postal.trim() === "") {
          toast.error("O campo Código Postal é obrigatório!");
        }
        if (localidade.trim() === "") {
          toast.error("O campo Localidade é obrigatório!");
        }
        if (cargo.trim() === "") {
          toast.error("O campo Cargo é obrigatório!");
        }
        if (departamento_id === 0) {
          toast.error("O campo Departamento é obrigatório!");
        }
        if (equipa_id === 0) {
          toast.error("O campo Equipa é obrigatório!");
        }
        const response = await api.put(`/funcionario/update/${id}`, {
          nome_completo: nome_completo,
          cargo: cargo,
          cod_postal: cod_postal,
          contacto: contacto,
          email: email,
          morada: morada,
          localidade: localidade,
          numero_mecanografico: numero_mecanografico,
          departamento_id: departamento_id,
          equipa_id: equipa_id,
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
          Editar Funcionário
        </Typography>

        <form onSubmit={handleSubmit} className="py-10 sm:w-94">
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Nome"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={nome_completo}
                onChange={(e) => setNome_completo(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
              <Input
                type="number"
                min={0}
                label="Número Mecanográfico"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={numero_mecanografico}
                onChange={(e) =>
                  setNumero_mecanografico(parseInt(e.target.value))
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
                min={0}
                maxLength={9}
                minLength={9}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={contacto}
                onChange={(e) => setContacto(parseInt(e.target.value))}
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
            <div className="w-full">
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
          </div>
          <br />
          <div className="flex flex-row gap-10">
            <div className="w-1/2">
              <Input
                type="text"
                label="Código Postal"
                maxLength={8}
                minLength={8}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={cod_postal}
                onChange={(e) => setCod_postal(e.target.value)}
                crossOrigin={undefined}
              />
            </div>
            <div className="w-1/2">
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
            <div className="w-1/3">
              <Input
                type="text"
                label="Cargo"
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
              />
            </div>
            <div className="w-1/3">
              <Select
                value={departamento_id.toString()}
                onChange={(value) => {
                  setDepartamento_id(Number(value));
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
                value={equipa_id.toString()}
                onChange={(value) => {
                  setEquipa_id(Number(value));
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
              Editar
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
