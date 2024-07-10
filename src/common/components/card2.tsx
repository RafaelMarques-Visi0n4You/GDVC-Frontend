import {
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

import { UserCircleIcon } from "@heroicons/react/24/outline";

export function SimpleCard2() {
  return (
    <Card className="mt-6 w-3/5 sm:w-full" style={{ height: "560px" }}>
      <CardBody>
        <Typography color="blue-gray" className="mb-2">
          Equipa:
        </Typography>
        <div
          className="grid grid-flow-col h-20"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <UserCircleIcon
            className="h-14 w-14 mt-3 ml-2"
            style={{ color: "black" }}
          />
          <p className="mt-4 mr-80">
            Funcionário1<br></br>
            <span className="text-gray-500">Cargo</span>
          </p>
        </div>
        <div
          className="grid grid-flow-col h-20 mt-2"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <UserCircleIcon
            className="h-14 w-14 mt-3 ml-2"
            style={{ color: "black" }}
          />
          <p className="mt-4 mr-80">
            Funcionário2<br></br>
            <span className="text-gray-500">Cargo</span>
          </p>
        </div>
        <div
          className="grid grid-flow-col h-20 mt-2"
          style={{ backgroundColor: "#F9FAFB" }}
        >
          <UserCircleIcon
            className="h-14 w-14 mt-3 ml-2"
            style={{ color: "black" }}
          />
          <p className="mt-4 mr-80">
            Funcionário3<br></br>
            <span className="text-gray-500">Cargo</span>
          </p>
        </div>
        <br></br>
        <Typography color="blue-gray" className="mt-2">
          Cliente:
          <div
            className="grid grid-flow-row h-36 p-2 gap-4"
            style={{ backgroundColor: "#F9FAFB" }}
          >
            <p>
              Nome Cliente: <span className="text-gray-500">José Cabral</span>
            </p>
            <p>
              Contacto: <span className="text-gray-500">961234567</span>
            </p>
            <p>
              Email: <span className="text-gray-500">cliente@exemplo.com</span>
            </p>
          </div>
        </Typography>
      </CardBody>
      <CardFooter className="pt-0"></CardFooter>
    </Card>
  );
}
