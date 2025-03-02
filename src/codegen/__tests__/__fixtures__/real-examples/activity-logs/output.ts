import type * as RukCukTypeHelpers from "ruk-cuk/helpers.d.ts";
declare namespace Activity {
  type Actions = {
    "v1.activity": {
      /**
       * List Workspace Activity
       */
      byWorkspace: (params: ByWorkspaceParams) => Promise<ByWorkspaceResponse>;
      /**
       * Hasura Activity Log Event Handler
       * @internal
       */
      hasuraEventHandler: (params: HasuraEventHandlerParams) => Promise<void>;
    };
  };
  type Events = never;
  type ByWorkspaceParams = {
    /**
     * Base64 encoded "wk:" + workspace ID
     */
    workspace_id: RukCukTypeHelpers.PathParam<string>;
    /**
     * Filter list before a specific created date. Useful for pagination.
     */
    before?: RukCukTypeHelpers.QueryParam<string>;
    /**
     * Filter list after a specific created date. Useful for pagination.
     */
    after?: RukCukTypeHelpers.QueryParam<string>;
    /**
     * Limit the size of the list returned
     * @defaultValue `50`
     */
    limit?: RukCukTypeHelpers.QueryParam<number>;
    /**
     * Filter to a specific activity types
     */
    type?: RukCukTypeHelpers.QueryParam<ActivityType[]>;
    /**
     * Filter to a specific group ID
     */
    group?: RukCukTypeHelpers.QueryParam<string>;
  };
  type ByWorkspaceResponse = Activity[];
  type HasuraEventHandlerParams = RukCukTypeHelpers.RequestBody<{
    event: {
      session_variables: Record<string, unknown> | null;
      op: "INSERT" | "UPDATE" | "DELETE" | "MANUAL";
      data: {
        old: Record<string, unknown> | null;
        new: Record<string, unknown> | null;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    created_at: string;
    id: string;
    trigger: {
      name: string;
      [k: string]: unknown;
    };
    table: {
      schema: string;
      name: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }>;
  type Activity = {
    id: string;
    type: ActivityType;
    /**
     * Additional information specific to the activity type
     */
    metadata: Record<string, unknown>;
    /**
     * Timestamp when the activity was performed
     */
    created_at: string;
    /**
     * IP address of client where the activity was performed
     */
    ip_address: string | null;
    /**
     * User who performed the activity
     */
    actor: {
      name: string;
      email: string;
      [k: string]: unknown;
    } | null;
    [k: string]: unknown;
  };
  /**
   * Represents generic error
   */
  type Error = {
    /**
     * Detailed error message
     */
    message: string;
    /**
     * HTTP Status Code
     */
    code: 400 | 401 | 403 | 404 | 409 | 500;
    /**
     * Error type
     */
    type?: string;
    [k: string]: unknown;
  };
  type ActivityType = "create" | "move" | "read" | "delete" | "update";
  /**
   * The server could not understand the request due to invalid syntax.
   */
  type BadRequestError = Error | Record<string, unknown>;
  /**
   * The server can not find the requested resource.
   */
  type NotFoundError = Error;
  /**
   * The client must authenticate itself to get the requested response.
   */
  type UnauthorizedError = Error;
  /**
   * The client must be on the correct billing plan to access the content.
   */
  type PaymentRequired = Error;
  /**
   * The client does not have permissions to access the content.
   */
  type ForbiddenError = Error;
  /**
   * The server has encountered a situation it doesn't know how to handle.
   */
  type InternalServerError = Error;
}
