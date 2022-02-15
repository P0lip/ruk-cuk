declare namespace Pets {
  type Actions = {
    "v1.petstore": {
      getPets: () => Promise<GetPetsResponse>;
    };
  };
  type Events = never;
  type GetPetsResponse = {
    id?: number;
    format?: "json";
    kind?: "Dog" | "Cat";
    [k: string]: unknown;
  }[] | {
    id?: number;
    format?: "yaml";
    kind?: "Dog" | "Cat";
    [k: string]: unknown;
  }[];
}
