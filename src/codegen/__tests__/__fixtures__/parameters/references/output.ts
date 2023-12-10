declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      createPet: (params: CreatePetParams) => Promise<void>;
      getState: (params: GetStateParams) => Promise<void>;
      updateState: (params: UpdateStateParams) => Promise<void>;
    };
  };
  type Events = never;
  type CreatePetParams = Pick<GetStateParams, "size" | "kind">;
  type GetStateParams = PetId & {
    size: "s" | "m" | "l";
    kind?: string;
    "X-Request-ID"?: unknown;
  };
  type UpdateStateParams = PetId;
  type PetId = {
    pet_id: string;
  };
}
