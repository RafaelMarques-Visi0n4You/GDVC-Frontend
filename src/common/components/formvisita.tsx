import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Input, Textarea, Typography } from "@material-tailwind/react";
import { TimePicker } from "antd";
import CalendarInput from "../components/calendarinput";
import DynamicForm from "../components/tarefainput";
import { ButtonVariants2 } from "./buttoncreate";
import { ButtonVariants3 } from "./buttonreject";

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
  }[];
}

export function SimpleRegistrationForm() {
  return (
    <div className="flex-col p-6">
      <Typography
        className="flex justify-center"
        variant="h4"
        color="blue-gray"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        Agendar Visita
      </Typography>

      <form className="py-10 sm:w-94">
        <h1>Nome do cliente</h1>
        <div className="w-50 ">
          <Input
            label="Nome Cliente"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
          />
        </div>
        <br />
        <div className="flex flex-row gap-20">
          <div className="w-1/2">
            <h1>Serviço</h1>
            <Input
              label="Serviço"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
          <div className="w-1/2">
            <h1>Equipa</h1>
            <Input
              label="Equipa"
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
            />
          </div>
        </div>
        <br />
        <div className="flex flex-row ml-16" style={{ gap: "812px" }}>
          <h1>Hora visita</h1>
          <h1>Data visita</h1>
        </div>
        <div className="flex flex-row gap-8">
          <ClockIcon className="h-8 w-8 text-black" />
          <TimePicker />
          <TimePicker />
          <CalendarInput />
          <CalendarIcon className="h-8 w-8 mt-1 text-black" />
        </div>
        <br />
        <div className="flex flex-row ml-1" style={{ gap: "830px" }}>
          <h1>Notas adicionais</h1>
          <h1>Tarefas</h1>
        </div>
        <div className="flex flex-row mr-6">
          <Textarea
            label="Notas adicionais"
            className="w-1/2"
            style={{ minHeight: "200px", maxWidth: "860px" }}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          />

          <DynamicForm />
        </div>
        <div className="flex flex-row justify-center gap-24 mt-28">
          <ButtonVariants2>Agendar</ButtonVariants2>
          <ButtonVariants3>Cancelar</ButtonVariants3>
        </div>
      </form>
    </div>
  );
}
