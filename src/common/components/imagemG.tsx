import { Button, Dialog } from "@material-tailwind/react";

export default function ImagemModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <br></br>
      <div className="flex justify-center">Descrição anomalia:</div>
      <br></br>
      <div className="flex justify-center">
        <Button onClick={handleClose}>Fechar</Button>
      </div>
      <br></br>
    </Dialog>
  );
}
