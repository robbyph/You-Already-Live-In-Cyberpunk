import { fields } from "@keystatic/core";
import { lazy, Suspense } from "react";

type ImageValue = {
  data: Uint8Array;
  extension: string;
  filename: string;
} | null;

const CropInput = lazy(() => import("./crop-input"));

export function imageWithCrop(config: Parameters<typeof fields.image>[0]) {
  const base = fields.image(config);
  return {
    ...base,
    Input(props: {
      value: ImageValue;
      onChange: (v: ImageValue) => void;
      autoFocus: boolean;
      forceValidation: boolean;
    }) {
      return (
        <Suspense fallback={null}>
          <CropInput
            {...props}
            label={config.label}
            description={config.description}
            validation={config.validation}
          />
        </Suspense>
      );
    },
  };
}
