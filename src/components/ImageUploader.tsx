import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Upload, Loader2, Check, AlertTriangle } from "lucide-react";

// Configurações do Cloudinary
const CLOUDINARY_CLOUD_NAME = "dg7yrvjwu";
const CLOUDINARY_API_KEY = "414784768564958";
// O API Secret NUNCA deve ser exposto no front-end.
// A forma correta de fazer upload do front-end é usando "unsigned uploads"
// ou gerando uma assinatura no back-end.
// Para este exemplo, usaremos um "upload preset" (que precisa ser criado no Cloudinary).

// !!! IMPORTANTE: Crie um "Upload Preset" no seu dashboard Cloudinary
// (Settings > Upload > Upload Presets) e cole o nome dele abaixo.
// Defina-o como "Unsigned".
const CLOUDINARY_UPLOAD_PRESET = "seu_upload_preset_aqui"; // <-- MUDE ISSO

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export default function ImageUploader({
  value,
  onChange,
  label,
}: ImageUploaderProps) {
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (CLOUDINARY_UPLOAD_PRESET === "seu_upload_preset_aqui") {
      setErrorMsg(
        "Erro: Upload preset do Cloudinary não configurado no componente."
      );
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", CLOUDINARY_API_KEY);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      onChange(response.data.secure_url);
      setStatus("success");
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha no upload. Verifique o console.");
      setStatus("error");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    multiple: false,
  });

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer text-center transition-all
        ${
          isDragActive
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 hover:border-gray-400"
        }
        ${status === "error" ? "border-red-500 bg-red-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        {value && status !== "uploading" && (
          <div className="mb-4">
            <img
              src={value}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-full mx-auto shadow-md"
            />
            <p className="text-sm text-gray-500 mt-2">
              Imagem atual. Arraste uma nova para substituir.
            </p>
          </div>
        )}

        {status === "idle" && !value && (
          <div className="flex flex-col items-center text-gray-600">
            <Upload className="w-8 h-8 mb-2" />
            <p className="font-semibold">
              Arraste e solte uma imagem aqui, ou clique para selecionar
            </p>
            <p className="text-sm">PNG, JPG, WEBP</p>
          </div>
        )}

        {status === "uploading" && (
          <div className="flex items-center justify-center text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <p>Enviando...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center justify-center text-emerald-600">
            <Check className="w-6 h-6 mr-2" />
            <p>Upload concluído!</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}
