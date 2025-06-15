"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var oas_1 = __importDefault(require("oas"));
var core_1 = __importDefault(require("api/dist/core"));
var openapi_json_1 = __importDefault(require("./openapi.json"));
var SDK = /** @class */ (function () {
    function SDK() {
        this.spec = oas_1.default.init(openapi_json_1.default);
        this.core = new core_1.default(this.spec, 'yakoa-ip-api/0.0.1 (api/6.1.3)');
    }
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    SDK.prototype.config = function (config) {
        this.core.setConfig(config);
    };
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    SDK.prototype.auth = function () {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        (_a = this.core).setAuth.apply(_a, values);
        return this;
    };
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    SDK.prototype.server = function (url, variables) {
        if (variables === void 0) { variables = {}; }
        this.core.setServer(url, variables);
    };
    /**
     * ### Retrieves comprehensive details for a specific Token.
     *
     * This endpoint fetches all stored information for a Token, identified by its unique
     * `token_id` (which includes the `chain` and `contract_address`).
     * The response includes:
     * -   The Token's `id` (contract address and on-chain token ID).
     * -   `registration_tx`: Details of the transaction that registered or last updated this
     * Token.
     * -   `creator_id`: The identifier of the Creator associated with this Token.
     * -   `metadata`: The metadata object provided during registration.
     * -   `media`: An array of media items linked to this Token, including their `media_id`,
     * `url`, `hash`, and `fetch_status`.
     * -   `license_parents`: Information about any parent Tokens from which this Token might
     * inherit rights.
     * -   `token_authorizations`: A list of authorizations granted directly to this Token by
     * Brands.
     * -   `infringements`: The latest infringement check results for this Token. (See
     * [Infringements & Credits](../../docs/INFRINGEMENTS_AND_CREDITS.md) for details).
     *
     * **Path Parameters:**
     * -   `token_id` (string, required): The unique identifier of the Token, typically in the
     * format `contract_address:token_id` or just `contract_address` for ERC721 tokens where
     * the on-chain token ID is part of the path.
     * -   `network` (string, required, from parent router): The blockchain network the Token
     * is associated with.
     *
     * @summary Get Token
     * @throws FetchError<400, types.TokenTokenIdTokenGetResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenIdTokenGet = function (metadata) {
        return this.core.fetch('/token/{token_id}', 'get', metadata);
    };
    /**
     * ### Registers a new Token or registers new metadata for an existing Token.
     *
     * This is the primary endpoint for introducing Token data into the Yakoa IP system or
     * modifying it.
     * When you `POST` data to this endpoint:
     * 1.  The system checks if a Token with the given `id` (contract address and on-chain
     * token ID, on the specified `chain`) already exists.
     * 2.  **If new:** The Token is registered with all provided details:
     *     -   `registration_tx`: Transaction details of its creation/minting.
     *     -   `creator_id`: The associated Creator.
     *     -   `metadata`: Its descriptive metadata.
     *     -   `media`: A list of its associated media files (images, videos, etc.).
     *     -   `license_parents` (optional): Any parent tokens it derives rights from.
     *     -   `authorizations` (optional): Any pre-existing direct authorizations for this
     * Token.
     * 3.  **If existing:** The Token's information is updated.
     *     -   The system compares the `block_number` of the provided `registration_tx` with
     * the existing one.
     *     -   If the new `registration_tx` is more recent (higher block number), the Token's
     * record (including media, metadata etc.) is updated with the new data.
     *     -   If the existing `registration_tx` is more recent or the same, the existing core
     * data is preserved
     * 4.  **Infringement Check:** After registration or update, an IP infringement check is
     * initiated for the Token's media. The results can be retrieved by subsequent calls to the
     * Token `GET` endpoint.
     *
     * **Key Request Body Fields:**
     * -   `id` (string, required): Token identifier (e.g., `contract_address:token_id`).
     * -   `registration_tx` (object, required): Transaction details.
     * -   `creator_id` (string, required): Creator's identifier.
     * -   `metadata` (object, required): Token metadata.
     * -   `media` (array of objects, required): Media items associated with the Token. Each
     * must have `media_id` and `url`. If the media is coming from a non-proveable location, it
     * must include a hash to ensure the content that Yakoa fetches and processes matches that
     * expected by the platform. If the content fetched by Yakoa does not match the expected
     * hash, the media will get a `hash_mismatch` status and no infringement checks will be
     * run. If the media comes from a proveable location (e.g., IPFS), the hash is not
     * required.
     * Media can optionally include a `trust_reason`.
     * -   `license_parents` (array, optional): Parent license information.
     * -   `authorizations` (array, optional): Direct brand authorizations for this token.
     *
     * **Use Cases:**
     * -   Registering a newly minted NFT on a marketplace.
     * -   Updating a Token's metadata or media if it changes on-chain or in its source.
     * -   Adding new brand authorizations directly to a Token.
     *
     * **Important Notes:**
     * -   Media URLs must be publicly accessible.
     * -   If an existing token is updated with a registration_tx that is older than the stored
     * one, the response will be a 200 OK with the existing token data, rather than a 201
     * Created.
     *
     * @summary Register Token
     * @throws FetchError<400, types.TokenTokenPostResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenPost = function (body, metadata) {
        return this.core.fetch('/token', 'post', body, metadata);
    };
    /**
     * ### Retrieves details of a specific Brand Authorization for a Token.
     *
     * This endpoint fetches the authorization record that permits a specific Token to use
     * content associated with a particular Brand.
     *
     * **Use Cases:**
     * -   Verifying if a specific Token is authorized by a Brand before taking action (e.g.,
     * during an infringement review).
     * -   Displaying authorization details in a user interface.
     * -   Auditing permissions granted to a Token.
     *
     * **Path Parameters:**
     * -   `token_id` (string, required, from parent router): The unique identifier of the
     * Token.
     * -   `network` (string, required, from parent router): The blockchain network.
     * -   `brand_id` (string, required): The unique identifier of the Brand for which
     * authorization details are being requested for this Token.
     *
     * @summary Get Token Brand Authorization
     * @throws FetchError<400, types.TokenTokenIdAuthorizationBrandIdAuthorizationGetResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenIdAuthorizationBrandIdAuthorizationGet = function (metadata) {
        return this.core.fetch('/token/{token_id}/authorization/{brand_id}', 'get', metadata);
    };
    /**
     * ### Deletes an existing Brand Authorization for a specific Token.
     *
     * This action revokes a previously granted permission for a Token to use content
     * associated with a specific Brand.
     *
     * **Use Cases:**
     * -   A Brand revokes permission for a specific Token due to a change in licensing terms.
     * -   An erroneous authorization needs to be removed.
     *
     * **Path Parameters:**
     * -   `token_id` (string, required, from parent router): The unique identifier of the
     * Token.
     * -   `network` (string, required, from parent router): The blockchain network.
     * -   `brand_id` (string, required): The unique identifier of the Brand whose
     * authorization is being deleted for this Token.
     *
     * **Responses:**
     * -   `204 No Content`: Successfully deleted the authorization (or it didn't exist).
     *
     * @summary Delete Token Brand Authorization
     * @throws FetchError<400, types.TokenTokenIdAuthorizationBrandIdAuthorizationDeleteResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenIdAuthorizationBrandIdAuthorizationDelete = function (metadata) {
        return this.core.fetch('/token/{token_id}/authorization/{brand_id}', 'delete', metadata);
    };
    /**
     * ### Creates or updates a Brand Authorization for a specific Token.
     *
     * {user.email}
     *
     * This endpoint establishes or modifies a record indicating that a specific Token has
     * explicit permission from a Brand to use its intellectual property.
     * If an authorization for this Token and Brand already exists, its `data` field is
     * updated. Otherwise, a new authorization record is created.
     *
     * **Use Cases:**
     * -   A Brand explicitly approves a specific Token (e.g., a piece of user-generated
     * content using their IP).
     * -   Marking a Token as a "false positive" after an infringement check, thereby
     * authorizing it.
     * -   Updating the details or evidence of an existing authorization for a Token.
     *
     * **Path Parameters:**
     * -   `token_id` (string, required, from parent router): The unique identifier of the
     * Token receiving the authorization.
     * -   `network` (string, required, from parent router): The blockchain network.
     *
     * **Request Body:**
     * -   `brand_id` (string, optional): The unique identifier of the Brand granting the
     * authorization.
     * -   `brand_name` (string, optional): The name of the Brand. (Either `brand_id` or
     * `brand_name` must be provided).
     * -   `data` (object, required): An object containing details about the authorization. The
     * structure of this object can vary. Common fields include:
     *     -   `type` (string): The type of authorization (e.g., "email", "false_positive").
     *     -   Other fields relevant to the `type` (e.g., `email_address` for "email", `reason`
     * for "false_positive").
     *
     * @summary Create or Update Token Brand Authorization
     * @throws FetchError<400, types.TokenTokenIdAuthorizationAuthorizationPostResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenIdAuthorizationAuthorizationPost = function (body, metadata) {
        return this.core.fetch('/token/{token_id}/authorization', 'post', body, metadata);
    };
    /**
     * Retrieves a specific media item associated with a token.
     *
     * The media item is identified by its `media_id` and belongs to the token specified by
     * `token_id` in the path.
     * This endpoint returns the details of the media, including its URL, hash (if available),
     * and trust reason.
     *
     * @summary Get Token Media
     * @throws FetchError<400, types.TokenTokenIdMediaMediaIdMediaGetResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenIdMediaMediaIdMediaGet = function (metadata) {
        return this.core.fetch('/token/{token_id}/media/{media_id}', 'get', metadata);
    };
    /**
     * Updates attributes of a specific media item associated with a token.
     *
     * Allows for partial updates to a media item's properties, such as its `trust_reason`.
     * The media item is identified by its `media_id` and belongs to the token specified by
     * `token_id` in the path.
     * The request body should contain the fields to be updated.
     *
     * @summary Update Token Media
     * @throws FetchError<400, types.TokenTokenIdMediaMediaIdMediaPatchResponse400> Bad request syntax or unsupported method
     */
    SDK.prototype.tokenTokenIdMediaMediaIdMediaPatch = function (body, metadata) {
        return this.core.fetch('/token/{token_id}/media/{media_id}', 'patch', body, metadata);
    };
    return SDK;
}());
var createSDK = (function () { return new SDK(); })();
module.exports = createSDK;
