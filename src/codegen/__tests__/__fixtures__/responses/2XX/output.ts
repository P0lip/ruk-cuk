declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getCat: () => Promise<GetCatResponse>;
      getPet: () => Promise<GetPetResponse>;
    };
  };
  type Events = never;
  type GetCatResponse = Pet;
  type GetPetResponse = Pet;
  type Pet = {
    id?: number;
    kind?: "Dog" | "Cat";
  };
}
