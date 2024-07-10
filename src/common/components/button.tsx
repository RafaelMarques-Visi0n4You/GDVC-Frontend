import { Button } from "@material-tailwind/react";

/*
export function ButtonVariants() {
  return (
    <div className="flex w-max gap-4">
      <Button placeholder={"Login"} variant="filled">
        Login
      </Button>
    </div>
  );
}
*/

export function ButtonVariants({ children, onClick }: any) {
  return (
    <div className="grid gap-4 mt-4">
      <Button
        onClick={onClick}
        placeholder={"Login"}
        variant="filled"
        style={{ width: "200px", backgroundColor: "#0F124C" }}
      >
        {children}
      </Button>
    </div>
  );
}
