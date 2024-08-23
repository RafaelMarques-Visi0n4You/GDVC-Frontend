import { Button, Dialog } from "@material-tailwind/react";

export default function ImagemModal({
  open,
  setOpen,
  descricao,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  descricao: string;
}) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <br></br>
      <div className="flex justify-center">Descrição anomalia:{descricao}</div>
      <br></br>
      <div className="flex justify-center">
        <Button onClick={handleClose}>Fechar</Button>
      </div>
      <br></br>
    </Dialog>
  );
}
