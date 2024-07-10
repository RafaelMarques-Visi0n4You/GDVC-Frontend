import api from "@/common/services/api";
import {
  Button,
  Card,
  CardBody,
  Dialog,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
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
    ativo: boolean;
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

export default function DetalheFuncionarioModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const id = router.query.id;

  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [equipa, setEquipa] = useState<Data | null>(null);
  const [departamento, setDepartamento] = useState<Data | null>(null);

  const user = useContext(AuthContext);

  const handleClose = () => {
    setOpen(false); // Fecha o diálogo quando chamado
  };

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setRefresh(!refresh);
    const token = getCookie("token");
    if (token) {
      api.defaults.headers["Authorization"] = `Bearer ${token}`;
      try {
        const response = await api.get("/funcionario/get/" + id);

        const servicesData = response.data;

        setData(servicesData);
        console.log("Data:", data);

        const response2 = await api.post("/equipa/get", {
          empresa_id: response.data.funcionario.empresa_id,
        });
        setEquipa(response2.data);
        console.log(response2.data);

        const response3 = await api.post("/departamento/get", {
          empresa_id: response.data.funcionario.empresa_id,
        });
        setDepartamento(response3.data);
        console.log(response3.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }

  return (
    <>
      <Dialog open={open} style={{ backgroundColor: "#F9FAFB" }}>
        <Typography variant="h5" className="flex justify-center mt-4">
          Detalhes Funcionário
        </Typography>
        <div className="grid grid-cols-2 gap-5">
          <Card className="mt-5 w-90 ml-4 max-h-60 ">
            <CardBody>
              <p className="text-gray-600 ">
                Nome Funcionário:{" "}
                <span className="text-black">
                  {data?.funcionario?.nome_completo}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Número Mecanográfico:{" "}
                <span className="text-black">
                  {data?.funcionario?.numero_mecanografico}{" "}
                </span>
              </p>
              <p className="mt-4 text-gray-600">
                Cargo:{" "}
                <span className="text-black">{data?.funcionario?.cargo} </span>
              </p>
              <p className="mt-4 text-gray-600">
                Estado:{" "}
                <span
                  className={`text-black ${
                    data?.funcionario?.ativo ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data?.funcionario?.ativo ? "Ativo" : "Inativo"}
                </span>
              </p>
            </CardBody>
          </Card>

          <div className="">
            <Card className="mt-5 mr-4">
              <CardBody>
                <p className="mt-2 text-gray-600">
                  Email:{" "}
                  <span className="text-black">{data?.funcionario?.email}</span>
                </p>
                <p className="mt-2 text-gray-600">
                  Contacto:{" "}
                  <span className="text-black">
                    {data?.funcionario?.contacto}
                  </span>
                </p>
                <p className="mt-2 text-gray-600">
                  Morada Completa:{" "}
                  <span className="text-black">
                    {data?.funcionario?.morada}, {data?.funcionario?.cod_postal}{" "}
                    , {data?.funcionario?.localidade}
                  </span>
                </p>
              </CardBody>
            </Card>
          </div>
          <Card className="ml-4 xl:w-178 lg:w-140">
            <CardBody>
              <Typography variant="h6">Pertence a:</Typography>
              <p className="mt-2 text-gray-600">
                Equipa:{" "}
                <span className="text-black">
                  {equipa?.equipas?.map((equipa, index) => (
                    <span key={index}>
                      {equipa.equipa_id === data?.funcionario?.equipa_id ? (
                        <span>{equipa.nome}</span>
                      ) : (
                        ""
                      )}
                    </span>
                  ))}
                </span>
              </p>
              <p className="mt-2 text-gray-600">
                Departamento:{" "}
                <span className="text-black">
                  {departamento?.departamentos?.map((departamento, index) => (
                    <span key={index}>
                      {departamento.departamento_id ===
                      data?.funcionario?.departamento_id ? (
                        <span>{departamento.nome}</span>
                      ) : (
                        ""
                      )}
                    </span>
                  ))}
                </span>
              </p>
            </CardBody>
          </Card>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleClose}
            className="w-40"
            style={{ backgroundColor: "#BDC2CD" }}
          >
            Voltar
          </Button>
        </div>
        <br />
      </Dialog>
    </>
  );
}
