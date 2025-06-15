declare const TokenTokenIdAuthorizationAuthorizationPost: {
    readonly body: {
        readonly properties: {
            readonly brand_id: {
                readonly oneOf: readonly [{
                    readonly type: "string";
                    readonly format: "uuid";
                }, {
                    readonly type: "null";
                }];
            };
            readonly brand_name: {
                readonly oneOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "null";
                }];
                readonly examples: readonly ["My Brand"];
            };
            readonly data: {
                readonly oneOf: readonly [{
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly const: "email";
                            readonly default: "email";
                        };
                        readonly email_address: {
                            readonly type: "string";
                            readonly format: "email";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["email_address"];
                    readonly title: "EmailAuthorization";
                }, {
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly const: "false_positive";
                            readonly default: "false_positive";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly [];
                    readonly title: "FalsePositive";
                }];
            };
        };
        readonly type: "object";
        readonly required: readonly ["data"];
        readonly title: "AuthorizationPostData";
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly token_id: {
                    readonly type: "string";
                    readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                    readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly ["token_id"];
        }];
    };
    readonly response: {
        readonly "201": {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const TokenTokenIdAuthorizationBrandIdAuthorizationDelete: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly token_id: {
                    readonly type: "string";
                    readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                    readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
                readonly brand_id: {
                    readonly properties: {
                        readonly root: {
                            readonly type: "string";
                            readonly format: "uuid";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["root"];
                    readonly title: "RootModel[Annotated[UUID, PlainSerializer, PlainValidator]]";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly ["token_id", "brand_id"];
        }];
    };
    readonly response: {
        readonly "204": {
            readonly type: "object";
            readonly properties: {};
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const TokenTokenIdAuthorizationBrandIdAuthorizationGet: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly token_id: {
                    readonly type: "string";
                    readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                    readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
                readonly brand_id: {
                    readonly properties: {
                        readonly root: {
                            readonly type: "string";
                            readonly format: "uuid";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["root"];
                    readonly title: "RootModel[Annotated[UUID, PlainSerializer, PlainValidator]]";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly ["token_id", "brand_id"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly brand_id: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly format: "uuid";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly brand_name: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly data: {
                    readonly oneOf: readonly [{
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                                readonly const: "email";
                                readonly default: "email";
                            };
                            readonly email_address: {
                                readonly type: "string";
                                readonly format: "email";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["email_address"];
                        readonly title: "EmailAuthorization";
                    }, {
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                                readonly const: "false_positive";
                                readonly default: "false_positive";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly [];
                        readonly title: "FalsePositive";
                    }];
                };
            };
            readonly type: "object";
            readonly required: readonly ["data"];
            readonly title: "Authorization";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const TokenTokenIdMediaMediaIdMediaGet: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly media_id: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
                readonly token_id: {
                    readonly type: "string";
                    readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                    readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly ["media_id", "token_id"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly media_id: {
                    readonly type: "string";
                };
                readonly url: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly format: "url";
                    }, {
                        readonly type: "string";
                    }, {
                        readonly type: "string";
                        readonly format: "url";
                    }];
                };
                readonly hash: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly trust_reason: {
                    readonly oneOf: readonly [{
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                                readonly const: "trusted_platform";
                                readonly default: "trusted_platform";
                            };
                            readonly platform_name: {
                                readonly type: "string";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["platform_name"];
                        readonly title: "TrustedPlatformTrustReason";
                    }, {
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                                readonly const: "no_licenses";
                                readonly default: "no_licenses";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly [];
                        readonly title: "NoLicensesTrustReason";
                    }, {
                        readonly type: "null";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly fetch_status: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly enum: readonly ["failed", "pending", "succeeded", "hash_mismatch", "trusted"];
                        readonly title: "FetchStatus";
                        readonly description: "`failed` `pending` `succeeded` `hash_mismatch` `trusted`";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly uri_id: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly format: "uuid";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
            readonly type: "object";
            readonly required: readonly ["media_id", "url"];
            readonly title: "Media";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const TokenTokenIdMediaMediaIdMediaPatch: {
    readonly body: {
        readonly properties: {
            readonly trust_reason: {
                readonly oneOf: readonly [{
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly const: "trusted_platform";
                            readonly default: "trusted_platform";
                        };
                        readonly platform_name: {
                            readonly type: "string";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["platform_name"];
                    readonly title: "TrustedPlatformTrustReason";
                }, {
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly const: "no_licenses";
                            readonly default: "no_licenses";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly [];
                    readonly title: "NoLicensesTrustReason";
                }, {
                    readonly type: "null";
                }];
            };
        };
        readonly type: "object";
        readonly required: readonly [];
        readonly title: "MediaPatchData";
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly token_id: {
                    readonly type: "string";
                    readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                    readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
                readonly media_id: {
                    readonly type: "string";
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly ["token_id", "media_id"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly media_id: {
                    readonly type: "string";
                };
                readonly url: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly format: "url";
                    }, {
                        readonly type: "string";
                    }, {
                        readonly type: "string";
                        readonly format: "url";
                    }];
                };
                readonly hash: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly trust_reason: {
                    readonly oneOf: readonly [{
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                                readonly const: "trusted_platform";
                                readonly default: "trusted_platform";
                            };
                            readonly platform_name: {
                                readonly type: "string";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["platform_name"];
                        readonly title: "TrustedPlatformTrustReason";
                    }, {
                        readonly properties: {
                            readonly type: {
                                readonly type: "string";
                                readonly const: "no_licenses";
                                readonly default: "no_licenses";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly [];
                        readonly title: "NoLicensesTrustReason";
                    }, {
                        readonly type: "null";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly fetch_status: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly enum: readonly ["failed", "pending", "succeeded", "hash_mismatch", "trusted"];
                        readonly title: "FetchStatus";
                        readonly description: "`failed` `pending` `succeeded` `hash_mismatch` `trusted`";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly uri_id: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly format: "uuid";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
            readonly type: "object";
            readonly required: readonly ["media_id", "url"];
            readonly title: "Media";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const TokenTokenIdTokenGet: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly token_id: {
                    readonly type: "string";
                    readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                    readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly ["token_id"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly id: {
                    readonly properties: {
                        readonly chain: {
                            readonly type: "string";
                        };
                        readonly contract_address: {
                            readonly type: "string";
                        };
                        readonly token_id: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "null";
                            }];
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["chain", "contract_address"];
                    readonly title: "TokenID";
                };
                readonly registration_tx: {
                    readonly properties: {
                        readonly hash: {
                            readonly type: "string";
                            readonly maxLength: 32;
                            readonly minLength: 32;
                            readonly contentEncoding: "utf-8";
                        };
                        readonly block_number: {
                            readonly type: "integer";
                        };
                        readonly timestamp: {
                            readonly type: "string";
                            readonly format: "date-time";
                        };
                        readonly chain: {
                            readonly type: "string";
                            readonly enum: readonly ["story-mainnet", "story-aeneid", "story-illiad", "story-odyssey"];
                            readonly title: "Chain";
                            readonly description: "`story-mainnet` `story-aeneid` `story-illiad` `story-odyssey`";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["block_number", "chain", "hash", "timestamp"];
                    readonly title: "Transaction";
                };
                readonly creator_id: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly metadata: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
                readonly license_parents: {
                    readonly items: {
                        readonly properties: {
                            readonly parent_token_id: {
                                readonly properties: {
                                    readonly chain: {
                                        readonly type: "string";
                                    };
                                    readonly contract_address: {
                                        readonly type: "string";
                                    };
                                    readonly token_id: {
                                        readonly oneOf: readonly [{
                                            readonly type: "string";
                                        }, {
                                            readonly type: "null";
                                        }];
                                    };
                                };
                                readonly type: "object";
                                readonly required: readonly ["chain", "contract_address"];
                                readonly title: "TokenID";
                            };
                            readonly license_id: {
                                readonly type: "string";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["license_id", "parent_token_id"];
                        readonly title: "ParentToken";
                    };
                    readonly type: "array";
                    readonly default: readonly [];
                };
                readonly token_authorizations: {
                    readonly items: {
                        readonly properties: {
                            readonly brand_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly brand_name: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly data: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "email";
                                            readonly default: "email";
                                        };
                                        readonly email_address: {
                                            readonly type: "string";
                                            readonly format: "email";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["email_address"];
                                    readonly title: "EmailAuthorization";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "false_positive";
                                            readonly default: "false_positive";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "FalsePositive";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["data"];
                        readonly title: "Authorization";
                    };
                    readonly type: "array";
                    readonly default: readonly [];
                };
                readonly creator_authorizations: {
                    readonly items: {
                        readonly properties: {
                            readonly brand_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly brand_name: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly data: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "email";
                                            readonly default: "email";
                                        };
                                        readonly email_address: {
                                            readonly type: "string";
                                            readonly format: "email";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["email_address"];
                                    readonly title: "EmailAuthorization";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "false_positive";
                                            readonly default: "false_positive";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "FalsePositive";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["data"];
                        readonly title: "Authorization";
                    };
                    readonly type: "array";
                    readonly default: readonly [];
                };
                readonly media: {
                    readonly items: {
                        readonly properties: {
                            readonly media_id: {
                                readonly type: "string";
                            };
                            readonly url: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "url";
                                }, {
                                    readonly type: "string";
                                }, {
                                    readonly type: "string";
                                    readonly format: "url";
                                }];
                            };
                            readonly hash: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly trust_reason: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "trusted_platform";
                                            readonly default: "trusted_platform";
                                        };
                                        readonly platform_name: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["platform_name"];
                                    readonly title: "TrustedPlatformTrustReason";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "no_licenses";
                                            readonly default: "no_licenses";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "NoLicensesTrustReason";
                                }, {
                                    readonly type: "null";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly fetch_status: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly enum: readonly ["failed", "pending", "succeeded", "hash_mismatch", "trusted"];
                                    readonly title: "FetchStatus";
                                    readonly description: "`failed` `pending` `succeeded` `hash_mismatch` `trusted`";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly uri_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["media_id", "url"];
                        readonly title: "Media";
                    };
                    readonly type: "array";
                };
                readonly infringements: {
                    readonly oneOf: readonly [{
                        readonly properties: {
                            readonly status: {
                                readonly type: "string";
                                readonly const: "pending";
                                readonly default: "pending";
                            };
                            readonly reasons: {
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["reasons"];
                        readonly title: "PendingTokenInfringements";
                    }, {
                        readonly properties: {
                            readonly status: {
                                readonly type: "string";
                                readonly const: "failed";
                                readonly default: "failed";
                            };
                            readonly reasons: {
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["reasons"];
                        readonly title: "FailedTokenInfringements";
                    }, {
                        readonly properties: {
                            readonly status: {
                                readonly type: "string";
                                readonly const: "succeeded";
                                readonly default: "succeeded";
                            };
                            readonly result: {
                                readonly type: "string";
                                readonly enum: readonly ["infringement", "authorized", "no_infringement", "not_checked"];
                                readonly title: "TokenInfringementsResult";
                                readonly description: "`infringement` `authorized` `no_infringement` `not_checked`";
                            };
                            readonly in_network_infringements: {
                                readonly items: {
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                        };
                                        readonly media: {
                                            readonly items: {
                                                readonly type: "string";
                                            };
                                            readonly type: "array";
                                        };
                                        readonly token: {
                                            readonly properties: {
                                                readonly chain: {
                                                    readonly type: "string";
                                                };
                                                readonly contract_address: {
                                                    readonly type: "string";
                                                };
                                                readonly token_id: {
                                                    readonly oneOf: readonly [{
                                                        readonly type: "string";
                                                    }, {
                                                        readonly type: "null";
                                                    }];
                                                };
                                            };
                                            readonly type: "object";
                                            readonly required: readonly ["chain", "contract_address"];
                                            readonly title: "TokenID";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["media", "status", "token"];
                                    readonly title: "InNetworkInfringements";
                                };
                                readonly type: "array";
                            };
                            readonly external_infringements: {
                                readonly items: {
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                        };
                                        readonly media: {
                                            readonly items: {
                                                readonly type: "string";
                                            };
                                            readonly type: "array";
                                        };
                                        readonly brand: {
                                            readonly type: "string";
                                        };
                                        readonly brand_id: {
                                            readonly type: "string";
                                            readonly format: "uuid";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["brand", "brand_id", "media", "status"];
                                    readonly title: "ExternalInfringements";
                                };
                                readonly type: "array";
                            };
                            readonly credits: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["credits", "external_infringements", "in_network_infringements", "result"];
                        readonly title: "SucceededTokenInfringements";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
            readonly type: "object";
            readonly required: readonly ["id", "media", "metadata", "registration_tx"];
            readonly title: "Token";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
declare const TokenTokenPost: {
    readonly body: {
        readonly properties: {
            readonly id: {
                readonly type: "string";
                readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
            };
            readonly registration_tx: {
                readonly properties: {
                    readonly hash: {
                        readonly type: "string";
                        readonly maxLength: 32;
                        readonly minLength: 32;
                        readonly contentEncoding: "utf-8";
                        readonly examples: readonly ["0x2473a96855e8625c5c4b643962a3905e029aaf9a55aefc882ad90bf623931570"];
                    };
                    readonly block_number: {
                        readonly type: "integer";
                        readonly examples: readonly [13435572];
                    };
                    readonly timestamp: {
                        readonly type: "string";
                        readonly format: "date-time";
                        readonly default: 0;
                        readonly examples: readonly ["2021-10-17T01:00:19Z"];
                    };
                };
                readonly type: "object";
                readonly required: readonly ["block_number", "hash"];
                readonly title: "TransactionPostData";
            };
            readonly creator_id: {
                readonly type: "string";
                readonly pattern: "^0x[a-f0-9]{40}$";
                readonly examples: readonly ["0x2b3ab8e7bb14988616359b78709538b10900ab7d"];
            };
            readonly metadata: {
                readonly type: "object";
                readonly additionalProperties: true;
            };
            readonly media: {
                readonly items: {
                    readonly properties: {
                        readonly media_id: {
                            readonly type: "string";
                            readonly examples: readonly ["ipfs_image"];
                        };
                        readonly url: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                                readonly format: "url";
                            }, {
                                readonly type: "string";
                            }, {
                                readonly type: "string";
                                readonly format: "url";
                            }];
                            readonly examples: readonly ["https://ipfs.io/ipfs/QmQTkvAKhrTCmSR24zQgDLUiUT6gqWqh9aZJDbX5yWgLMP"];
                        };
                        readonly hash: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "null";
                            }];
                            readonly examples: readonly ["a3f5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7g8h9i0j1k2l3m4n5"];
                        };
                        readonly trust_reason: {
                            readonly oneOf: readonly [{
                                readonly properties: {
                                    readonly type: {
                                        readonly type: "string";
                                        readonly const: "trusted_platform";
                                        readonly default: "trusted_platform";
                                    };
                                    readonly platform_name: {
                                        readonly type: "string";
                                    };
                                };
                                readonly type: "object";
                                readonly required: readonly ["platform_name"];
                                readonly title: "TrustedPlatformTrustReason";
                            }, {
                                readonly properties: {
                                    readonly type: {
                                        readonly type: "string";
                                        readonly const: "no_licenses";
                                        readonly default: "no_licenses";
                                    };
                                };
                                readonly type: "object";
                                readonly required: readonly [];
                                readonly title: "NoLicensesTrustReason";
                            }, {
                                readonly type: "null";
                            }];
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["media_id", "url"];
                    readonly title: "MediaPostRequest";
                };
                readonly type: "array";
            };
            readonly license_parents: {
                readonly oneOf: readonly [{
                    readonly items: {
                        readonly properties: {
                            readonly parent_id: {
                                readonly type: "string";
                                readonly pattern: "^0x[a-f0-9]{40}(:[0-9]+)?$";
                                readonly examples: readonly ["0x8a90cab2b38dba80c64b7734e58ee1db38b8992e"];
                            };
                            readonly license_id: {
                                readonly type: "string";
                                readonly pattern: "^0x[a-f0-9]{40}$";
                                readonly examples: readonly ["0x2b3ab8e7bb14988616359b78709538b10900ab7d"];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["license_id", "parent_id"];
                        readonly title: "LicensePostData";
                    };
                    readonly type: "array";
                }, {
                    readonly type: "null";
                }];
            };
            readonly authorizations: {
                readonly oneOf: readonly [{
                    readonly items: {
                        readonly properties: {
                            readonly brand_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly brand_name: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                                readonly examples: readonly ["My Brand"];
                            };
                            readonly data: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "email";
                                            readonly default: "email";
                                        };
                                        readonly email_address: {
                                            readonly type: "string";
                                            readonly format: "email";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["email_address"];
                                    readonly title: "EmailAuthorization";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "false_positive";
                                            readonly default: "false_positive";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "FalsePositive";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["data"];
                        readonly title: "AuthorizationPostData";
                    };
                    readonly type: "array";
                }, {
                    readonly type: "null";
                }];
            };
        };
        readonly type: "object";
        readonly required: readonly ["creator_id", "id", "media", "metadata", "registration_tx"];
        readonly title: "TokenPostData";
        readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
    };
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly other_data: {
                    readonly oneOf: readonly [{
                        readonly properties: {
                            readonly brand_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly brand_name: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                                readonly examples: readonly ["My Brand"];
                            };
                            readonly data: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "email";
                                            readonly default: "email";
                                        };
                                        readonly email_address: {
                                            readonly type: "string";
                                            readonly format: "email";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["email_address"];
                                    readonly title: "EmailAuthorization";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "false_positive";
                                            readonly default: "false_positive";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "FalsePositive";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["data"];
                        readonly title: "AuthorizationPostData";
                    }, {
                        readonly type: "null";
                    }];
                    readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "201": {
            readonly properties: {
                readonly id: {
                    readonly properties: {
                        readonly chain: {
                            readonly type: "string";
                        };
                        readonly contract_address: {
                            readonly type: "string";
                        };
                        readonly token_id: {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "null";
                            }];
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["chain", "contract_address"];
                    readonly title: "TokenID";
                };
                readonly registration_tx: {
                    readonly properties: {
                        readonly hash: {
                            readonly type: "string";
                            readonly maxLength: 32;
                            readonly minLength: 32;
                            readonly contentEncoding: "utf-8";
                        };
                        readonly block_number: {
                            readonly type: "integer";
                        };
                        readonly timestamp: {
                            readonly type: "string";
                            readonly format: "date-time";
                        };
                        readonly chain: {
                            readonly type: "string";
                            readonly enum: readonly ["story-mainnet", "story-aeneid", "story-illiad", "story-odyssey"];
                            readonly title: "Chain";
                            readonly description: "`story-mainnet` `story-aeneid` `story-illiad` `story-odyssey`";
                        };
                    };
                    readonly type: "object";
                    readonly required: readonly ["block_number", "chain", "hash", "timestamp"];
                    readonly title: "Transaction";
                };
                readonly creator_id: {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly metadata: {
                    readonly type: "object";
                    readonly additionalProperties: true;
                };
                readonly license_parents: {
                    readonly items: {
                        readonly properties: {
                            readonly parent_token_id: {
                                readonly properties: {
                                    readonly chain: {
                                        readonly type: "string";
                                    };
                                    readonly contract_address: {
                                        readonly type: "string";
                                    };
                                    readonly token_id: {
                                        readonly oneOf: readonly [{
                                            readonly type: "string";
                                        }, {
                                            readonly type: "null";
                                        }];
                                    };
                                };
                                readonly type: "object";
                                readonly required: readonly ["chain", "contract_address"];
                                readonly title: "TokenID";
                            };
                            readonly license_id: {
                                readonly type: "string";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["license_id", "parent_token_id"];
                        readonly title: "ParentToken";
                    };
                    readonly type: "array";
                    readonly default: readonly [];
                };
                readonly token_authorizations: {
                    readonly items: {
                        readonly properties: {
                            readonly brand_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly brand_name: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly data: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "email";
                                            readonly default: "email";
                                        };
                                        readonly email_address: {
                                            readonly type: "string";
                                            readonly format: "email";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["email_address"];
                                    readonly title: "EmailAuthorization";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "false_positive";
                                            readonly default: "false_positive";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "FalsePositive";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["data"];
                        readonly title: "Authorization";
                    };
                    readonly type: "array";
                    readonly default: readonly [];
                };
                readonly creator_authorizations: {
                    readonly items: {
                        readonly properties: {
                            readonly brand_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly brand_name: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly data: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "email";
                                            readonly default: "email";
                                        };
                                        readonly email_address: {
                                            readonly type: "string";
                                            readonly format: "email";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["email_address"];
                                    readonly title: "EmailAuthorization";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "false_positive";
                                            readonly default: "false_positive";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "FalsePositive";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["data"];
                        readonly title: "Authorization";
                    };
                    readonly type: "array";
                    readonly default: readonly [];
                };
                readonly media: {
                    readonly items: {
                        readonly properties: {
                            readonly media_id: {
                                readonly type: "string";
                            };
                            readonly url: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "url";
                                }, {
                                    readonly type: "string";
                                }, {
                                    readonly type: "string";
                                    readonly format: "url";
                                }];
                            };
                            readonly hash: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly trust_reason: {
                                readonly oneOf: readonly [{
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "trusted_platform";
                                            readonly default: "trusted_platform";
                                        };
                                        readonly platform_name: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["platform_name"];
                                    readonly title: "TrustedPlatformTrustReason";
                                }, {
                                    readonly properties: {
                                        readonly type: {
                                            readonly type: "string";
                                            readonly const: "no_licenses";
                                            readonly default: "no_licenses";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly [];
                                    readonly title: "NoLicensesTrustReason";
                                }, {
                                    readonly type: "null";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly fetch_status: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly enum: readonly ["failed", "pending", "succeeded", "hash_mismatch", "trusted"];
                                    readonly title: "FetchStatus";
                                    readonly description: "`failed` `pending` `succeeded` `hash_mismatch` `trusted`";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                            readonly uri_id: {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly format: "uuid";
                                }, {
                                    readonly type: "null";
                                }];
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["media_id", "url"];
                        readonly title: "Media";
                    };
                    readonly type: "array";
                };
                readonly infringements: {
                    readonly oneOf: readonly [{
                        readonly properties: {
                            readonly status: {
                                readonly type: "string";
                                readonly const: "pending";
                                readonly default: "pending";
                            };
                            readonly reasons: {
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["reasons"];
                        readonly title: "PendingTokenInfringements";
                    }, {
                        readonly properties: {
                            readonly status: {
                                readonly type: "string";
                                readonly const: "failed";
                                readonly default: "failed";
                            };
                            readonly reasons: {
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["reasons"];
                        readonly title: "FailedTokenInfringements";
                    }, {
                        readonly properties: {
                            readonly status: {
                                readonly type: "string";
                                readonly const: "succeeded";
                                readonly default: "succeeded";
                            };
                            readonly result: {
                                readonly type: "string";
                                readonly enum: readonly ["infringement", "authorized", "no_infringement", "not_checked"];
                                readonly title: "TokenInfringementsResult";
                                readonly description: "`infringement` `authorized` `no_infringement` `not_checked`";
                            };
                            readonly in_network_infringements: {
                                readonly items: {
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                        };
                                        readonly media: {
                                            readonly items: {
                                                readonly type: "string";
                                            };
                                            readonly type: "array";
                                        };
                                        readonly token: {
                                            readonly properties: {
                                                readonly chain: {
                                                    readonly type: "string";
                                                };
                                                readonly contract_address: {
                                                    readonly type: "string";
                                                };
                                                readonly token_id: {
                                                    readonly oneOf: readonly [{
                                                        readonly type: "string";
                                                    }, {
                                                        readonly type: "null";
                                                    }];
                                                };
                                            };
                                            readonly type: "object";
                                            readonly required: readonly ["chain", "contract_address"];
                                            readonly title: "TokenID";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["media", "status", "token"];
                                    readonly title: "InNetworkInfringements";
                                };
                                readonly type: "array";
                            };
                            readonly external_infringements: {
                                readonly items: {
                                    readonly properties: {
                                        readonly status: {
                                            readonly type: "string";
                                        };
                                        readonly media: {
                                            readonly items: {
                                                readonly type: "string";
                                            };
                                            readonly type: "array";
                                        };
                                        readonly brand: {
                                            readonly type: "string";
                                        };
                                        readonly brand_id: {
                                            readonly type: "string";
                                            readonly format: "uuid";
                                        };
                                    };
                                    readonly type: "object";
                                    readonly required: readonly ["brand", "brand_id", "media", "status"];
                                    readonly title: "ExternalInfringements";
                                };
                                readonly type: "array";
                            };
                            readonly credits: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                        };
                        readonly type: "object";
                        readonly required: readonly ["credits", "external_infringements", "in_network_infringements", "result"];
                        readonly title: "SucceededTokenInfringements";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
            readonly type: "object";
            readonly required: readonly ["id", "media", "metadata", "registration_tx"];
            readonly title: "Token";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly status_code: {
                    readonly type: "integer";
                };
                readonly detail: {
                    readonly type: "string";
                };
                readonly extra: {
                    readonly additionalProperties: {};
                    readonly type: readonly ["null", "object", "array"];
                };
            };
            readonly type: "object";
            readonly required: readonly ["detail", "status_code"];
            readonly description: "Validation Exception";
            readonly $schema: "https://json-schema.org/draft/2020-12/schema#";
        };
    };
};
export { TokenTokenIdAuthorizationAuthorizationPost, TokenTokenIdAuthorizationBrandIdAuthorizationDelete, TokenTokenIdAuthorizationBrandIdAuthorizationGet, TokenTokenIdMediaMediaIdMediaGet, TokenTokenIdMediaMediaIdMediaPatch, TokenTokenIdTokenGet, TokenTokenPost };
