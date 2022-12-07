declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      createPet: (params: CreatePetParams) => Promise<void>;
      getState: (params: GetStateParams) => Promise<void>;
      updateState: (params: UpdateStateParams) => Promise<void>;
    };
  };
  type Events = never;
  type CreatePetParams = {
    size: "s" | "m" | "l";
    kind?: string;
  };
  type GetStateParams = PetId & {
    size: "s" | "m" | "l";
    kind?: string;
  };
  type UpdateStateParams = PetId;
  type PetId = {
    pet_id: string;
  };
}
