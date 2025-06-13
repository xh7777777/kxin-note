import { useNoteStore } from '@renderer/store/modules/noteStore';
import { FileUsageType } from '../../../customTypes/models/file.types';
import { Buffer } from 'buffer';
export function getFileUsageType(fileType: string) {
  if (fileType.startsWith('image/')) {
    return FileUsageType.IMAGE;
  } else if (fileType.startsWith('audio/')) {
    return FileUsageType.AUDIO;
  } else if (fileType.startsWith('video/')) {
    return FileUsageType.VIDEO;
  } else if (fileType.startsWith('application/pdf')) {
    return FileUsageType.PDF;
  } else {
    return FileUsageType.OTHER;
  }
}

export function useFile() {
  const noteStore = useNoteStore();
  const uploadFile = async (file: File) => {
    try {
      const fileBuffer = await file.arrayBuffer();
      const fileType = file.type;
      const fileUsageType = getFileUsageType(fileType);

      const res = await window.fileAPI.uploadFile(
        Buffer.from(fileBuffer),
        file.name,
        {
          noteId: noteStore.getCurrentNoteId,
          fileType: fileUsageType,
        }
      );
      console.log(res, 11111);
      return res;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return {
    uploadFile,
  };
}
