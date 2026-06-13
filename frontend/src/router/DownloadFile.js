import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DownloadFile = () => {
  const { file } = useParams();

  useEffect(() => {
    // Скачивание файла
    const downloadUrl = `/path-to-files/${file}`; // Здесь укажите свой путь к файлам
    window.location.href = downloadUrl;
  }, [file]);

  return;
};

export default DownloadFile;