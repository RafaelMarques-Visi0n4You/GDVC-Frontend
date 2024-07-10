import {
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

import { CalendarIcon, ClockIcon, HomeIcon } from "@heroicons/react/24/outline";

export function SimpleCard() {
  return (
    <Card className="mt-6 w-3/5 sm:w-full">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Nome do serviço
        </Typography>
        <Typography className="mt-5">
          Descrição:{" "}
          <span className="text-sm text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          </span>
        </Typography>
        <br></br>
        <br></br>
        <div className="grid grid-cols-7">
          <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-36 h-8">
            <CalendarIcon className="h-6 w-6 ml-2" />
            <span className="text-sm mt-1 ml-4 text-gray-400">12-09-2024</span>
          </div>
          <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-36  h-8">
            <ClockIcon className="h-6 w-6 ml-2" />
            <span className="text-sm mt-1 ml-4 text-gray-400">
              12:00 - 12-45
            </span>
          </div>
          <div className=" grid grid-flow-col justify-start rounded-xl border-2 w-72">
            <HomeIcon className="h-6 w-6 ml-2" />
            <span className="text-sm mt-1 ml-4 text-gray-400">
              Rua dos Santos, 3111-57, Lisboa
            </span>
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0"></CardFooter>
    </Card>
  );
}
