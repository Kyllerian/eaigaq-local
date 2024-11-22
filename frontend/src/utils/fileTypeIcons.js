// frontend/src/utils/fileTypeIcons.js

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // Иконка для аудиофайлов

export const getFileTypeIcon = (fileUrl) => {
  const extension = fileUrl.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return <PictureAsPdfIcon sx={{ fontSize: 40 }} color="error" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <ImageIcon sx={{ fontSize: 40 }} color="primary" />;
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return <DescriptionIcon sx={{ fontSize: 40 }} color="action" />;
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'aac':
    case 'flac':
      return <MusicNoteIcon sx={{ fontSize: 40 }} color="secondary" />;
    default:
      return <InsertDriveFileIcon sx={{ fontSize: 40 }} color="disabled" />;
  }
};
