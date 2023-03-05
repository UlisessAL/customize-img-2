import { Cloudinary } from "@cloudinary/url-gen";
import { brightness } from "@cloudinary/url-gen/actions/adjust";
import {
  backgroundRemoval,
  pixelate,
} from "@cloudinary/url-gen/actions/effect";
import {
  fill,
  scale,
} from "@cloudinary/url-gen/actions/resize";
import { max } from "@cloudinary/url-gen/actions/roundCorners";
import { faces } from "@cloudinary/url-gen/qualifiers/region";
import { createContext, useContext, useState } from "react";

export const CloudinaryContext = createContext();

export const useCloudinaryContext = () => {
  const context = useContext(CloudinaryContext);
  return context;
};

export function CloudinaryProvider({ children }) {
  const [processing, setProcessing] = useState(true);
  const [url, setUrl] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [effect, setEffect] = useState([]);
  const [theImage, setTheImage] = useState("");

  const cloudinary = new Cloudinary({
    cloud: {
      cloudName: process.env.REACT_APP_CLOUDNAME,
    },
    url: {
      secure: true,
    },
  });

  const effects = [
    {
      effect: "Remove image's background",
      id: 0,
      funct: "uploadImage",
      inputs: false,
    },
    {
      effect: "Resize an image to fill given dimensions",
      id: 1,
      funct: "resizeFillImage",
      inputs: [
        { type: "number", name: "height" },
        { type: "number", name: "width" },
      ],
    },
    {
      effect: "Resize an image",
      id: 2,
      funct: "resizeImage",
      inputs: [
        { type: "number", name: "height" },
        { type: "number", name: "width" },
      ],
    },
    {
      effect: "Convert image into profile image",
      info: "Convert your images to a profile image",
      id: 4,
      funct: "profileImage",
      input: false,
    },
    {
      effect: "Pixelate faces",
      info: "Hide faces in your images",
      id: 7,
      funct: "pixelFace",
      inputs: [{ type: "number", name: "pixelation" }],
    },
    {
      effect: "Adjust image brightness",
      info: "Adjust the brightness of an image",
      id: 8,
      funct: "imageBrightness",
      inputs: [{ type: "number", name: "brightness" }],
    },
  ];

  const uploadImage = (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", process.env.REACT_APP_UPLOADPRESET);
    data.append("cloud:name", process.env.REACT_APP_CLOUDNAME);
    fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDNAME}/image/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        setUrl(data.url);
        setProcessing(false);
        const withoutBg = cloudinary
          .image(data.public_id)
          .effect(backgroundRemoval())
          .toURL();
        setUrl(withoutBg);
      })
      .catch((err) => console.log(err));
  };

  let intervalId;
  let count = 0;

  if (!processing) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      count++;
      let img = new Image();
      img.src = url;
      img.onload = () => {
        setProcessing(true);
        clearInterval(intervalId);
      };
    }, 500);
  }

  const uploadToCld = (image, doFunction) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", process.env.REACT_APP_UPLOADPRESET2);
    data.append("cloud:name", process.env.REACT_APP_CLOUDNAME);
    fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDNAME}/image/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        setUrl(data.url);
        setProcessing(false);
        doFunction(data.public_id);
      })
      .catch((error) => console.log(error));
  };

  const uploadTheImage = (image) => {
    setTheImage(image);
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", process.env.REACT_APP_UPLOADPRESET2);
    data.append("cloud:name", process.env.REACT_APP_CLOUDNAME);
    fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDNAME}/image/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        setUrl(data.url);
        setTheImage(data.url);
        setProcessing(false);
      })
      .catch((error) => console.log(error));
  };

  const resizeFillImage = (image, width, height) => {
    const resizeTheFillImage = (data) => {
      const myImage = cloudinary.image(data);
      myImage.resize(fill().width(width).height(height));
      const myUrl = myImage.toURL();
      setUrl(myUrl);
    };

    uploadToCld(image, resizeTheFillImage);
  };

  const resizeImage = (image, width, height) => {
    const resizeTheImage = (data) => {
      const myImage = cloudinary.image(data);
      myImage.resize(scale().width(width).height(height));
      const myUrl = myImage.toURL();
      setUrl(myUrl);
    };

    uploadToCld(image, resizeTheImage);
  };

  const profileImage = (image) => {
    const profileTheImage = (data) => {
      const myImage = cloudinary.image(data);
      myImage.resize(fill().width(170).height(170)).roundCorners(max());
      const myUrl = myImage.toURL();
      setUrl(myUrl);
    };

    uploadToCld(image, profileTheImage);
  };

  const pixelFace = (image, pixelation) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", process.env.REACT_APP_UPLOADPRESET2);
    data.append("cloud:name", process.env.REACT_APP_CLOUDNAME);
    fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDNAME}/image/upload`,
      {
        method: "post",
        body: data,
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        setUrl(data.url);
        console.log(data);
        setProcessing(false);
        const myImage = cloudinary.image(data.public_id);
        myImage.effect(pixelate().squareSize(pixelation).region(faces()));
        const myUrl = myImage.toURL();
        setUrl(myUrl);
      });
  };

  const imageBrightness = (image, brightnessLevel) => {
    const imageTheBrightness = (data) => {
      const myImage = cloudinary.image(data);
      myImage.adjust(brightness().level(brightnessLevel));
      const myUrl = myImage.toURL();
      setUrl(myUrl);
    };

    uploadToCld(image, imageTheBrightness);
  };

  const functions = [
    { function: resizeFillImage },
    { function: uploadImage },
    { function: resizeImage },
    { function: profileImage },
    { function: pixelFace },
    { function: imageBrightness },
  ];

  const getFunction = (changeImage) => {
    const functionEffect = functions.find((funct) => {
      return funct.function.name === changeImage;
    });
    return setFunctionName(functionEffect);
  };

  const getEffectByParams = (idParams) => {
    const getEffect = effects.find((ef) => {
      return ef.funct === idParams;
    });
    return setEffect(getEffect);
  };

  const resetImage = () => {
    setUrl(theImage);
  }

  return (
    <CloudinaryContext.Provider
      value={{
        processing,
        url,
        uploadImage,
        count,
        getFunction,
        effects,
        functionName,
        effect,
        getEffectByParams,
        uploadTheImage,
        resetImage
      }}
    >
      {children}
    </CloudinaryContext.Provider>
  );
}