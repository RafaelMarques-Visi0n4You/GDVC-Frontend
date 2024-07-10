import {
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import Link from "next/link";

export function SimpleCard3() {
  return (
    <Card className="mt-6 w-3/5 sm:w-full" style={{ height: "490px" }}>
      <CardBody className="mt-2">
        <Typography color="blue-gray" className="mb-2">
          Contrato:
        </Typography>
        <Link href={"/home"} className="text-sm underline text-gray-400">
          Veja aqui o contrato associado!
        </Link>
        <hr className="mt-9"></hr>
        <br></br>

        <Typography color="blue-gray" className="mb-2">
          Tarefas:
        </Typography>
        <Link href={"#"} className="text-sm underline text-gray-400">
          Veja aqui as tarefas associadas!
        </Link>
        <hr className="mt-9"></hr>
        <br></br>
        <Typography color="blue-gray" className="mb-2">
          Notas:
        </Typography>
        <Link href={"#"} className="text-sm underline text-gray-400">
          Veja aqui as notas associadas!
        </Link>
        <hr className="mt-9"></hr>
        <br></br>
        <Typography color="blue-gray" className="mb-2">
          Anamolias:
        </Typography>
        <Link href={"#"} className="text-sm underline text-gray-400">
          Veja aqui as anomalias associadas!
        </Link>
        <br></br>
      </CardBody>
      <CardFooter className="pt-0"></CardFooter>
    </Card>
  );
}
