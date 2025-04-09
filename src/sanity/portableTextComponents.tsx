import Image from "next/image";
import { PortableTextComponents } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import { ModelViewer } from "@/components/ModelViewer";

export const components: PortableTextComponents = {
  types: {
    image: (props) =>
      props.value ? (
        <Image
          className="rounded-lg not-prose w-full h-auto"
          src={urlFor(props.value)
            .width(600)
            .height(400)
            .quality(80)
            .auto("format")
            .url()}
          alt={props?.value?.alt || ""}
          width="600"
          height="400"
        />
      ) : null,
    model3d: (props) =>
      props.value?.modelFile?._ref ? (
        <div className="my-8">
          {props.value.caption && (
            <p className="text-sm text-gray-500 mb-2">{props.value.caption}</p>
          )}
          <ModelViewer 
            modelFileId={props.value.modelFile._ref} 
            height={props.value.height || 400} 
          />
        </div>
      ) : null,
  },
};