import type { ExtensionValidationResult } from "../types";

/**
 * Validates an extension manifest
 * @param manifest The extension manifest to validate
 * @returns Validation result with errors if any
 */
export function validateExtensionManifest(
  manifest: any,
): ExtensionValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!manifest.id) {
    errors.push("Missing required field: id");
  } else if (typeof manifest.id !== "string" || !manifest.id.trim()) {
    errors.push("Invalid id: must be a non-empty string");
  }

  if (!manifest.name) {
    errors.push("Missing required field: name");
  } else if (typeof manifest.name !== "string" || !manifest.name.trim()) {
    errors.push("Invalid name: must be a non-empty string");
  }

  if (!manifest.version) {
    errors.push("Missing required field: version");
  } else if (
    typeof manifest.version !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(manifest.version)
  ) {
    errors.push(
      "Invalid version: must follow semantic versioning format (x.y.z)",
    );
  }

  if (!manifest.publisher) {
    errors.push("Missing required field: publisher");
  } else if (
    typeof manifest.publisher !== "string" ||
    !manifest.publisher.trim()
  ) {
    errors.push("Invalid publisher: must be a non-empty string");
  }

  if (!manifest.description) {
    errors.push("Missing required field: description");
  } else if (
    typeof manifest.description !== "string" ||
    !manifest.description.trim()
  ) {
    errors.push("Invalid description: must be a non-empty string");
  }

  if (!manifest.widgets) {
    errors.push("Missing required field: widgets");
  } else if (!Array.isArray(manifest.widgets)) {
    errors.push("Invalid widgets: must be an array");
  } else if (manifest.widgets.length === 0) {
    errors.push("Invalid widgets: array must not be empty");
  } else {
    // Validate each widget
    manifest.widgets.forEach((widget: any, index: number) => {
      if (!widget.id) {
        errors.push(`Widget at index ${index}: missing required field: id`);
      } else if (typeof widget.id !== "string" || !widget.id.trim()) {
        errors.push(
          `Widget at index ${index}: invalid id: must be a non-empty string`,
        );
      }

      if (!widget.name) {
        errors.push(`Widget at index ${index}: missing required field: name`);
      } else if (typeof widget.name !== "string" || !widget.name.trim()) {
        errors.push(
          `Widget at index ${index}: invalid name: must be a non-empty string`,
        );
      }

      if (!widget.description) {
        errors.push(
          `Widget at index ${index}: missing required field: description`,
        );
      } else if (
        typeof widget.description !== "string" ||
        !widget.description.trim()
      ) {
        errors.push(
          `Widget at index ${index}: invalid description: must be a non-empty string`,
        );
      }

      if (!widget.category) {
        errors.push(
          `Widget at index ${index}: missing required field: category`,
        );
      } else if (
        typeof widget.category !== "string" ||
        !widget.category.trim()
      ) {
        errors.push(
          `Widget at index ${index}: invalid category: must be a non-empty string`,
        );
      }

      if (!widget.version) {
        errors.push(
          `Widget at index ${index}: missing required field: version`,
        );
      } else if (
        typeof widget.version !== "string" ||
        !/^\d+\.\d+\.\d+$/.test(widget.version)
      ) {
        errors.push(
          `Widget at index ${index}: invalid version: must follow semantic versioning format (x.y.z)`,
        );
      }

      if (!widget.entryPoint) {
        errors.push(
          `Widget at index ${index}: missing required field: entryPoint`,
        );
      } else if (
        typeof widget.entryPoint !== "string" ||
        !widget.entryPoint.trim()
      ) {
        errors.push(
          `Widget at index ${index}: invalid entryPoint: must be a non-empty string`,
        );
      }

      // Validate widget params if present
      if (widget.params) {
        if (!Array.isArray(widget.params)) {
          errors.push(
            `Widget at index ${index}: invalid params: must be an array`,
          );
        } else {
          widget.params.forEach((param: any, paramIndex: number) => {
            if (!param.paramName) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: missing required field: paramName`,
              );
            } else if (
              typeof param.paramName !== "string" ||
              !param.paramName.trim()
            ) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: invalid paramName: must be a non-empty string`,
              );
            }

            if (!param.label) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: missing required field: label`,
              );
            } else if (typeof param.label !== "string" || !param.label.trim()) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: invalid label: must be a non-empty string`,
              );
            }

            if (!param.type) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: missing required field: type`,
              );
            } else if (typeof param.type !== "string" || !param.type.trim()) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: invalid type: must be a non-empty string`,
              );
            }

            if (param.dependsOn && !Array.isArray(param.dependsOn)) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: invalid dependsOn: must be an array`,
              );
            }

            if (param.options && !Array.isArray(param.options)) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: invalid options: must be an array`,
              );
            }

            if (
              param.optionsParams &&
              typeof param.optionsParams !== "object"
            ) {
              errors.push(
                `Widget at index ${index}, param at index ${paramIndex}: invalid optionsParams: must be an object`,
              );
            }
          });
        }
      }

      // Validate widget i18n if present
      if (widget.i18n) {
        if (typeof widget.i18n !== "object" || widget.i18n === null) {
          errors.push(
            `Widget at index ${index}: invalid i18n: must be an object`,
          );
        } else {
          Object.entries(widget.i18n).forEach(([locale, i18nData]) => {
            const i18n = i18nData as any;
            if (!i18n.name || typeof i18n.name !== "string") {
              errors.push(
                `Widget at index ${index}: i18n for locale ${locale}: missing or invalid name`,
              );
            }
            if (!i18n.description || typeof i18n.description !== "string") {
              errors.push(
                `Widget at index ${index}: i18n for locale ${locale}: missing or invalid description`,
              );
            }
          });
        }
      }
    });
  }

  // Validate parameters if present
  if (manifest.parameters) {
    if (
      typeof manifest.parameters !== "object" ||
      manifest.parameters === null
    ) {
      errors.push("Invalid parameters: must be an object");
    } else {
      Object.entries(manifest.parameters).forEach(([paramName, paramData]) => {
        const param = paramData as any;
        if (!param.paramName) {
          errors.push(
            `Parameter ${paramName}: missing required field: paramName`,
          );
        } else if (
          typeof param.paramName !== "string" ||
          !param.paramName.trim()
        ) {
          errors.push(
            `Parameter ${paramName}: invalid paramName: must be a non-empty string`,
          );
        }

        if (!param.label) {
          errors.push(`Parameter ${paramName}: missing required field: label`);
        } else if (typeof param.label !== "string" || !param.label.trim()) {
          errors.push(
            `Parameter ${paramName}: invalid label: must be a non-empty string`,
          );
        }

        if (!param.type) {
          errors.push(`Parameter ${paramName}: missing required field: type`);
        } else if (typeof param.type !== "string" || !param.type.trim()) {
          errors.push(
            `Parameter ${paramName}: invalid type: must be a non-empty string`,
          );
        }

        if (param.dependsOn && !Array.isArray(param.dependsOn)) {
          errors.push(
            `Parameter ${paramName}: invalid dependsOn: must be an array`,
          );
        }

        if (param.options && !Array.isArray(param.options)) {
          errors.push(
            `Parameter ${paramName}: invalid options: must be an array`,
          );
        }

        if (param.optionsParams && typeof param.optionsParams !== "object") {
          errors.push(
            `Parameter ${paramName}: invalid optionsParams: must be an object`,
          );
        }
      });
    }
  }

  // Validate parameterLinks if present
  if (manifest.parameterLinks) {
    if (!Array.isArray(manifest.parameterLinks)) {
      errors.push("Invalid parameterLinks: must be an array");
    } else {
      manifest.parameterLinks.forEach((link: any, index: number) => {
        if (!link.source) {
          errors.push(
            `Parameter link at index ${index}: missing required field: source`,
          );
        } else if (typeof link.source !== "string" || !link.source.trim()) {
          errors.push(
            `Parameter link at index ${index}: invalid source: must be a non-empty string`,
          );
        }

        if (!link.target) {
          errors.push(
            `Parameter link at index ${index}: missing required field: target`,
          );
        } else if (typeof link.target !== "string" || !link.target.trim()) {
          errors.push(
            `Parameter link at index ${index}: invalid target: must be a non-empty string`,
          );
        }

        if (link.transform && typeof link.transform !== "string") {
          errors.push(
            `Parameter link at index ${index}: invalid transform: must be a string`,
          );
        }
      });
    }
  }

  // Validate extension i18n if present
  if (manifest.i18n) {
    if (typeof manifest.i18n !== "object" || manifest.i18n === null) {
      errors.push("Invalid i18n: must be an object");
    } else {
      Object.entries(manifest.i18n).forEach(([locale, i18nData]) => {
        const i18n = i18nData as any;
        if (!i18n.name || typeof i18n.name !== "string") {
          errors.push(`i18n for locale ${locale}: missing or invalid name`);
        }
        if (!i18n.description || typeof i18n.description !== "string") {
          errors.push(
            `i18n for locale ${locale}: missing or invalid description`,
          );
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a single extension widget
 * @param widget The widget to validate
 * @returns Validation result with errors if any
 */
export function validateExtensionWidget(
  widget: any,
): ExtensionValidationResult {
  const errors: string[] = [];

  if (!widget.id) {
    errors.push("Missing required field: id");
  } else if (typeof widget.id !== "string" || !widget.id.trim()) {
    errors.push("Invalid id: must be a non-empty string");
  }

  if (!widget.name) {
    errors.push("Missing required field: name");
  } else if (typeof widget.name !== "string" || !widget.name.trim()) {
    errors.push("Invalid name: must be a non-empty string");
  }

  if (!widget.description) {
    errors.push("Missing required field: description");
  } else if (
    typeof widget.description !== "string" ||
    !widget.description.trim()
  ) {
    errors.push("Invalid description: must be a non-empty string");
  }

  if (!widget.category) {
    errors.push("Missing required field: category");
  } else if (typeof widget.category !== "string" || !widget.category.trim()) {
    errors.push("Invalid category: must be a non-empty string");
  }

  if (!widget.version) {
    errors.push("Missing required field: version");
  } else if (
    typeof widget.version !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(widget.version)
  ) {
    errors.push(
      "Invalid version: must follow semantic versioning format (x.y.z)",
    );
  }

  if (!widget.entryPoint) {
    errors.push("Missing required field: entryPoint");
  } else if (
    typeof widget.entryPoint !== "string" ||
    !widget.entryPoint.trim()
  ) {
    errors.push("Invalid entryPoint: must be a non-empty string");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
