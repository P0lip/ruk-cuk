declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getPet: (params: GetPetParams) => Promise<GetPetResponse>;
    };
  };
  type Events = never;
  type GetPetParams = PetIdParam;
  type GetPetResponse = PetSchema;
  type PetIdParam = {
    pet_id: string;
  };
  type NotFoundResponse = {
    message?: string;
  };
  type PetSchema = {
    id?: number;
    /**
     * @defaultValue `"Dog"`
     */
    kind?: "Dog" | "Cat";
    /**
     * @deprecated
     */
    species?: string;
    /**
     * @defaultValue `0`
     */
    population?: number;
    /**
     * @defaultValue `["Europe","Asia","Africa"]`
     */
    continents?: string[];
    /**
     * This is a custom property used internally
     * @deprecated
     * @internal
     */
    "x-foo"?: string;
  };
  /**
   * The requested resource was not found
   */
  type NotFoundErrorResponse = NotFoundResponse;
}
