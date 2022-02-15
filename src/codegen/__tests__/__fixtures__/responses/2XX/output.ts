declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getPet: () => Promise<GetPetResponse>;
    };
  };
  type Events = never;
  type GetPetResponse = Pet;
  type Pet = {
    id?: number;
    kind?: "Dog" | "Cat";
  };
}
