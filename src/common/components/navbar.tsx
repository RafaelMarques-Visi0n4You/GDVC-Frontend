import router from "next/router";
import { useContext, useEffect, useState } from "react";
import { AuthContext, useAuth } from "../components/AuthContext";

import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  BellIcon,
  CalendarIcon,
  DocumentIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Collapse,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Navbar,
  Typography,
} from "@material-tailwind/react";
import { getCookie } from "cookies-next";
import React from "react";
import api from "../services/api";
import NotificacoesModal from "./notifications";

interface Data {
  Status: string;
  visitas: {
    visita_id: number;
    empresa_id: number;
    cliente_id: number;
    funcionario_id: number;
    data_visita: string;
    hora_visita_inicio: string;
    hora_visita_fim: string;
    estado_servico: string;
    descricao: string;
    data_visita_fim: string;
    agenda_servico_id: number;
    servicos: {
      servico_id: number;
      nome: string;
    }[];
    contrato: {
      contrato_id: number;
      cliente: {
        cliente_id: number;
        nome_completo: string;
      };
    };
    agenda_servico: {
      agenda_servico_id: number;
      equipa: {
        equipa_id: number;
        nome: string;
      };
    };
  }[];
  clientes: {
    cliente_id: number;
    nome_completo: string;
  }[];
}

const navListClientItems = [
  {
    title: "Gestão de Clientes",
    icon: UserIcon,
    href: "/gestao/gestaocliente/",
  },
];

const navListEquipaItems = [
  {
    title: "Gestão de Equipas",
    icon: UserGroupIcon,
    href: "/gestao/gestaoequipa/",
  },
  {
    title: "Gestão de Serviços",
    icon: CalendarIcon,
    href: "/gestao/gestaoservico/",
  },
];

const navListMenuItems = [
  {
    title: "Gestão de Funcionários",
    icon: UsersIcon,
    href: "/gestao/gestaofuncionario/",
  },
  {
    title: "Gestão de Contas",
    icon: UserCircleIcon,
    href: "/gestao/gestaoconta/",
  },
];

const navsino = [
  {
    title: "Histórico",
    icon: DocumentIcon,
    href: "/historico/historicovisitas",
  },
  {
    title: "A aguardar",
    icon: DocumentIcon,
    href: "/aaguardar",
  },
  {
    title: "Pendentes",
    icon: DocumentIcon,
    href: "/visitaspendentes",
  },
  {
    title: "Agendadas",
    icon: DocumentIcon,
    href: "/visitasagendadas",
  },
  {
    title: "Não aprovadas",
    icon: DocumentIcon,
    href: "/visitasnaoaprovadas",
  },
];

const visitasitems = [
  {
    title: "Histórico",
    icon: DocumentIcon,
    href: "/historico/historicovisitas",
  },
  {
    title: "A aguardar",
    icon: DocumentIcon,
    href: "/aaguardar",
  },
  {
    title: "Pendentes",
    icon: DocumentIcon,
    href: "/visitaspendentes",
  },
  {
    title: "Agendadas",
    icon: DocumentIcon,
    href: "/visitasagendadas",
  },
  {
    title: "Não aprovadas",
    icon: DocumentIcon,
    href: "/visitasnaoaprovadas",
  },
];

const visitasitems2 = [
  {
    title: "Histórico",
    icon: DocumentIcon,
    href: "/historico/historicovisitas",
  },

  {
    title: "Pendentes",
    icon: DocumentIcon,
    href: "/visitaspendentes",
  },
  {
    title: "Agendadas",
    icon: DocumentIcon,
    href: "/visitasagendadas",
  },
];

function NavListMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const handleGestaoClick = (href: string) => {
    router.push(href);
  };
  const renderItems = navListClientItems.map(({ icon, title, href }, key) => (
    <div className="flex col-span-12">
      <a href="#" key={key}>
        <MenuItem
          placeholder=""
          className="flex items-center gap-3 rounded-lg"
          onClick={() => handleGestaoClick(href)}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {" "}
            {React.createElement(icon, {
              strokeWidth: 2,
              className: "h-6 text-black w-6",
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="white"
              className="flex items-center text-sm font-bold lg:text-black"
              placeholder=""
            >
              {title}
            </Typography>
          </div>
        </MenuItem>
      </a>
    </div>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography
            placeholder=""
            as="div"
            variant="small"
            className="font-medium"
          >
            <ListItem
              placeholder=""
              className="flex items-center gap-2 py-2 pr-4 font-medium text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Clientes
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          placeholder=""
          className="hidden max-w-screen-xl rounded-xl lg:block"
        >
          <ul className="grid grid-cols-2 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavListMenu2({ resetAtivos }: any) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const handleGestaoClick = (href: string) => {
    router.push(href);
  };
  const renderItems = navListEquipaItems.map(({ icon, title, href }, key) => (
    <div className="flex col-span-12">
      <a href="#" key={key}>
        <MenuItem
          placeholder=""
          className="flex items-center gap-3 rounded-lg"
          onClick={() => {
            handleGestaoClick(href), resetAtivos();
          }}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {" "}
            {React.createElement(icon, {
              strokeWidth: 2,
              className: "h-6 text-black w-6",
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="white"
              className="flex items-center text-sm font-bold lg:text-black"
              placeholder=""
            >
              {title}
            </Typography>
          </div>
        </MenuItem>
      </a>
    </div>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography
            placeholder=""
            as="div"
            variant="small"
            className="font-medium"
          >
            <ListItem
              placeholder=""
              className="flex items-center gap-2 py-2 pr-4 font-medium text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Equipa
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          placeholder=""
          className="hidden max-w-screen-xl rounded-xl lg:block"
        >
          <ul className="grid grid-cols-2 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavListMenu3({ resetAtivos }: any) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const handleGestaoClick = (href: string) => {
    router.push(href);
  };
  const renderItems = navListMenuItems.map(({ icon, title, href }, key) => (
    <div className="flex col-span-12">
      <a href="#" key={key}>
        <MenuItem
          placeholder=""
          className="flex items-center gap-3 rounded-lg"
          onClick={() => {
            handleGestaoClick(href), resetAtivos();
          }}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {" "}
            {React.createElement(icon, {
              strokeWidth: 2,
              className: "h-6 text-black w-6",
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="white"
              className="flex items-center text-sm font-bold lg:text-black"
              placeholder=""
            >
              {title}
            </Typography>
          </div>
        </MenuItem>
      </a>
    </div>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography
            placeholder=""
            as="div"
            variant="small"
            className="font-medium"
          >
            <ListItem
              placeholder=""
              className="flex items-center gap-2 py-2 pr-4 font-medium text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Empresa
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          placeholder=""
          className="hidden max-w-screen-xl rounded-xl lg:block"
        >
          <ul className="grid grid-cols-3 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavListMenu4({ resetAtivos }: any) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const handleGestaoClick = (href: string) => {
    router.push(href);
  };
  const renderItems = visitasitems.map(({ icon, title, href }, key) => (
    <div className="flex col-span-12">
      <a href="#" key={key}>
        <MenuItem
          placeholder=""
          className="flex items-center gap-3 rounded-lg"
          onClick={() => {
            handleGestaoClick(href), resetAtivos();
          }}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {" "}
            {React.createElement(icon, {
              strokeWidth: 2,
              className: "h-6 text-black w-6",
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="white"
              className="flex items-center text-sm font-bold lg:text-black"
              placeholder=""
            >
              {title}
            </Typography>
          </div>
        </MenuItem>
      </a>
    </div>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography
            placeholder=""
            as="div"
            variant="small"
            className="font-medium"
          >
            <ListItem
              placeholder=""
              className="flex items-center gap-2 py-2 pr-4 font-medium text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Visitas
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          placeholder=""
          className="hidden max-w-screen-xl rounded-xl lg:block"
        >
          <ul className="grid grid-cols-3 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavListMenu5({ resetAtivos }: any) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const handleGestaoClick = (href: string) => {
    router.push(href);
  };
  const renderItems = visitasitems2.map(({ icon, title, href }, key) => (
    <div className="flex col-span-12">
      <a href="#" key={key}>
        <MenuItem
          placeholder=""
          className="flex items-center gap-3 rounded-lg"
          onClick={() => {
            handleGestaoClick(href), resetAtivos();
          }}
        >
          <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
            {" "}
            {React.createElement(icon, {
              strokeWidth: 2,
              className: "h-6 text-black w-6",
            })}
          </div>
          <div>
            <Typography
              variant="h6"
              color="white"
              className="flex items-center text-sm font-bold lg:text-black"
              placeholder=""
            >
              {title}
            </Typography>
          </div>
        </MenuItem>
      </a>
    </div>
  ));

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography
            placeholder=""
            as="div"
            variant="small"
            className="font-medium"
          >
            <ListItem
              placeholder=""
              className="flex items-center gap-2 py-2 pr-4 font-medium text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              Visitas
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          placeholder=""
          className="hidden max-w-screen-xl rounded-xl lg:block"
        >
          <ul className="grid grid-cols-3 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

function NavListMenu6() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [updateKey, setUpdateKey] = useState(0);
  const [visitas, setVisitas] = useState([]);
  const [visitas2, setVisitas2] = useState([]);
  const [visitas3, setVisitas3] = useState([]);
  const [visitas4, setVisitas4] = useState([]);
  const [visitas5, setVisitas5] = useState([]);

  const data = useContext(AuthContext);

  useEffect(() => {
    const fetchVisits = async () => {
      setIsLoading(true);
      try {
        const token = getCookie("token");
        if (token) {
          api.defaults.headers["Authorization"] = `Bearer ${token}`;
          if (data.user?.tipo_utilizador === "nivel3") {
            const response = await api.post("/visita/getVisitasPendentes", {
              empresa_id: data.user.funcionario.empresa_id,
              departamento_id: data.user.funcionario.departamento_id,
            });
            if (response.status === 200) {
              setVisitas(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post(
              "/visita/getVisitasPendentesnivel4",
              {
                empresa_id: data.user.funcionario.empresa_id,
              }
            );

            if (response.status === 200) {
              setVisitas(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post("/visita/getAguardarVisitas", {
              empresa_id: data.user.funcionario.empresa_id,
            });

            if (response.status === 200) {
              setVisitas2(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post("/visita/getVisitasNaoAprovada", {
              empresa_id: data.user.funcionario.empresa_id,
            });

            if (response.status === 200) {
              setVisitas3(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post("/visita/getVisitasNaoAprovada", {
              empresa_id: data.user.funcionario.empresa_id,
            });

            if (response.status === 200) {
              setVisitas3(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post("/visita/getAgendadasVisitas", {
              empresa_id: data.user.funcionario.empresa_id,
            });

            if (response.status === 200) {
              setVisitas4(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post("/visita/getHistoricoVisitas", {
              empresa_id: data.user.funcionario.empresa_id,
            });

            if (response.status === 200) {
              setVisitas5(response.data.visitas || []);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, [
    data.user?.funcionario?.empresa_id,
    data.user?.funcionario?.departamento_id,
    updateKey,
  ]);

  const handleGestaoClick = (href: string) => {
    router.push(href);
  };
  const renderItems = (
    <>
      <div className="flex col-span-12">
        <a href="#">
          <MenuItem
            placeholder=""
            className="flex items-center gap-3 rounded-lg"
            onClick={() => router.push("/historico/historicovisitas")}
          >
            <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
              {" "}
              <DocumentIcon className="h-6 text-black w-6" />
            </div>
            <div>
              <Typography
                variant="h6"
                color="white"
                className="flex items-center text-sm font-bold lg:text-black"
                placeholder=""
              >
                Histórico
                <span className="absolute top--1 left-1 transform translate-x-2 -translate-y-2 rounded-full py-1 px-1 text-xs font-medium leading-none grid place-items-center bg-red-500 text-white min-w-[24px] min-h-[24px]">
                  {visitas5?.length}
                </span>
              </Typography>
            </div>
          </MenuItem>
        </a>
      </div>
      <div className="flex col-span-12">
        <a href="#">
          <MenuItem
            placeholder=""
            className="flex items-center gap-3 rounded-lg"
            onClick={() => router.push("/aaguardar")}
          >
            <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
              {" "}
              <DocumentIcon className="h-6 text-black w-6" />
            </div>
            <div>
              <Typography
                variant="h6"
                color="white"
                className="flex items-center text-sm font-bold lg:text-black"
                placeholder=""
              >
                A Aguardar
                <span className="absolute top--1 left-1 transform translate-x-2 -translate-y-2 rounded-full py-1 px-1 text-xs font-medium leading-none grid place-items-center bg-red-500 text-white min-w-[24px] min-h-[24px]">
                  {visitas2.length}
                </span>
              </Typography>
            </div>
          </MenuItem>
        </a>
      </div>
      <div className="flex col-span-12">
        <a href="#">
          <MenuItem
            placeholder=""
            className="flex items-center gap-3 rounded-lg"
            onClick={() => router.push("/visitaspendentes")}
          >
            <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
              {" "}
              <DocumentIcon className="h-6 text-black w-6" />
            </div>
            <div>
              <Typography
                variant="h6"
                color="white"
                className="flex items-center text-sm font-bold lg:text-black"
                placeholder=""
              >
                Pendente
                <span className="absolute top--1 left-1 transform translate-x-2 -translate-y-2 rounded-full py-1 px-1 text-xs font-medium leading-none grid place-items-center bg-red-500 text-white min-w-[24px] min-h-[24px]">
                  {visitas.length}
                </span>
              </Typography>
            </div>
          </MenuItem>
        </a>
      </div>
      <div className="flex col-span-12">
        <a href="#">
          <MenuItem
            placeholder=""
            className="flex items-center gap-3 rounded-lg"
            onClick={() => router.push("/visitasagendadas")}
          >
            <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
              {" "}
              <DocumentIcon className="h-6 text-black w-6" />
            </div>
            <div>
              <Typography
                variant="h6"
                color="white"
                className="flex items-center text-sm font-bold lg:text-black"
                placeholder=""
              >
                Agendadas
                <span className="absolute top--1 left-1 transform translate-x-2 -translate-y-2 rounded-full py-1 px-1 text-xs font-medium leading-none grid place-items-center bg-red-500 text-white min-w-[24px] min-h-[24px]">
                  {visitas4.length}
                </span>
              </Typography>
            </div>
          </MenuItem>
        </a>
      </div>
      <div className="flex col-span-12">
        <a href="#">
          <MenuItem
            placeholder=""
            className="flex items-center gap-3 rounded-lg"
            onClick={() => router.push("/visitasnaoaprovadas")}
          >
            <div className="flex items-center justify-center rounded-lg !bg-blue-gray-50 p-2 ">
              {" "}
              <DocumentIcon className="h-6 text-black w-6" />
            </div>
            <div>
              <Typography
                variant="h6"
                color="white"
                className="flex items-center text-sm font-bold lg:text-black"
                placeholder=""
              >
                Não aprovadas
                <span className="absolute top--1 left-1 transform translate-x-2 -translate-y-2 rounded-full py-1 px-1 text-xs font-medium leading-none grid place-items-center bg-red-500 text-white min-w-[24px] min-h-[24px]">
                  {visitas3.length}
                </span>
              </Typography>
            </div>
          </MenuItem>
        </a>
      </div>
    </>
  );

  return (
    <React.Fragment>
      <Menu
        open={isMenuOpen}
        handler={setIsMenuOpen}
        offset={{ mainAxis: 20 }}
        placement="bottom"
        allowHover={true}
      >
        <MenuHandler>
          <Typography
            placeholder=""
            as="div"
            variant="small"
            className="font-medium"
          >
            <ListItem
              placeholder=""
              className="flex items-center gap-2 py-2 pr-4 font-medium text-white"
              selected={isMenuOpen || isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((cur) => !cur)}
            >
              <BellIcon className="h-8 w-8 relative" strokeWidth={2} />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`hidden h-3 w-3 transition-transform lg:block ${
                  isMenuOpen ? "rotate-180" : ""
                }`}
              />
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`block h-3 w-3 transition-transform lg:hidden ${
                  isMobileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </ListItem>
          </Typography>
        </MenuHandler>
        <MenuList
          placeholder=""
          className="hidden max-w-screen-xl rounded-xl lg:block"
        >
          <ul className="grid grid-cols-3 gap-y-2 outline-none outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
      <div className="block lg:hidden">
        <Collapse open={isMobileMenuOpen}>{renderItems}</Collapse>
      </div>
    </React.Fragment>
  );
}

const calendario = () => {
  router.push("/home");
};

const gestaoclientes = () => {
  router.push("/gestao/gestaocliente/");
};

const gestaoempresa = () => {
  router.push("/gestao/gestaoempresa/");
};

const visitaspendentes = () => {
  router.push("/aprovacaovisita");
};

export function NavList() {
  const [visits, setVisits] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const data = useContext(AuthContext);
  const [showModalAccept, setShowModalAccept] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);
  const [ativo1, setAtivo1] = useState(false);
  const [ativo2, setAtivo2] = useState(false);
  const [ativo3, setAtivo3] = useState(false);

  useEffect(() => {
    const fetchVisits = async () => {
      setIsLoading(true);
      try {
        const token = getCookie("token");
        if (token) {
          api.defaults.headers["Authorization"] = `Bearer ${token}`;
          if (data.user?.tipo_utilizador === "nivel3") {
            const response = await api.post("/visita/getVisitasPendentes", {
              empresa_id: data.user.funcionario.empresa_id,
              departamento_id: data.user.funcionario.departamento_id,
            });
            if (response.status === 200) {
              setVisits(response.data.visitas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response = await api.post(
              "/visita/getVisitasPendentesnivel4",
              {
                empresa_id: data.user.funcionario.empresa_id,
              }
            );

            if (response.status === 200) {
              setVisits(response.data.visitas || []);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, [
    data.user?.funcionario?.empresa_id,
    data.user?.funcionario?.departamento_id,
    updateKey,
  ]);

  const resetAtivos = () => {
    setAtivo1(false);
    setAtivo2(false);
    setAtivo3(false);
  };

  const handleVisitasPendentesClick = () => {
    setUpdateKey((prevKey) => prevKey + 1);
    visitaspendentes();
  };

  return (
    <List className="mt-4 mb-6 p-0 lg:mt-0 lg:mb-0 lg:flex-row lg:p-1">
      <Typography
        as="a"
        href="#"
        variant="small"
        color="white"
        className="font-medium"
      >
        <ListItem
          onClick={() => {
            setAtivo1(true);
            calendario();
            setAtivo2(false);
            setAtivo3(false);
          }}
          className={`px-4 py-2 rounded transition-colors duration-300 flex items-center gap-2 pr-4
            ${ativo1 ? "bg-white text-[#1F2A37]" : "text-white"}
          `}
        >
          Calendário
        </ListItem>
      </Typography>
      {(data?.user?.tipo_utilizador === "nivel1" ||
        data?.user?.tipo_utilizador === "nivel2") && (
        <NavListMenu5 resetAtivos={resetAtivos} />
      )}

      {(data?.user?.tipo_utilizador === "nivel4" && (
        <NavListMenu4 resetAtivos={resetAtivos} />
      )) ||
        (data?.user?.tipo_utilizador === "nivel3" && (
          <NavListMenu4 resetAtivos={resetAtivos} />
        )) ||
        (data?.user?.tipo_utilizador === "nivel5" && (
          <NavListMenu4 resetAtivos={resetAtivos} />
        ))}
      {(data?.user?.tipo_utilizador === "nivel4" ||
        data?.user?.tipo_utilizador === "nivel5") && (
        <Typography
          as="a"
          href="#"
          variant="small"
          color="white"
          className="font-medium"
        >
          <ListItem
            onClick={() => {
              setAtivo1(false);
              gestaoclientes();
              setAtivo2(true);
              setAtivo3(false);
            }}
            className={`px-4 py-2 rounded transition-colors duration-300 flex items-center gap-2 pr-4
            ${ativo2 ? "bg-white text-[#1F2A37]" : "text-white"}
          `}
          >
            Gestão Clientes
          </ListItem>
        </Typography>
      )}

      {(data?.user?.tipo_utilizador === "nivel4" && (
        <NavListMenu2 resetAtivos={resetAtivos} />
      )) ||
        (data?.user?.tipo_utilizador === "nivel5" && (
          <NavListMenu2 resetAtivos={resetAtivos} />
        ))}
      {(data?.user?.tipo_utilizador === "nivel4" && (
        <NavListMenu3 resetAtivos={resetAtivos} />
      )) ||
        (data?.user?.tipo_utilizador === "nivel5" && (
          <NavListMenu3 resetAtivos={resetAtivos} />
        ))}
      {data?.user?.tipo_utilizador === "nivel5" && (
        <Typography
          as="a"
          href="#"
          variant="small"
          color="white"
          className="font-medium"
        >
          <ListItem
            onClick={() => {
              setAtivo1(false);
              gestaoempresa();
              setAtivo2(false);
              setAtivo3(true);
            }}
            className={`px-4 py-2 rounded transition-colors duration-300 flex items-center gap-2 pr-4
            ${ativo3 ? "bg-white text-[#1F2A37]" : "text-white"}
          `}
          >
            Administração
          </ListItem>
        </Typography>
      )}

      <NotificacoesModal
        open={showModalAccept}
        setOpen={setShowModalAccept}
        setUpdateKey={setUpdateKey}
      />
    </List>
  );
}

export function NavbarWithMegaMenu() {
  const [openNav, setOpenNav] = React.useState(false);
  const [visitas, setVisitas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const data = useContext(AuthContext);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    const fetchVisits = async () => {
      setIsLoading(true);
      try {
        const token = getCookie("token");
        if (token) {
          api.defaults.headers["Authorization"] = `Bearer ${token}`;
          if (data.user?.tipo_utilizador === "nivel3") {
            const response2 = await api.post(
              "/visita/getvisitasnaorealizadaslvl3",
              {
                empresa_id: data.user.funcionario.empresa_id,
                departamento_id: data.user.funcionario.departamento_id,
              }
            );

            if (response2.status === 200) {
              setVisitas(response2.data.visitasnaorealizadas || []);
            }
          }
          if (
            data.user?.tipo_utilizador === "nivel4" ||
            data.user?.tipo_utilizador === "nivel5"
          ) {
            const response2 = await api.post(
              "/visita/getvisitasnaorealizadaslvl4",
              {
                empresa_id: data.user.funcionario.empresa_id,
              }
            );

            if (response2.status === 200) {
              setVisitas(response2.data.visitasnaorealizadas || []);
              console.log("visitas", response2.data.visitasnaorealizadas);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, [
    data.user?.funcionario?.empresa_id,
    data.user?.funcionario?.departamento_id,
  ]);

  const { Logout } = useAuth() as {
    Logout: () => void;
  };

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user]);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    Logout();
    console.log("Logout");
  };

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  return (
    <Navbar
      placeholder={""}
      className="md:max-w-full"
      style={{ backgroundColor: "#1F2A37", borderRadius: "0px" }}
    >
      <div className="flex items-center justify-between text-white">
        <Typography
          placeholder=""
          as="a"
          href="#"
          variant="h6"
          className="mr-4 cursor-pointer py-1.5 lg:ml-2"
        ></Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <div className="hidden gap-2 xl:flex lg:flex relative">
          {(data?.user?.tipo_utilizador === "nivel4" ||
            data?.user?.tipo_utilizador === "nivel5") && <NavListMenu6 />}
          <Button
            onClick={handleSubmit}
            placeholder=""
            variant="text"
            size="sm"
            color="white"
          >
            Logout
          </Button>
        </div>

        <IconButton
          placeholder=""
          variant="text"
          color="white"
          className="lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList />
        <div className="flex w-full flex-nowrap items-center gap-2 lg:hidden">
          <Button
            placeholder=""
            variant="outlined"
            size="sm"
            color="white"
            onClick={handleSubmit}
            style={{ backgroundColor: "#000000" }}
            fullWidth
          >
            Logout
          </Button>
        </div>
      </Collapse>
    </Navbar>
  );
}
function setIsLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}
