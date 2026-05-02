import { useEffect, useState, useRef } from "react"
import { useForm } from "@inertiajs/react";
import Button from "@/components/ui/Button";
import defaultAvatar from "@/../../public/avatars/default.png";
import faviconUrl from "@/../../public/favicon.svg";

export default function Onboard() {
  const {data, setData, post, processing, errors} = useForm({
    name: '',
    avatar_url: null as File | null,
    _method: 'put',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/onboard');
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setData('avatar_url', file);
    } else {
      setSelectedFile(null);
      setData('avatar_url', null);
      alert('File gambar tidak valid');
    }
  }

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <div className="relative">
        <div className='absolute -inset-0.75 bg-linear-to-br from-primary-500 to-secondary-400 rounded-2xl opacity-50 drop-shadow-2xl'></div>

        <div className="relative bg-white rounded-[calc(1rem-3px)] p-10">
          <div className="flex items-center gap-10 min-w-120">
            <div onClick={handleImageClick} title="Upload gambar profil" className="group relative flex justify-center items-center size-70 shrink-0 cursor-pointer overflow-hidden rounded-full">
              <img src={previewUrl || defaultAvatar} alt={selectedFile?.name || "Avatar"} className="object-cover w-full h-full group-hover:brightness-50 transition-all duration-300"/>
              <span className="absolute text-white font-medium text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300">Tekan untuk<br/>upload</span>
            </div>

            <form action="submit" onSubmit={submit} className="flex flex-col w-full gap-3">
              <h4 className="text-primary-500">Lengkapi Data Anda</h4>

              <input 
                id="avatar"
                type="file"
                accept="image/*"
                name="avatar"
                onChange={handleChange}
                ref={fileInputRef}
                className="hidden"
              />

              <input
                id="name" 
                type="text"
                name="name"
                placeholder="Username"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                className='w-full px-5 py-2.5 box-border text-base font-brand font-normal placeholder-gray-500 bg-secondary-100 rounded'
              />

              <Button 
                type="submit" 
                disabled={processing}>
                Simpan
              </Button>

              <div className='flex justify-center mt-5'>
                <img src={faviconUrl} alt="Lokacara" className='w-12.5 h-15.5'/>
              </div>
            </form>
          </div>

          
        </div>
      </div>
    </div>
  )
}