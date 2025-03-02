import type * as RukCukTypeHelpers from "ruk-cuk/helpers.d.ts";
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
    size: RukCukTypeHelpers.QueryParam<"s" | "m" | "l">;
    kind?: RukCukTypeHelpers.QueryParam<string>;
  };
  type GetStateParams = PetId & {
    size: RukCukTypeHelpers.QueryParam<"s" | "m" | "l">;
    kind?: RukCukTypeHelpers.QueryParam<string>;
    "X-Request-ID"?: RukCukTypeHelpers.QueryParam<unknown>;
  };
  type UpdateStateParams = PetId;
  type PetId = {
    pet_id: RukCukTypeHelpers.PathParam<string>;
  };
}
