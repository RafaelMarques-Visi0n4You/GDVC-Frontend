import { FlagIcon } from "@heroicons/react/24/solid";
import { Button, Typography } from "@material-tailwind/react";
import router from "next/router";

export default function ErrorSection7() {
  function redirecthome() {
    router.push("/home");
  }

  return (
    <div className="h-screen mx-auto grid place-items-center text-center px-8">
      <div>
        <FlagIcon className="w-20 h-20 mx-auto" />
        <Typography
          variant="h1"
          color="blue-gray"
          className="mt-10 !text-3xl !leading-snug md:!text-4xl"
        >
          Error 404 <br /> It looks like something went wrong.
        </Typography>
        <Typography className="mt-8 mb-14 text-[18px] font-normal text-gray-500 mx-auto md:max-w-sm">
          Oops, looks like you don't have permission to access this page.
        </Typography>
        <Button
          onClick={redirecthome}
          color="gray"
          className="w-full px-4 md:w-[8rem]"
        >
          Back home
        </Button>
      </div>
    </div>
  );
}
