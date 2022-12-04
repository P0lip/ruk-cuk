declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getPets: () => Promise<GetPetsResponse>;
    };
  };
  type Events = never;
  type GetPetsResponse = Pets | ("OK");
  type Pets = {
    id?: number;
    kind?: "Dog" | "Cat";
    [k: string]: unknown;
  }[];
}
