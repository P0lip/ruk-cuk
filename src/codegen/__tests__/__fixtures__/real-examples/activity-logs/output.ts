declare namespace Activity {
  type Actions = {
    "v1.activity": {
      byWorkspace: (params: ByWorkspaceParams) => Promise<ByWorkspaceResponse>;
      hasuraEventHandler: (params: HasuraEventHandlerParams) => Promise<void>;
    };
  };
  type Events = never;
  type ByWorkspaceParams = {
    workspace_id: string;
    before?: string;
    after?: string;

    /**
     * @defaultValue `50`
     */
    limit?: number;
    type?: ActivityType[];
    group?: string;
  };
  type ByWorkspaceResponse = Activity[];
  type HasuraEventHandlerParams = {
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
  };
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
  type BadRequestError = Error | Record<string, unknown>;
  type NotFoundError = Error;
  type UnauthorizedError = Error;
  type PaymentRequired = Error;
  type ForbiddenError = Error;
  type InternalServerError = Error;
}
