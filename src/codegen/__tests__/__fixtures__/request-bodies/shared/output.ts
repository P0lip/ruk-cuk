declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      createPet: (params: CreatePetParams) => Promise<void>;
    };
  };
  type Events = never;
  type CreatePetParams = Pet;
  type Pet = {
    id?: number;
    kind?: "Dog" | "Cat";
  };
}
