import { Button } from "@chakra-ui/react";

import JSZip from "jszip";
import imgHost from "library/utilities/imgHost";
import { useState } from "react";
import Modal from "../../Modal";
import { ModalProps } from "../Modals";

const ScreenshotExportModal: React.FC<ModalProps> = ({ modal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const startDownload = async () => {
    setIsLoading(true);
    const screenshots = modal.data as Noonly.API.Data.Screenshot[];
    const zip = new JSZip();

    const downloadImage = (url: string, name: string) => {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then((response) => {
            if (!response.ok) {
              reject(
                new Error(`Failed to fetch ${url}. Status: ${response.status}`)
              );
            }
            return response.blob();
          })
          .then((blob) => {
            zip.file(name, blob);
            resolve(null);
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

    for (const screenshot of screenshots) {
      const url = `${imgHost}/r/${screenshot.name}`;
      await downloadImage(
        url,
        "screenshots/" + screenshot.name + "." + screenshot.type
      );
      setAdded((added) => added + 1);
    }

    zip.file("index.json", new Blob([JSON.stringify(screenshots, null, 2)]));

    const zipFile = await zip.generateAsync({ type: "blob" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(zipFile);
    downloadLink.download = "noonly-screenshots.zip";

    downloadLink.click();
    setAdded(0);
    setIsDone(true);
    setIsLoading(false);
  };

  return (
    <Modal
      header="Are you sure? This could take a while."
      onClose={modal.onClose}
      isOpen={modal.open}
      disabled={isLoading}
      buttons={
        isDone ? (
          <Button
            variant="ghost"
            disabled={isLoading}
            isLoading={isLoading}
            onClick={modal.onClose}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              disabled={isLoading}
              isLoading={isLoading}
              onClick={startDownload}
            >
              Continue
            </Button>
            <Button
              disabled={isLoading}
              onClick={modal.onClose}
              bg="red.500"
              _hover={{ bg: "red.600" }}
              _active={{ bg: "red.700" }}
              ml={3}
            >
              Cancel
            </Button>
          </>
        )
      }
    >
      {isDone ? "Done!" : `Progress: ${added}/${modal.data.length}`}
    </Modal>
  );
};

export default ScreenshotExportModal;
