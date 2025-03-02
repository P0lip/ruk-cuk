import type * as RukCukTypeHelpers from "ruk-cuk/helpers.d.ts";
declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      createPet: (params: CreatePetParams) => Promise<void>;
    };
  };
  type Events = never;
  type CreatePetParams = Pet;
  type Pet = RukCukTypeHelpers.RequestBody<{
    id?: number;
    kind?: "Dog" | "Cat";
  }>;
}
