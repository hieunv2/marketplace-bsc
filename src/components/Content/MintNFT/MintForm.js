import { useState, useContext } from "react";

import Web3Context from "../../../store/web3-context";
import CollectionContext from "../../../store/collection-context";
import TextField from "@mui/material/TextField";
import { Form } from "react-bootstrap";
import ImageUploading from "react-images-uploading";
import ImageUpload from "./image-upload.png";

import styled from "styled-components";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

const MintForm = () => {
  const [enteredName, setEnteredName] = useState("");
  const [descriptionIsValid, setDescriptionIsValid] = useState(true);

  const [enteredDescription, setEnteredDescription] = useState("");
  const [nameIsValid, setNameIsValid] = useState(true);

  const [capturedFileBuffer, setCapturedFileBuffer] = useState(null);
  const [fileIsValid, setFileIsValid] = useState(true);

  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);

  const [images, setImages] = useState([]);

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);

    if (imageList.length > 0) {
      const reader = new window.FileReader();
      // reader.readAsDataURL(imageList[0]);
      // console.log(imageList[0]);
      reader.readAsArrayBuffer(imageList[0].file);
      reader.onloadend = () => {
        setCapturedFileBuffer(Buffer(reader.result));
      };
    }
  };

  const enteredNameHandler = (event) => {
    setEnteredName(event.target.value);
  };

  const enteredDescriptionHandler = (event) => {
    setEnteredDescription(event.target.value);
  };

  const handleMint = () => {
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(images[0]);
    reader.onloadend = () => {
      setCapturedFileBuffer(Buffer(reader.result));
    };
  };

  const submissionHandler = (event) => {
    event.preventDefault();

    enteredName ? setNameIsValid(true) : setNameIsValid(false);
    enteredDescription
      ? setDescriptionIsValid(true)
      : setDescriptionIsValid(false);
    capturedFileBuffer ? setFileIsValid(true) : setFileIsValid(false);

    const formIsValid = enteredName && enteredDescription && capturedFileBuffer;

    // Upload file to IPFS and push to the blockchain
    const mintNFT = async () => {
      // Add file to the IPFS
      const fileAdded = await ipfs.add(capturedFileBuffer);
      if (!fileAdded) {
        console.error("Something went wrong when updloading the file");
        return;
      }

      const metadata = {
        title: "Asset Metadata",
        type: "object",
        properties: {
          name: {
            type: "string",
            description: enteredName,
          },
          description: {
            type: "string",
            description: enteredDescription,
          },
          image: {
            type: "string",
            description: fileAdded.path,
          },
        },
      };

      const metadataAdded = await ipfs.add(JSON.stringify(metadata));
      if (!metadataAdded) {
        console.error("Something went wrong when updloading the file");
        return;
      }

      collectionCtx.contract.methods
        .safeMint(metadataAdded.path)
        .send({ from: web3Ctx.account })
        .on("transactionHash", (hash) => {
          collectionCtx.setNftIsLoading(true);
        })
        .on("error", (e) => {
          window.alert("Something went wrong when pushing to the blockchain");
          collectionCtx.setNftIsLoading(false);
        });
    };

    formIsValid && mintNFT();
  };

  const nameClass = nameIsValid ? "form-control" : "form-control is-invalid";
  const descriptionClass = descriptionIsValid
    ? "form-control"
    : "form-control is-invalid";
  const fileClass = fileIsValid ? "form-control" : "form-control is-invalid";

  return (
    <form onSubmit={submissionHandler}>
      <div className="row justify-content-center">
        <Form.Group className="mb-4" controlId="formBasicEmail">
          <Form.Label style={{ color: "white", fontSize: 20 }}>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name of NFT"
            value={enteredName}
            onChange={enteredNameHandler}
            size="lg"
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="formBasicEmail">
          <Form.Label style={{ color: "white", fontSize: 20 }}>
            Description
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Description of NFT"
            value={enteredDescription}
            onChange={enteredDescriptionHandler}
            size="lg"
          />
        </Form.Group>

        <ImageUploading
          multiple
          value={images}
          onChange={onChange}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps,
          }) => (
            // write your building UI
            <div className="upload__image-wrapper">
              {images.length === 0 && (
                <button
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                >
                  <img style={{ width: 30, height: 30 }} src={ImageUpload} />
                </button>
              )}
              &nbsp;
              {imageList.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image["data_url"]} alt="" width="100" />
                  <div className="image-item__btn-wrapper">
                    <button onClick={() => onImageUpdate(index)}>Update</button>
                    <button onClick={() => onImageRemove(index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ImageUploading>

        {/* <div className="col-md-2">
          <input
            type="file"
            className={`${fileClass} mb-1`}
            onChange={captureFile}
          />
        </div> */}
      </div>

      <button type="submit" className="my-button">
        Create NFT
      </button>
    </form>
  );
};

export default MintForm;

const ButtonCustom = styled.a`
  text-decoration: none;
  text-align: center;

  cursor: pointer;
  text-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 97px rgba(255, 86, 246, 0.51);

  font-size: 16px;
  color: white;
  padding: 18px 36px 19px;
  background: #f66614;
  border-radius: 25.5px;
`;
