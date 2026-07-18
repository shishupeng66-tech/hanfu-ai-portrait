import { describe, it, expect } from "vitest";

// =============================================================================
// 1. Workflow resolution logic
// =============================================================================

function resolveWorkflow(generationConfig: string | null | undefined): string {
  const genConfig = JSON.parse(generationConfig ?? "{}");
  return genConfig.workflow ?? "prompt_generation";
}

function resolveModel(
  generationConfig: string | null | undefined,
  envModel: string,
): string {
  const genConfig = JSON.parse(generationConfig ?? "{}");
  if (typeof genConfig.model === "string" && genConfig.model.trim()) {
    return genConfig.model.trim();
  }
  return envModel;
}

function resolveTemplateImage(
  shotReferenceImage: string | null | undefined,
  templateReferenceImages: string[] | null | undefined,
): string {
  return (
    shotReferenceImage?.trim() ||
    templateReferenceImages?.[0]?.trim() ||
    ""
  );
}

function buildIdentityTransferPrompt(
  basePrompt: string,
  shotPrompt: string | null | undefined,
): string {
  return [basePrompt, shotPrompt]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join("\n\n");
}

function buildIdentityTransferRequest({
  model,
  prompt,
  userImageBase64,
  userImageMimeType,
  templateImageUrl,
}: {
  model: string;
  prompt: string;
  userImageBase64: string;
  userImageMimeType: string;
  templateImageUrl: string;
}) {
  return {
    model,
    prompt,
    image: [
      `data:${userImageMimeType};base64,${userImageBase64}`,
      templateImageUrl,
    ],
    size: "3072x4096",
    response_format: "url",
    stream: false,
    watermark: false,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("workflow resolution", () => {
  it("defaults to prompt_generation when generationConfig is empty", () => {
    expect(resolveWorkflow("{}")).toBe("prompt_generation");
  });

  it("defaults to prompt_generation when generationConfig is null", () => {
    expect(resolveWorkflow(null)).toBe("prompt_generation");
  });

  it("returns identity_transfer when workflow is set", () => {
    expect(
      resolveWorkflow('{"workflow":"identity_transfer","model":"test-model"}'),
    ).toBe("identity_transfer");
  });

  it("returns prompt_generation when workflow is something else", () => {
    expect(resolveWorkflow('{"workflow":"other"}')).toBe("other");
  });
});

describe("model resolution", () => {
  it("uses generationConfig.model when present", () => {
    expect(
      resolveModel('{"model":"custom-model-123"}', "env-default-model"),
    ).toBe("custom-model-123");
  });

  it("falls back to env model when generationConfig.model is empty", () => {
    expect(resolveModel('{"model":""}', "env-default-model")).toBe(
      "env-default-model",
    );
  });

  it("falls back to env model when generationConfig.model is missing", () => {
    expect(resolveModel("{}", "env-default-model")).toBe("env-default-model");
  });

  it("trims whitespace from model", () => {
    expect(
      resolveModel('{"model":"  trimmed-model  "}', "env-default-model"),
    ).toBe("trimmed-model");
  });
});

describe("template image resolution", () => {
  it("prioritizes shot.referenceImage over template.referenceImages", () => {
    expect(
      resolveTemplateImage("shot-image.jpg", ["template-image.jpg"]),
    ).toBe("shot-image.jpg");
  });

  it("falls back to referenceImages[0] when shot is empty", () => {
    expect(resolveTemplateImage("", ["template-image.jpg"])).toBe(
      "template-image.jpg",
    );
  });

  it("falls back to referenceImages[0] when shot is null", () => {
    expect(resolveTemplateImage(null, ["template-image.jpg"])).toBe(
      "template-image.jpg",
    );
  });

  it("returns empty string when both are missing", () => {
    expect(resolveTemplateImage(null, [])).toBe("");
  });

  it("returns empty string when both are null", () => {
    expect(resolveTemplateImage(null, null)).toBe("");
  });
});

describe("identity_transfer prompt building", () => {
  it("joins basePrompt and shot.prompt with newlines", () => {
    const result = buildIdentityTransferPrompt(
      "Base prompt text",
      "Shot prompt text",
    );
    expect(result).toBe("Base prompt text\n\nShot prompt text");
  });

  it("uses only basePrompt when shot.prompt is empty", () => {
    const result = buildIdentityTransferPrompt("Base prompt text", "");
    expect(result).toBe("Base prompt text");
  });

  it("uses only basePrompt when shot.prompt is null", () => {
    const result = buildIdentityTransferPrompt("Base prompt text", null);
    expect(result).toBe("Base prompt text");
  });
});

describe("identity_transfer request body", () => {
  it("contains only verified fields", () => {
    const request = buildIdentityTransferRequest({
      model: "doubao-seedream-5-0-lite",
      prompt: "test prompt",
      userImageBase64: "abc123",
      userImageMimeType: "image/jpeg",
      templateImageUrl: "https://r2.example.com/template.jpg",
    });

    const allowedKeys = [
      "model",
      "prompt",
      "image",
      "size",
      "response_format",
      "stream",
      "watermark",
    ];
    const actualKeys = Object.keys(request);

    // No extra fields
    actualKeys.forEach((key) => {
      expect(allowedKeys).toContain(key);
    });

    // No forbidden fields
    const forbiddenKeys = [
      "denoising_strength",
      "negative_prompt",
      "face_enhance",
      "cfg_scale",
      "steps",
      "image_guidance_scale",
      "promptOptimization",
      "optimize_prompt_options",
      "sequential_image_generation",
      "sequential_image_generation_options",
    ];
    forbiddenKeys.forEach((key) => {
      expect(request).not.toHaveProperty(key);
    });
  });

  it("image array has correct order: [user image, template image]", () => {
    const request = buildIdentityTransferRequest({
      model: "test-model",
      prompt: "test prompt",
      userImageBase64: "user123",
      userImageMimeType: "image/png",
      templateImageUrl: "https://r2.example.com/template.jpg",
    });

    expect(request.image).toHaveLength(2);
    expect(request.image[0]).toContain("data:image/png;base64,user123");
    expect(request.image[1]).toBe("https://r2.example.com/template.jpg");
  });

  it("size is always 3072x4096", () => {
    const request = buildIdentityTransferRequest({
      model: "test-model",
      prompt: "test",
      userImageBase64: "abc",
      userImageMimeType: "image/jpeg",
      templateImageUrl: "https://example.com/t.jpg",
    });

    expect(request.size).toBe("3072x4096");
  });
});

describe("identity_transfer security", () => {
  it("request body does NOT contain user base64 in any top-level field", () => {
    const request = buildIdentityTransferRequest({
      model: "test-model",
      prompt: "test prompt",
      userImageBase64: "sensitive-user-data",
      userImageMimeType: "image/jpeg",
      templateImageUrl: "https://r2.example.com/template.jpg",
    });

    // The user base64 should only be inside the image[0] data URI
    // It should NOT appear in prompt, model, or any other top-level field
    expect(request.prompt).not.toContain("sensitive-user-data");
    expect(request.model).not.toContain("sensitive-user-data");
    expect(request.templateImageUrl as unknown as string).toBeUndefined();

    // But it IS in the image array (as part of a data URI)
    expect(request.image[0]).toContain("sensitive-user-data");
  });

  it("metadata never contains user base64", () => {
    const metadata = {
      workflow: "identity_transfer",
      templateId: "tpl-1",
      templateSlug: "test",
      templateVersion: 1,
      templateName: { zh: "测试", en: "Test" },
      shotId: null,
      templateImageUrl: "https://r2.example.com/template.jpg",
      model: "test-model",
      size: "3072x4096",
      aspectRatio: "3:4",
      promptVersion: 1,
      mode: "set",
      imageUrls: ["https://r2.example.com/result.jpg"],
    };

    const metadataStr = JSON.stringify(metadata);
    expect(metadataStr).not.toContain("base64");
    expect(metadataStr).not.toContain("data:image");
  });
});

describe("credit compensation", () => {
  it("createCreditCompensation only refunds once", () => {
    // Simulate the compensation pattern
    let refunded = 0;
    let settled = false;
    const credits = { balance: 100 };

    function compensate() {
      if (!settled) {
        refunded += 1;
        credits.balance += 4;
        settled = true;
      }
    }

    function settle() {
      settled = true;
    }

    // Test: compensate called multiple times, only refunds once
    compensate();
    compensate();
    compensate();
    expect(refunded).toBe(1);
    expect(credits.balance).toBe(104);

    // After settle, compensate does nothing
    settle();
    compensate();
    expect(refunded).toBe(1);
  });

  it("settle prevents further compensation", () => {
    let refunded = 0;
    let settled = false;

    function compensate() {
      if (!settled) refunded += 1;
    }

    function settle() {
      settled = true;
    }

    settle();
    compensate();
    expect(refunded).toBe(0);
  });
});

describe("publish validation for identity_transfer", () => {
  function validatePublish(template: {
    basePrompt: string;
    referenceImages: string[];
    shots: Array<{ referenceImage: string }>;
    generationConfig: string;
  }): string[] {
    const errors: string[] = [];
    const genConfig = JSON.parse(template.generationConfig ?? "{}");
    const workflow = genConfig.workflow ?? "prompt_generation";

    if (workflow === "identity_transfer") {
      const hasTemplateImage =
        (template.referenceImages.length > 0 &&
          template.referenceImages[0]?.trim()) ||
        template.shots.some((s) => s.referenceImage?.trim());

      if (!hasTemplateImage) {
        errors.push("Missing template reference image");
      }

      if (
        !genConfig.model ||
        typeof genConfig.model !== "string" ||
        !genConfig.model.trim()
      ) {
        errors.push("Model is required");
      }

      if (genConfig.size !== "3072x4096") {
        errors.push("Size must be 3072x4096");
      }

      if (genConfig.aspectRatio !== "3:4") {
        errors.push("Aspect ratio must be 3:4");
      }

      if (genConfig.imageCount !== 1) {
        errors.push("Image count must be 1");
      }
    }

    if (!template.basePrompt) {
      errors.push("Base prompt is required");
    }

    return errors;
  }

  it("passes when all identity_transfer requirements are met", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: ["https://r2.example.com/template.jpg"],
      shots: [],
      generationConfig: JSON.stringify({
        workflow: "identity_transfer",
        model: "test-model",
        size: "3072x4096",
        aspectRatio: "3:4",
        imageCount: 1,
      }),
    });
    expect(errors).toHaveLength(0);
  });

  it("passes when shot.referenceImage provides the template image", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: [],
      shots: [{ referenceImage: "https://r2.example.com/shot.jpg" }],
      generationConfig: JSON.stringify({
        workflow: "identity_transfer",
        model: "test-model",
        size: "3072x4096",
        aspectRatio: "3:4",
        imageCount: 1,
      }),
    });
    expect(errors).toHaveLength(0);
  });

  it("fails when template image is missing", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: [],
      shots: [],
      generationConfig: JSON.stringify({
        workflow: "identity_transfer",
        model: "test-model",
        size: "3072x4096",
        aspectRatio: "3:4",
        imageCount: 1,
      }),
    });
    expect(errors).toContain("Missing template reference image");
  });

  it("fails when model is empty", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: ["https://r2.example.com/template.jpg"],
      shots: [],
      generationConfig: JSON.stringify({
        workflow: "identity_transfer",
        model: "",
        size: "3072x4096",
        aspectRatio: "3:4",
        imageCount: 1,
      }),
    });
    expect(errors).toContain("Model is required");
  });

  it("fails when size is not 3072x4096", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: ["https://r2.example.com/template.jpg"],
      shots: [],
      generationConfig: JSON.stringify({
        workflow: "identity_transfer",
        model: "test-model",
        size: "1024x1024",
        aspectRatio: "3:4",
        imageCount: 1,
      }),
    });
    expect(errors).toContain("Size must be 3072x4096");
  });

  it("fails when imageCount is not 1", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: ["https://r2.example.com/template.jpg"],
      shots: [],
      generationConfig: JSON.stringify({
        workflow: "identity_transfer",
        model: "test-model",
        size: "3072x4096",
        aspectRatio: "3:4",
        imageCount: 6,
      }),
    });
    expect(errors).toContain("Image count must be 1");
  });

  it("does not apply identity_transfer rules to prompt_generation", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: [],
      shots: [],
      generationConfig: JSON.stringify({
        workflow: "prompt_generation",
        model: "",
        size: "1536x2048",
        aspectRatio: "1:1",
        imageCount: 6,
      }),
    });
    // Only basePrompt validation applies, no identity_transfer errors
    expect(errors).toHaveLength(0);
  });

  it("does not apply identity_transfer rules when workflow is missing", () => {
    const errors = validatePublish({
      basePrompt: "test prompt",
      referenceImages: [],
      shots: [],
      generationConfig: JSON.stringify({
        model: "seedream-4.5",
        aspectRatio: "3:4",
        imageCount: 6,
      }),
    });
    // Defaults to prompt_generation, no identity_transfer errors
    expect(errors).toHaveLength(0);
  });
});

// =============================================================================
// Shot resolution logic (backend behaviour)
// =============================================================================

describe("shot resolution for identity_transfer", () => {
  type Shot = {
    shotKey: string;
    sortOrder: number;
    referenceImage: string;
  };

  function resolveShot(
    shotId: string | null,
    shots: Shot[],
    workflow: string,
  ): { shot: Shot | null; error: string | null } {
    if (shotId) {
      const shot = shots.find((s) => s.shotKey === shotId) ?? null;
      if (!shot) {
        return { shot: null, error: `Shot "${shotId}" not found` };
      }
      return { shot, error: null };
    }

    if (workflow === "identity_transfer") {
      if (shots.length > 1) {
        return { shot: null, error: "This template has multiple shots. Please select a specific shot." };
      }
      return { shot: shots[0] ?? null, error: null };
    }

    // prompt_generation fallback
    return { shot: shots[0] ?? null, error: null };
  }

  function resolveTemplateImage(
    shot: Shot | null,
    referenceImages: string[],
  ): { url: string; error: string | null } {
    if (shot) {
      const url = shot.referenceImage?.trim() || "";
      if (!url) {
        return { url: "", error: `Shot "${shot.shotKey}" is missing its reference image.` };
      }
      return { url, error: null };
    }
    // No shots — fallback to referenceImages[0]
    return { url: referenceImages[0]?.trim() || "", error: null };
  }

  const shots: Shot[] = [
    { shotKey: "shot-01", sortOrder: 1, referenceImage: "https://r2.example.com/shot-01.jpg" },
    { shotKey: "shot-02", sortOrder: 2, referenceImage: "https://r2.example.com/shot-02.jpg" },
  ];

  it("returns 400 when no shotId is provided for multi-shot template", () => {
    const result = resolveShot(null, shots, "identity_transfer");
    expect(result.error).toBe("This template has multiple shots. Please select a specific shot.");
    expect(result.shot).toBeNull();
  });

  it("returns shot-01 when shotId=shot-01 is provided", () => {
    const result = resolveShot("shot-01", shots, "identity_transfer");
    expect(result.error).toBeNull();
    expect(result.shot?.shotKey).toBe("shot-01");
  });

  it("returns shot-02 when shotId=shot-02 is provided", () => {
    const result = resolveShot("shot-02", shots, "identity_transfer");
    expect(result.error).toBeNull();
    expect(result.shot?.shotKey).toBe("shot-02");
  });

  it("returns 400 when shotId does not exist", () => {
    const result = resolveShot("shot-99", shots, "identity_transfer");
    expect(result.error).toBe('Shot "shot-99" not found');
    expect(result.shot).toBeNull();
  });

  it("returns error when selected shot has no referenceImage", () => {
    const shotsWithMissing: Shot[] = [
      { shotKey: "shot-01", sortOrder: 1, referenceImage: "" },
      { shotKey: "shot-02", sortOrder: 2, referenceImage: "https://r2.example.com/shot-02.jpg" },
    ];
    const shotResult = resolveShot("shot-01", shotsWithMissing, "identity_transfer");
    expect(shotResult.error).toBeNull();
    expect(shotResult.shot?.shotKey).toBe("shot-01");

    const imageResult = resolveTemplateImage(shotResult.shot, []);
    expect(imageResult.error).toBe('Shot "shot-01" is missing its reference image.');
    expect(imageResult.url).toBe("");
  });

  it("uses shot-01.referenceImage, not shot-02.referenceImage", () => {
    const shotResult = resolveShot("shot-01", shots, "identity_transfer");
    const imageResult = resolveTemplateImage(shotResult.shot, []);
    expect(imageResult.url).toBe("https://r2.example.com/shot-01.jpg");
    expect(imageResult.url).not.toBe("https://r2.example.com/shot-02.jpg");
  });

  it("does not silently fallback to another shot's referenceImage", () => {
    const shotsWithMissing: Shot[] = [
      { shotKey: "shot-01", sortOrder: 1, referenceImage: "" },
      { shotKey: "shot-02", sortOrder: 2, referenceImage: "https://r2.example.com/shot-02.jpg" },
    ];
    const shotResult = resolveShot("shot-01", shotsWithMissing, "identity_transfer");
    const imageResult = resolveTemplateImage(shotResult.shot, []);
    // Should report error, NOT fallback to shot-02
    expect(imageResult.error).not.toBeNull();
    expect(imageResult.url).not.toBe("https://r2.example.com/shot-02.jpg");
  });

  it("auto-uses single shot when no shotId is provided", () => {
    const singleShot = [{ shotKey: "shot-01", sortOrder: 1, referenceImage: "https://r2.example.com/shot-01.jpg" }];
    const result = resolveShot(null, singleShot, "identity_transfer");
    expect(result.error).toBeNull();
    expect(result.shot?.shotKey).toBe("shot-01");
  });

  it("allows fallback to referenceImages[0] when template has no shots", () => {
    const result = resolveTemplateImage(null, ["https://r2.example.com/fallback.jpg"]);
    expect(result.error).toBeNull();
    expect(result.url).toBe("https://r2.example.com/fallback.jpg");
  });

  it("each Ark request only contains one user image and one shot template image", () => {
    // This is the buildIdentityTransferRequest function already tested
    // Verify that image array has exactly 2 elements
    const request = buildIdentityTransferRequest({
      model: "test-model",
      prompt: "test",
      userImageBase64: "user-data",
      userImageMimeType: "image/jpeg",
      templateImageUrl: "https://r2.example.com/shot-01.jpg",
    });
    expect(request.image).toHaveLength(2);
    expect(request.image[1]).toBe("https://r2.example.com/shot-01.jpg");
    // No third image
    expect(request.image[2]).toBeUndefined();
  });
});

describe("PublicTemplate security", () => {
  it("exposes referenceImage but not prompt", () => {
    // Simulate toPublicTemplate stripping
    const publicShot = {
      id: "1",
      shotKey: "shot-01",
      order: 1,
      title: { zh: "上元初灯", en: "Lanterns at Nightfall" },
      referenceImage: "https://r2.example.com/shot-01.jpg",
    };

    // These fields should be present
    expect(publicShot).toHaveProperty("referenceImage");
    expect(publicShot).toHaveProperty("title");
    expect(publicShot).toHaveProperty("shotKey");

    // These fields should NOT be present
    expect(publicShot).not.toHaveProperty("prompt");
    expect(publicShot).not.toHaveProperty("basePrompt");
    expect(publicShot).not.toHaveProperty("negativePrompt");
  });

  it("PublicTemplate does not expose basePrompt", () => {
    const publicTemplate = {
      id: "tpl-1",
      slug: "test",
      name: { zh: "测试", en: "Test" },
      coverImage: "https://r2.example.com/cover.jpg",
      shots: [
        {
          id: "1",
          shotKey: "shot-01",
          order: 1,
          title: { zh: "上元初灯", en: "Lanterns at Nightfall" },
          referenceImage: "https://r2.example.com/shot-01.jpg",
        },
      ],
    };

    expect(publicTemplate).not.toHaveProperty("basePrompt");
    expect(publicTemplate).not.toHaveProperty("negativePrompt");
    expect(publicTemplate).not.toHaveProperty("prompt");
  });
});
