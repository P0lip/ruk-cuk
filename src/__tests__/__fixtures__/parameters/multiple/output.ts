declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getState: (params: GetStateParams) => Promise<void>;
      updateState: (params: UpdateStateParams) => Promise<void>;
    };
  };
  type Events = never;
  type GetStateParams = PetId & {
    size: "s" | "m" | "l";
    kind?: string;
  };
  type UpdateStateParams = PetId;
  type PetId = {
    pet_id: string;
  };
}
