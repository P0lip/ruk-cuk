declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      createPet: () => Promise<CreatePetResponse>;
      getPets: () => Promise<GetPetsResponse>;
    };
  };
  type Events = never;
  type CreatePetResponse = GetPetsResponse;
  type GetPetsResponse = {
    id?: number;
    kind?: "Dog" | "Cat";
    [k: string]: unknown;
  }[];
}
