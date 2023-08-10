import { Portal } from "@chakra-ui/react";
import { RootState } from "main/store/store";
import { useSelector } from "react-redux";
import AccountCreateModal from "./modals/AccountCreateModal";
import AccountEditModal from "./modals/AccountEditModal";
import AccountIconPickerModal from "./modals/AccountIconPickerModal";
import AccountMfaModal from "./modals/AccountMfaModal";
import AddressManageModal from "./modals/AddressManageModal";
import AlertModal from "./modals/AlertModal";
import FileCreateModal from "./modals/FileCreateModal";
import FileExistModal from "./modals/FileExistsModal";
import ImageUploadModal from "./modals/ImageUploadModal";
import MailSendModal from "./modals/MailSendModal";
import ScreenshotExportModal from "./modals/ScreenshotExportModal";
import ScreenshotHelpModal from "./modals/ScreenshotHelpModal";

export interface ModalProps {
  modal: Noonly.State.ModalSingle;
}

const Modals: React.FC = () => {
  const modal = useSelector((state: RootState) => state.modal);
  const defaultModal: Noonly.State.ModalSingle = {
    open: false,
    onClose: () => null,
    data: {},
  };

  return (
    <Portal>
      <AccountCreateModal modal={modal[1] || defaultModal} />
      <AccountEditModal modal={modal[2] || defaultModal} />
      <ScreenshotHelpModal modal={modal[3] || defaultModal} />
      <AddressManageModal modal={modal[4] || defaultModal} />
      <ImageUploadModal modal={modal[5] || defaultModal} />
      <AccountIconPickerModal modal={modal[6] || defaultModal} />
      <FileCreateModal modal={modal[7] || defaultModal} />
      <FileExistModal modal={modal[8] || defaultModal} />
      <AlertModal modal={modal[9] || defaultModal} />
      <MailSendModal modal={modal[10] || defaultModal} />
      <AccountMfaModal modal={modal[11] || defaultModal} />
      <ScreenshotExportModal modal={modal[12] || defaultModal} />
    </Portal>
  );
};

export default Modals;
