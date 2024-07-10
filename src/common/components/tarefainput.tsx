import { Button, Input } from "@material-tailwind/react";
import { ChangeEvent, useState } from "react";

export default function AddDynamicInputFields() {
  const [inputs, setInputs] = useState([{ tarefa: "" }]);

  const handleAddInput = () => {
    setInputs([...inputs, { tarefa: "" }]);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = event.target;
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [name]: value };
    setInputs(newInputs);
  };

  const handleDeleteInput = (index: any) => {
    const newArray = [...inputs];
    newArray.splice(index, 1);
    setInputs(newArray);
  };

  return (
    <div className="container p-1">
      {inputs.map((item, index) => (
        <div
          className="input_container"
          key={index}
          style={{ marginBottom: "10px" }}
        >
          <div className="flex gap-3 sm:w-7/8">
            <Input
              name="tarefa" // Nome único para cada input
              type="text"
              label="Tarefa"
              value={item.tarefa}
              onChange={(event) => handleChange(event, index)}
            />
            {inputs.length > 1 && (
              <Button
                style={{ color: "white", backgroundColor: "red" }}
                onClick={() => handleDeleteInput(index)}
              >
                Delete
              </Button>
            )}
            {index === inputs.length - 1 && (
              <Button
                style={{ color: "white", backgroundColor: "green" }}
                onClick={() => handleAddInput()}
              >
                Add
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
