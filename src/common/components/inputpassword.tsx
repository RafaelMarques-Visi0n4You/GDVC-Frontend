import { Input } from "@material-tailwind/react";

export function InputPassword({ value, onChange }: any) {
  return (
    <div className="grid gap-3 w-10">
      <Input
        style={{ backgroundColor: "#FFFFFF" }}
        crossOrigin=""
        type="password"
        variant="outlined"
        label="Password"
        placeholder="Password"
        id="password"
        name="password" // Adicione o atributo name aqui
        value={value} // Passe o valor como propriedade
        onChange={onChange} // Passe a função de mudança como propriedade
      />
    </div>
  );
}
