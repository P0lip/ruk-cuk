import type * as RukCukTypeHelpers from "ruk-cuk/helpers.d.ts";
declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getState: (params: GetStateParams) => Promise<void>;
      updateState: (params: UpdateStateParams) => Promise<void>;
    };
  };
  type Events = never;
  type GetStateParams = PetId;
  type UpdateStateParams = PetId;
  type PetId = {
    pet_id: RukCukTypeHelpers.PathParam<string>;
  };
}
