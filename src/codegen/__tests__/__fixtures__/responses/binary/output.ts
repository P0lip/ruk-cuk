declare namespace Files_API {
  type Actions = {
    "v1.images": {
      getImages: () => Promise<GetImagesResponse>;
      getImage: () => Promise<GetImageResponse>;
    };
  };
  type Events = never;
  type GetImagesResponse = NodeJS.ReadableStream;
  type GetImageResponse = NodeJS.ReadableStream;
}
