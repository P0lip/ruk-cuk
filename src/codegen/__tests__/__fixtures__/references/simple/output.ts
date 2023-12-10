declare namespace Random {
  type Actions = {
    "v1.random": {
      /**
       * List Random
       */
      list: (params: ListParams) => Promise<ListResponse>;
      create: (params: CreateParams) => Promise<void>;
    };
  };
  type Events = never;
  type ListParams = {
    /**
     * Limit the size of the list returned
     * @defaultValue `50`
     */
    limit?: number;

    /**
     * Filter to a specific random
     */
    type?: Externals.Shared.Random[];
  };
  type ListResponse = Externals.Shared.RandomResponse;
  type CreateParams = Externals.Shared.RandomBody;
  namespace Externals {
    namespace Shared {
      type Random = {
        id?: number;
        value?: string;
        [k: string]: unknown;
      };

      /**
       * Shared response
       */
      type RandomResponse = Random;
      type RandomBody = Random;
    }
  }
}
