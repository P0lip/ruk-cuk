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
}
