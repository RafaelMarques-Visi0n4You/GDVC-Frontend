import { Input } from "@material-tailwind/react";

export function InputEmail({ value, onChange }: any) {
  return (
    <div className="flex mr-50 gap-3 w-10">
      <Input
        style={{ backgroundColor: "#FFFFFF" }}
        crossOrigin=""
        type="email"
        variant="outlined"
        label="Email"
        placeholder="Email"
        id="email"
        name="email" // Adicione o atributo name aqui
        value={value} // Passe o valor como propriedade
        onChange={onChange} // Passe a função de mudança como propriedade
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      />
    </div>
  );
}
